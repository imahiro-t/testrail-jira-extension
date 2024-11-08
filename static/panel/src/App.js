import React, { useEffect, useState } from "react";

import { Box, Inline, Stack, Text } from "@atlaskit/primitives";
import { ButtonGroup } from "@atlaskit/button";
import Button, { IconButton } from "@atlaskit/button/new";
import Lozenge from "@atlaskit/lozenge";
import SettingsIcon from "@atlaskit/icon/glyph/settings";
import ShortcutIcon from "@atlaskit/icon/glyph/shortcut";
import SectionMessage from "@atlaskit/section-message";
import Select from "@atlaskit/select";

import { invoke, view, router, events } from "@forge/bridge";

const App = () => {
  const [context, setContext] = useState();
  useEffect(async () => {
    await view.theme.enable();
  }, []);
  useEffect(() => {
    view.getContext().then(setContext);
  }, []);
  if (!context) {
    return " ";
  }

  const {
    extension: { project, issue },
  } = context;
  return <View project={project} issue={issue} />;
};

const color = (testRunInfo) => {
  if (
    testRunInfo.passedCount > 0 &&
    testRunInfo.blockedCount === 0 &&
    testRunInfo.retestCount === 0 &&
    testRunInfo.failedCount === 0 &&
    testRunInfo.untestedCount === 0
  ) {
    return "color.background.accent.green.subtlest";
  } else if (
    testRunInfo.failedCount > 0 ||
    testRunInfo.blockedCount > 0 ||
    testRunInfo.retestCount > 0
  ) {
    return "color.background.accent.red.subtlest";
  } else if (
    testRunInfo.passedCount > 0 &&
    testRunInfo.blockedCount === 0 &&
    testRunInfo.retestCount === 0 &&
    testRunInfo.failedCount === 0 &&
    testRunInfo.untestedCount > 0
  ) {
    return "color.background.accent.yellow.subtlest";
  } else {
    return "color.background.accent.gray.subtlest";
  }
};

const View = ({ project, issue }) => {
  const [issueProperty, setIssueProperty] = useState();
  const [testRunInfo, setTestRunInfo] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const openConfiguration = () => setIsOpen(true);
  const closeConfiguration = () => setIsOpen(false);

  useEffect(() => {
    invoke("getIssueProperty", {
      projectId: project.id,
      issueId: issue.id,
    }).then((data) => {
      setIssueProperty(data);
    });
  }, []);

  useEffect(() => {
    if (issueProperty && project && issue) {
      invokeGetTestRunInfo(
        project.id,
        issue.id,
        issueProperty.run_id,
        issueProperty.plan_id
      );
    }
  }, [issueProperty, project, issue]);

  useEffect(() => {
    events.on("test_run_settings.change", (data) => {
      invokeGetTestRunInfo(project.id, issue.id, data.run_id, data.plan_id);
    });
  }, []);

  const invokeGetTestRunInfo = (projectId, issueId, runId, planId) => {
    invoke("getTestRunInfo", {
      projectId: projectId,
      issueId: issueId,
      runId: runId,
      planId: planId,
    }).then((data) => {
      if (data) {
        setTestRunInfo(data);
      } else {
        setIsInvalid(true);
      }
    });
  };

  const Link = ({ children, href }) => {
    const handleNavigate = () => {
      router.open(href);
    };

    return (
      <a style={{ cursor: "pointer" }} onClick={handleNavigate}>
        {children} <ShortcutIcon size="small" label="" />
      </a>
    );
  };

  return testRunInfo ? (
    <>
      {testRunInfo.url && testRunInfo.name && (
        <Box padding="space.050" backgroundColor={color(testRunInfo)}>
          <>
            <Inline space="space.050" alignBlock="center" shouldWrap>
              <Text size="small" as="strong">
                {testRunInfo.name}
              </Text>
            </Inline>
            <Inline space="space.050" alignBlock="center" shouldWrap>
              <Lozenge appearance="success" isBold>
                {"Passed: " + (testRunInfo.passedCount || 0)}
              </Lozenge>
              <Lozenge appearance="default" isBold>
                {"Blocked: " + (testRunInfo.blockedCount || 0)}
              </Lozenge>
              <Lozenge appearance="moved" isBold>
                {"Retest: " + (testRunInfo.retestCount || 0)}
              </Lozenge>
              <Lozenge appearance="removed" isBold>
                {"Failed: " + (testRunInfo.failedCount || 0)}
              </Lozenge>
              <Lozenge appearance="default">
                {"Untested: " + (testRunInfo.untestedCount || 0)}
              </Lozenge>
              <Link href={`${testRunInfo.url}`} target="_blank"></Link>
            </Inline>
          </>
        </Box>
      )}
      {!isOpen && (
        <Box padding="space.050">
          <Inline alignBlock="center" alignInline="end">
            <IconButton
              icon={SettingsIcon}
              appearance="subtle"
              spacing="compact"
              onClick={openConfiguration}
            ></IconButton>
          </Inline>
        </Box>
      )}
      {isOpen && (
        <Config
          project={project}
          issue={issue}
          issueProperty={issueProperty}
          setIssueProperty={setIssueProperty}
          closeConfiguration={closeConfiguration}
        />
      )}
    </>
  ) : (
    <>
      {!isInvalid && <>Loading...</>}
      {isInvalid && (
        <SectionMessage appearance="warning">
          <Text>
            TestRail Configuration is required. Please configure in the Project
            settings.
          </Text>
        </SectionMessage>
      )}
    </>
  );
};

