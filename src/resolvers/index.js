import Resolver from "@forge/resolver";
import { fetch } from "@forge/api";
import api, { route } from "@forge/api";

const PROPERTY_KEY = "testrail_settings_key";
const ISSUE_PROPERTY_KEY = "forge-test_run";
const TEST_RUN_RESULTS_KEY = "test_run_results";

const resultTypes = ["Passed", "Blocked", "Untested", "Retest", "Failed"];

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
  const res = await getUserByEmail(hostname, email, apiKey);
  if (!res) {
    return false;
  }
  const body = {
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
  if (response.status !== 200 && response.status !== 201) {
    return false;
  }
  return true;
};

const deleteSettings = async (projectId) => {
  if (!projectId) {
    return false;
  }
  const response = await api
    .asUser()
    .requestJira(
      route`/rest/api/3/project/${projectId}/properties/${PROPERTY_KEY}`,
      {
        method: "DELETE",
      }
    );
  if (response.status !== 204) {
    return false;
  }
  return true;
};

const getIssueProperty = async (issueId) => {
  if (!issueId) {
    return {};
  }
  const response = await api
    .asUser()
    .requestJira(
      route`/rest/api/3/issue/${issueId}/properties/${ISSUE_PROPERTY_KEY}`,
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

const setIssueProperty = async (data, issueId) => {
  const body = data;
  const response = await api
    .asUser()
    .requestJira(
      route`/rest/api/3/issue/${issueId}/properties/${ISSUE_PROPERTY_KEY}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
  if (response.status !== 200 && response.status !== 201) {
    return false;
  }
  return true;
};

const getUserByEmail = async (hostname, email, apiKey) => {
  if (!(hostname && email && apiKey)) {
    return null;
  }
  const authorization = createAuthorizationHeader(email, apiKey);
  const endpoint = `https://${hostname}/index.php?/api/v2/get_user_by_email&email=${email}`;
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

const getProjects = async (hostname, email, apiKey) => {
  if (!(hostname && email && apiKey)) {
    return [];
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
    return [];
  }
  return (await res.json())["projects"];
};

const getRuns = async (hostname, email, apiKey, testRailProjectId) => {
  if (!(hostname && email && apiKey && testRailProjectId)) {
    return [];
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
    return [];
  }
  return (await res.json())["runs"];
};

const getPlans = async (hostname, email, apiKey, testRailProjectId) => {
  if (!(hostname && email && apiKey && testRailProjectId)) {
    return [];
  }
  const authorization = createAuthorizationHeader(email, apiKey);
  const endpoint = `https://${hostname}/index.php?/api/v2/get_plans/${testRailProjectId}`;
  const res = await fetch(endpoint, {
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    return [];
  }
  return (await res.json())["plans"];
};

const getRun = async (hostname, email, apiKey, runId) => {
  if (!(hostname && email && apiKey && runId)) {
    return {};
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
    return {};
  }
  const run = await res.json();
  return run;
};

const getPlan = async (hostname, email, apiKey, planId) => {
  if (!(hostname && email && apiKey && planId)) {
    return {};
  }
  const authorization = createAuthorizationHeader(email, apiKey);
  const endpoint = `https://${hostname}/index.php?/api/v2/get_plan/${planId}`;
  const res = await fetch(endpoint, {
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    return {};
  }
  const plan = await res.json();
  return plan;
};

const getResultsForRun = async (hostname, email, apiKey, runId) => {
  if (!(hostname && email && apiKey && runId)) {
    return [];
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
    return [];
  }
  const run = await res.json();
  return run["results"] ?? [];
};

const getTestRunInfo = async (
  hostname,
  email,
  apiKey,
  runId,
  planId,
  issueId
) => {
  if (runId > 0) {
    const run = await getRun(hostname, email, apiKey, runId);
    await setTestRunResults(hostname, email, apiKey, run, issueId);
    return {
      passedCount: run["passed_count"],
      blockedCount: run["blocked_count"],
      untestedCount: run["untested_count"],
      retestCount: run["retest_count"],
      failedCount: run["failed_count"],
      url: `https://${hostname}/index.php?/runs/view/${runId}`,
      name: run["name"],
    };
  } else {
    const plan = await getPlan(hostname, email, apiKey, planId);
    await setTestRunResultsByPlan(hostname, email, apiKey, plan, issueId);
    return {
      passedCount: plan["passed_count"],
      blockedCount: plan["blocked_count"],
      untestedCount: plan["untested_count"],
      retestCount: plan["retest_count"],
      failedCount: plan["failed_count"],
      url: `https://${hostname}/index.php?/plans/view/${planId}`,
      name: plan["name"],
    };
  }
};

const setTestRunResults = async (hostname, email, apiKey, run, issueId) => {
  const results = await getResultsForRun(hostname, email, apiKey, run.id);
  const runResults = {
    IssueId: issueId,
    Passed: 0,
    Blocked: 0,
    Untested: 0,
    Retest: 0,
    Failed: 0,
  };
  results.forEach((result) => {
    const status = resultTypes[result["status_id"] - 1];
    runResults[status]++;
  });
  const body = {
    IssueId: runResults.IssueId,
    Passed: run["passed_count"] ?? 0,
    Blocked: run["blocked_count"] ?? 0,
    Untested: run["untested_count"] ?? 0,
    Retest: run["retest_count"] ?? 0,
    Failed: run["failed_count"] ?? 0,
    BlockedTotal: runResults.Blocked,
    RetestTotal: runResults.Retest,
    FailedTotal: runResults.Failed,
  };
  await api
    .asUser()
    .requestJira(
      route`/rest/api/3/issue/${issueId}/properties/${TEST_RUN_RESULTS_KEY}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
  return true;
};

const setTestRunResultsByPlan = async (
  hostname,
  email,
  apiKey,
  plan,
  issueId
) => {
  const runs =
    plan.entries?.reduce((acc, entry) => acc.concat(entry.runs), []) ?? [];
  const results = await runs.reduce(async (acc, run) => {
    const a = await acc;
    const r = await getResultsForRun(hostname, email, apiKey, run.id);
    return a.concat(r);
  }, []);
  const runResults = {
    IssueId: issueId,
    Passed: 0,
    Blocked: 0,
    Untested: 0,
    Retest: 0,
    Failed: 0,
  };
  results.forEach((result) => {
    const status = resultTypes[result["status_id"] - 1];
    runResults[status]++;
  });
  const body = {
    IssueId: runResults.IssueId,
    Passed: plan["passed_count"] ?? 0,
    Blocked: plan["blocked_count"] ?? 0,
    Untested: plan["untested_count"] ?? 0,
    Retest: plan["retest_count"] ?? 0,
    Failed: plan["failed_count"] ?? 0,
    BlockedTotal: runResults.Blocked,
    RetestTotal: runResults.Retest,
    FailedTotal: runResults.Failed,
  };
  await api
    .asUser()
    .requestJira(
      route`/rest/api/3/issue/${issueId}/properties/${TEST_RUN_RESULTS_KEY}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
  return true;
};

const resolver = new Resolver();

resolver.define("getSettings", async (req) => {
  const { projectId } = req.payload;
  return await getSettings(projectId);
});

resolver.define("setSettings", async (req) => {
  const { hostname, email, apiKey, projectId } = req.payload;
  let fixedHostname = hostname;
  try {
    if (
      fixedHostname.startsWith("https://") ||
      fixedHostname.startsWith("http://")
    ) {
      fixedHostname = new URL(fixedHostname).hostname;
    }
  } catch (e) {}
  return await setSettings(fixedHostname, email, apiKey, projectId);
});

resolver.define("deleteSettings", async (req) => {
  const { projectId } = req.payload;
  return await deleteSettings(projectId);
});

resolver.define("getProjects", async (req) => {
  const { projectId } = req.payload;
  const { hostname, email, apiKey } = await getSettings(projectId);
  return await getProjects(hostname, email, apiKey);
});

resolver.define("getIssueProperty", async (req) => {
  const { issueId } = req.payload;
  return await getIssueProperty(issueId);
});

resolver.define("setIssueProperty", async (req) => {
  const { data, issueId } = req.payload;
  return await setIssueProperty(data, issueId);
});

resolver.define("getRuns", async (req) => {
  const { projectId, testRailProjectId } = req.payload;
  const { hostname, email, apiKey } = await getSettings(projectId);
  return await getRuns(hostname, email, apiKey, testRailProjectId);
});

resolver.define("getPlans", async (req) => {
  const { projectId, testRailProjectId } = req.payload;
  const { hostname, email, apiKey } = await getSettings(projectId);
  return await getPlans(hostname, email, apiKey, testRailProjectId);
});

resolver.define("getTestRunInfo", async (req) => {
  const { projectId, issueId, runId, planId } = req.payload;
  const { hostname, email, apiKey } = await getSettings(projectId);
  if (!(hostname && email && apiKey)) {
    return false;
  }
  return await getTestRunInfo(hostname, email, apiKey, runId, planId, issueId);
});

export const handler = resolver.getDefinitions();

// for dashboard

const SEARCH_ISSUES_MAX_RESULTS = 100;

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
  const { project, dateTimeField, dateFromStr, dateToStr } = req.payload;

  const dateFrom = new Date(dateFromStr);
  const dateTo = new Date(dateToStr);
  dateTo.setDate(dateTo.getDate() + 1);

  const jql = `project = ${project} AND (TestRunPassed > 0 OR TestRunBlocked > 0 OR TestRunRetest > 0 OR TestRunFailed > 0) AND ${clauseName(
    dateTimeField
  )} >= ${createTermCondition(dateFrom)} AND ${clauseName(
    dateTimeField
  )} < ${createTermCondition(dateTo)} ORDER BY ${clauseName(
    dateTimeField
  )} ASC`;

  const body = {
    fields: [dateTimeField],
    properties: [TEST_RUN_RESULTS_KEY],
    fieldsByKeys: false,
    jql: jql,
    maxResults: SEARCH_ISSUES_MAX_RESULTS,
    startAt: 0,
  };

  const issues = await searchIssuesRecursive(body, 0, []);

  return issues
    .map((issue) => {
      const result = issue.properties
        ? issue.properties[TEST_RUN_RESULTS_KEY] ?? {}
        : {};
      if (result.IssueId) {
        result["IssueKey"] = issue.key;
        result["Blocked"] = result.BlockedTotal ?? result.Blocked ?? 0;
        result["Retest"] = result.RetestTotal ?? result.Retest ?? 0;
        result["Failed"] = result.FailedTotal ?? result.Failed ?? 0;
        return result;
      } else {
        return null;
      }
    })
    .filter((x) => !!x);
});

const searchIssuesRecursive = async (body, startAt, acc) => {
  body.startAt = startAt;
  const response = await api.asUser().requestJira(route`/rest/api/3/search`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (json.startAt + json.maxResults < json.total) {
    return searchIssuesRecursive(
      body,
      startAt + SEARCH_ISSUES_MAX_RESULTS,
      acc.concat(json.issues ?? [])
    );
  } else {
    return acc.concat(json.issues ?? []);
  }
};

const createTermCondition = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};
