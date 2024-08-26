import React, { useEffect, useState } from "react";
import ForgeReconciler, {
  Lozenge,
  Link,
  Icon,
  Box,
  Inline,
  Button,
  SectionMessage,
  Text,
  Em,
  useProductContext,
  useIssueProperty,
  Modal,
  ModalBody,
  ModalTransition,
  ModalTitle,
  ModalFooter,
  ModalHeader,
  Form,
  Label,
  Select,
  useForm,
  ButtonGroup,
  LoadingButton,
  RequiredAsterisk,
} from "@forge/react";
import { invoke, events } from "@forge/bridge";

const App = () => {
  const context = useProductContext();
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

const ISSUE_PROPERTY_KEY = "test_run";

const View = ({ project, issue }) => {
  const [property, setProperty] = useIssueProperty(ISSUE_PROPERTY_KEY, {});
  const [testRunInfo, setTestRunInfo] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  useEffect(() => {
    if (property && project && issue) {
      invokeGetTestRunInfo(project.id, issue.id, property.run_id);
    }
  }, [property, project, issue]);

  useEffect(() => {
    events.on("test_run_settings.change", (data) => {
      invokeGetTestRunInfo(project.id, issue.id, data.run_id);
    });
  }, []);

  const invokeGetTestRunInfo = (projectId, issueId, runId) => {
    invoke("getTestRunInfo", {
      projectId: projectId,
      issueId: issueId,
      runId: runId,
    }).then((data) => {
      if (data) {
        setTestRunInfo(data);
      } else {
        setIsInvalid(true);
      }
    });
  };

  return testRunInfo ? (
    <>
      <Box>
        <Inline alignBlock="center" alignInline="end">
          <Button
            appearance="subtle"
            iconAfter="settings"
            spacing="compact"
            onClick={openModal}
          ></Button>
        </Inline>
      </Box>
      {testRunInfo.url && testRunInfo.name && (
        <Box padding="space.050" backgroundColor={color(testRunInfo)}>
          <>
            <Inline space="space.050" alignBlock="center" shouldWrap>
              <Text>
                <Em>{testRunInfo.name}</Em>
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
              <Link href={`${testRunInfo.url}`} openNewTab={true}>
                <Icon glyph="shortcut" label="Shortcut" size="small" />
              </Link>
            </Inline>
          </>
        </Box>
      )}
      <ModalTransition>
        {isOpen && (
          <Edit
            project={project}
            property={property}
            setProperty={setProperty}
            closeModal={closeModal}
          />
        )}
      </ModalTransition>{" "}
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

const FIELD_NAME_PROJECT = "FIELD_NAME_PROJECT";
const FIELD_NAME_RUN = "FIELD_NAME_RUN";

const Edit = ({ project, property, setProperty, closeModal }) => {
  const [projectResponseJson, setProjectResponseJson] = useState();
  const [runResponseJson, setRunResponseJson] = useState();
  const [selectedProject, setSelectedProject] = useState();
  const [selectedRun, setSelectedRun] = useState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSelectedProject(property.project);
    setSelectedRun(property.run);
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

  const { handleSubmit, register, getFieldId, formState } = useForm({});

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      data["project"] = selectedProject || undefined;
      data["run"] = selectedRun || undefined;
      data["run_id"] = selectedRun?.value || undefined;
      await setProperty(data);
      events.emit("test_run_settings.change", data);
      setIsLoading(false);
      closeModal();
    } catch (e) {
      setIsLoading(false);
      console.error(e);
    }
  };

  const handleProjectChange = (data) => {
    setSelectedProject(data);
  };

  const handleRunChange = (data) => {
    setSelectedRun(data);
  };

  return (
    <Modal onClose={closeModal} shouldScrollInViewport={true}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>
          <ModalTitle>Test Run Configuration</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <Box>
            <Label labelFor={getFieldId(FIELD_NAME_PROJECT)}>
              Project
              <RequiredAsterisk />
            </Label>
            <Select
              {...register(FIELD_NAME_PROJECT, {})}
              appearance="default"
              name={FIELD_NAME_PROJECT}
              options={projectOptions}
              onChange={handleProjectChange}
              defaultValue={property.project}
              isClearable={true}
            />
            <Label labelFor={getFieldId(FIELD_NAME_RUN)}>
              Test Run
              <RequiredAsterisk />
            </Label>
            <Select
              {...register(FIELD_NAME_RUN, {})}
              appearance="default"
              name={FIELD_NAME_RUN}
              options={runOptions}
              onChange={handleRunChange}
              defaultValue={property.run}
              isClearable={true}
            />
          </Box>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button onClick={closeModal} appearance="subtle">
              Cancel
            </Button>
            <LoadingButton
              appearance="primary"
              type="submit"
              isLoading={isLoading}
              isDisabled={
                (selectedProject && !selectedRun) ||
                (!selectedProject && selectedRun) ||
                formState.isSubmitting
              }
            >
              Save
            </LoadingButton>
          </ButtonGroup>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