const Config = ({
  project,
  issue,
  issueProperty,
  setIssueProperty,
  closeConfiguration,
}) => {
  const [projectResponseJson, setProjectResponseJson] = useState();
  const [runResponseJson, setRunResponseJson] = useState();
  const [planResponseJson, setPlanResponseJson] = useState();
  const [selectedProject, setSelectedProject] = useState();
  const [selectedRun, setSelectedRun] = useState();
  const [selectedPlan, setSelectedPlan] = useState();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedProject(issueProperty.project);
    setSelectedRun(issueProperty.run);
    setSelectedPlan(issueProperty.plan);
  }, []);

  useEffect(() => {
    invoke("getProjects", { projectId: project.id }).then(
      setProjectResponseJson
    );
  }, []);

  useEffect(() => {
    if (selectedProject) {
      invoke("getRuns", {
        projectId: project.id,
        testRailProjectId: selectedProject.value,
      }).then(setRunResponseJson);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject) {
      invoke("getPlans", {
        projectId: project.id,
        testRailProjectId: selectedProject.value,
      }).then(setPlanResponseJson);
    }
  }, [selectedProject]);

  const projectOptions = projectResponseJson
    ? projectResponseJson.map((project) => ({
        label: project.name,
        value: project.id,
      }))
    : [];

  const runOptions = runResponseJson
    ? runResponseJson.map((run) => ({
        label: run.name,
        value: run.id,
      }))
    : [];

  const planOptions = planResponseJson
    ? planResponseJson.map((plan) => ({
        label: plan.name,
        value: plan.id,
      }))
    : [];

  const saveConfiguration = (event) => {
    setIsSaving(true);
    const newIssueProperty = {
      project: selectedProject || undefined,
      run: selectedRun || undefined,
      run_id: selectedRun?.value || undefined,
      plan: selectedPlan || undefined,
      plan_id: selectedPlan?.value || undefined,
    };
    invoke("setIssueProperty", {
      data: newIssueProperty,
      projectId: project.id,
      issueId: issue.id,
    })
      .then((data) => {
        if (data) {
          setIssueProperty(newIssueProperty);
        }
        closeConfiguration();
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const handleProjectChange = (data) => {
    setSelectedProject(data);
  };

  const handleRunChange = (data) => {
    setSelectedRun(data);
  };

  const handlePlanChange = (data) => {
    setSelectedPlan(data);
  };

  return (
    <>
      <Box padding="space.100"></Box>
      <Box backgroundColor="color.background.input.hovered">
        <Box padding="space.050">
          <Text weight="bold">Configuration</Text>
        </Box>
        <Box padding="space.050">
          <Stack>
            <Text size="small" weight="bold">
              Project
            </Text>
            <Select
              appearance="default"
              options={projectOptions}
              onChange={handleProjectChange}
              defaultValue={issueProperty.project}
              isClearable={true}
              spacing="compact"
              maxMenuHeight={120}
            />
            <Text size="small" weight="bold">
              Test Run
            </Text>
            <Select
              appearance="default"
              options={runOptions}
              onChange={handleRunChange}
              defaultValue={issueProperty.run}
              isClearable={true}
              spacing="compact"
              maxMenuHeight={120}
              isDisabled={selectedPlan}
            />
            <Text size="small" weight="bold">
              Test Plan
            </Text>
            <Select
              appearance="default"
              options={planOptions}
              onChange={handlePlanChange}
              defaultValue={issueProperty.plan}
              isClearable={true}
              spacing="compact"
              maxMenuHeight={120}
              isDisabled={selectedRun}
            />
          </Stack>
        </Box>
        <Box padding="space.050">
          <ButtonGroup>
            <Button
              onClick={saveConfiguration}
              appearance="primary"
              isLoading={isSaving}
              isDisabled={
                (selectedProject && !selectedRun && !selectedPlan) ||
                (!selectedProject && (selectedRun || selectedPlan))
              }
            >
              Save
            </Button>
            <Button onClick={closeConfiguration} appearance="subtle">
              Cancel
            </Button>
          </ButtonGroup>
        </Box>
      </Box>
      <Box padding="space.600"></Box>
    </>
  );
};

export default App;
