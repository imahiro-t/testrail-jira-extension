import Resolver from "@forge/resolver";
import { fetch } from "@forge/api";
import api, { route } from "@forge/api";

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
  const res = await getUserByEmail(hostname, email, apiKey);
  if (!res) {
    return false;
  }
  const body = {
    hostname: hostname,
    email: email,
    apiKey: apiKey,
  };
  await api
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
  run["test_run_url"] = `https://${hostname}/index.php?/runs/view/${runId}`;
  return run;
};

const getTestRunInfo = async (hostname, email, apiKey, runId) => {
  const run = await getRun(hostname, email, apiKey, runId);
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
  const { hostname, email, apiKey } = await getSettings(projectId);
  return await getProjects(hostname, email, apiKey);
});

resolver.define("getRuns", async (req) => {
  const { projectId, testRailProjectId } = req.payload;
  const { hostname, email, apiKey } = await getSettings(projectId);
  return await getRuns(hostname, email, apiKey, testRailProjectId);
});

resolver.define("getTestRunInfo", async (req) => {
  const { projectId, runId } = req.payload;
  const { hostname, email, apiKey } = await getSettings(projectId);
  if (!(hostname && email && apiKey)) {
    return false;
  }
  return await getTestRunInfo(hostname, email, apiKey, runId);
});

export const handler = resolver.getDefinitions();
