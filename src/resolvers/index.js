import Resolver from "@forge/resolver";
import { fetch } from "@forge/api";
import api, { route } from "@forge/api";
import { REPORT_TYPE } from "../const";

const PROPERTY_KEY = "testrail_settings_key";

const createAuthorizationHeader = (email, apiKey) => {
  return `Basic ${btoa(email + ":" + apiKey)}`;
};

const getSettings = async (projectId) => {
  if (!projectId) {
    return {};
  }
  const response = await api
    .asUser()
    .requestJira(
      route`/rest/api/3/project/${projectId}/properties/${PROPERTY_KEY}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
  if (response.status !== 200) {
    return {};
  }
  return (await response.json())["value"];
};

const setSettings = async (hostname, email, apiKey, projectId) => {
  var body = {
    hostname: hostname,
    email: email,
    apiKey: apiKey,
  };
  const response = await api
    .asUser()
    .requestJira(
      route`/rest/api/3/project/${projectId}/properties/${PROPERTY_KEY}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
  return response;
};

const getProjects = async (projectId) => {
  const { hostname, email, apiKey } = await getSettings(projectId);
  if (!(hostname && email && apiKey)) {
    return null;
  }
  const authorization = createAuthorizationHeader(email, apiKey);
  const endpoint = `https://${hostname}/index.php?/api/v2/get_projects`;
  const res = await fetch(endpoint, {
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    return null;
  }
  return (await res.json())["projects"];
};

const getRuns = async (projectId, testRailProjectId) => {
  const { hostname, email, apiKey } = await getSettings(projectId);
  if (!(hostname && email && apiKey)) {
    return null;
  }
  const authorization = createAuthorizationHeader(email, apiKey);
  const endpoint = `https://${hostname}/index.php?/api/v2/get_runs/${testRailProjectId}`;
  const res = await fetch(endpoint, {
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    return null;
  }
  return (await res.json())["runs"];
};

const getRun = async (projectId, runId) => {
  if (!(projectId && runId)) {
    return null;
  }
  const { hostname, email, apiKey } = await getSettings(projectId);
  if (!(hostname && email && apiKey)) {
    return null;
  }
  const authorization = createAuthorizationHeader(email, apiKey);
  const endpoint = `https://${hostname}/index.php?/api/v2/get_run/${runId}`;
  const res = await fetch(endpoint, {
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    return null;
  }
  const run = await res.json();
  run["test_run_url"] = `https://${hostname}/index.php?/runs/view/${runId}`;
  return run;
};

const getTestRunInfo = async (projectId, runId) => {
  if (!(projectId && runId)) {
    return {};
  }
  const run = await getRun(projectId, runId);
  if (!run) {
    return {};
  }
  return {
    passedCount: run["passed_count"],
    blockedCount: run["blocked_count"],
    untestedCount: run["untested_count"],
    retestCount: run["retest_count"],
    failedCount: run["failed_count"],
    url: run["test_run_url"],
  };
};

const resolver = new Resolver();

resolver.define("getSettings", async (req) => {
  const { projectId } = req.payload;
  return await getSettings(projectId);
});

resolver.define("setSettings", async (req) => {
  const { hostname, email, apiKey, projectId } = req.payload;
  return await setSettings(hostname, email, apiKey, projectId);
});

resolver.define("getProjects", async (req) => {
  const { projectId } = req.payload;
  return await getProjects(projectId);
});

resolver.define("getRuns", async (req) => {
  const { projectId, testRailProjectId } = req.payload;
  return await getRuns(projectId, testRailProjectId);
});

resolver.define("getTestRunInfo", async (req) => {
  const { projectId, runId } = req.payload;
  return await getTestRunInfo(projectId, runId);
});

export const handler = resolver.getDefinitions();

// for dashboard

const clauseName = (id) => {
  const CUSTOM_FIELD_PREFIX = "customfield_";
  if (id.startsWith(CUSTOM_FIELD_PREFIX)) {
    return `cf[${id.slice(CUSTOM_FIELD_PREFIX.length)}]`;
  } else {
    return id;
  }
};

resolver.define("getRecentProjects", async (req) => {
  const response = await api
    .asUser()
    .requestJira(route`/rest/api/3/project/recent`, {
      headers: {
        Accept: "application/json",
      },
    });
  return await response.json();
});

resolver.define("getDateTimeFields", async (req) => {
  const response = await api.asUser().requestJira(route`/rest/api/3/field`, {
    headers: {
      Accept: "application/json",
    },
  });
  return (await response.json()).filter(
    (field) => field.schema && field.schema.type === "datetime"
  );
});

resolver.define("searchResults", async (req) => {
  const { project, dateTimeField, reportType, dateFromStr, dateToStr } =
    req.payload;

  const testRunFieldId = await getTestRunFieldId();
  if (!testRunFieldId) {
    return [];
  }

  const dateFrom = new Date(dateFromStr);
  const dateTo = new Date(dateToStr);

  const runIds = await getRunIds(
    project,
    testRunFieldId,
    dateTimeField,
    dateFrom,
    dateTo
  );

  const store =
    reportType === REPORT_TYPE.WEEKLY
      ? initWeeklyStore(resultTypes, dateFrom, dateTo)
      : initMonthlyStore(resultTypes, dateFrom, dateTo);

  await Promise.all(
    runIds.map(async (runId) => {
      const results = (await getResultsForRun(project, runId))["results"];
      results &&
        results.forEach((result) => {
          const status = resultTypes[result["status_id"] - 1];
          const date = new Date(result["created_on"] * 1000);
          const term =
            reportType === REPORT_TYPE.WEEKLY
              ? createWeeklyTermKey(date)
              : createMonthlyTermKey(date);
          const key = `${term}-${status}`;
          if (store[key]) {
            store[key].count++;
          }
        });
    })
  );
  return Object.keys(store)
    .sort()
    .map((key) => store[key]);
});

const getTestRunFieldId = async () => {
  const fieldsResponse = await api
    .asUser()
    .requestJira(route`/rest/api/3/field`, {
      headers: {
        Accept: "application/json",
      },
    });
  return (await fieldsResponse.json()).find(
    (field) =>
      field.schema &&
      field.schema?.type === "object" &&
      field.name === "TestRail"
  )["id"];
};

const getRunIds = async (
  project,
  testRunFieldId,
  dateTimeField,
  dateFrom,
  dateTo
) => {
  const jql = `project = ${project} and ${clauseName(
    testRunFieldId
  )} IS NOT EMPTY and ${clauseName(dateTimeField)} >= ${createTermCondition(
    dateFrom
  )} and ${clauseName(dateTimeField)} < ${createTermCondition(dateTo)}`;

  var bodyData = `{
    "expand": [
    ],
    "fields": [
      "${dateTimeField}",
      "${testRunFieldId}"
    ],
    "fieldsByKeys": false,
    "jql": "${jql}",
    "maxResults": 10000,
    "startAt": 0
  }`;

  const response = await api.asUser().requestJira(route`/rest/api/3/search`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: bodyData,
  });

  const unique = (value, index, array) => array.indexOf(value) === index;

  return ((await response.json()).issues ?? [])
    .map((issue) => issue.fields[testRunFieldId]["run"]?.value)
    .filter((runId) => runId)
    .filter(unique);
};

const getResultsForRun = async (projectId, runId) => {
  const { hostname, email, apiKey } = await getSettings(projectId);
  if (!(hostname && email && apiKey)) {
    return null;
  }
  const authorization = createAuthorizationHeader(email, apiKey);
  const endpoint = `https://${hostname}/index.php?/api/v2/get_results_for_run/${runId}`;
  const res = await fetch(endpoint, {
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    return null;
  }
  return await res.json();
};

const resultTypes = ["Passed", "Blocked", "Untested", "Retest", "Failed"];

const createTermCondition = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createMonthlyTermKey = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
};

const createWeeklyTermKey = (date) => {
  // shift to Monday
  if (date.getDay() === 0) {
    date.setDate(date.getDate() - 6);
  } else if (date.getDay() > 1) {
    date.setDate(date.getDate() - date.getDay() + 1);
  }
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const initMonthlyStore = (results, dateFrom, dateTo) => {
  const store = {};
  dateFrom.setHours(0, 0, 0, 0);
  dateTo.setHours(0, 0, 0, 0);
  while (dateTo >= dateFrom) {
    const term = createMonthlyTermKey(dateTo);
    results.forEach((result) => {
      const key = `${term}-${result}`;
      store[key] = { term: term, count: 0, result: result };
    });
    dateTo.setMonth(dateTo.getMonth() - 1);
  }
  return store;
};

const initWeeklyStore = (results, dateFrom, dateTo) => {
  const store = {};
  dateFrom.setHours(0, 0, 0, 0);
  dateTo.setHours(0, 0, 0, 0);
  dateFrom.setDate(dateFrom.getDate() - 6);
  while (dateTo >= dateFrom) {
    const term = createWeeklyTermKey(dateTo);
    results.forEach((result) => {
      const key = `${term}-${result}`;
      store[key] = { term: term, count: 0, result: result };
    });
    dateTo.setDate(dateTo.getDate() - 7);
  }
  return store;
};
