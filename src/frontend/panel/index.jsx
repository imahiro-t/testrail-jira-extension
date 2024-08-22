import React, { useEffect, useState } from "react";
import ForgeReconciler, {
  Lozenge,
  Link,
  Icon,
  Box,
  Inline,
  Button,
  useProductContext,
  useIssueProperty,
} from "@forge/react";
import {
  Modal,
  ModalBody,
  ModalTransition,
  ModalTitle,
  ModalFooter,
  ModalHeader,
} from "@forge/react";
import {
  Form,
  Label,
  Select,
  useForm,
  FormSection,
  FormFooter,
  ButtonGroup,
  LoadingButton,
  RequiredAsterisk,
} from "@forge/react";
import { invoke, events } from "@forge/bridge";

const FIELD_NAME_PROJECT = "FIELD_NAME_PROJECT";
const FIELD_NAME_RUN = "FIELD_NAME_RUN";

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

const App = () => {
  const context = useProductContext();
  if (!context) {
    return " ";
  }
  const {
    extension: { project },
  } = context;
  return <View project={project} />;
};

const View = ({ project }) => {
  const [property, setProperty] = useIssueProperty("test_run", {});
  const [testRunInfo, setTestRunInfo] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  useEffect(() => {
    const invokeGetTestRunInfo = (projectId, runId) => {
      invoke("getTestRunInfo", {
        projectId: projectId,
        runId: runId,
      }).then((data) => {
        setTestRunInfo(data);
      });
    };
    if (property) {
      invokeGetTestRunInfo(project.id, property.run_id);
      events.on("test_run_settings.change", (data) => {
        invokeGetTestRunInfo(project.id, data.run_id);
      });
    }
  }, [property]);

  return testRunInfo ? (
    <>
      <Box padding="space.050" backgroundColor={color(testRunInfo)}>
        <Inline spread="space-between" alignBlock="center">
          <Inline space="space.050" alignBlock="center" shouldWrap>
            {testRunInfo.url && (
              <>
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
                <Link href={`${testRunInfo.url || ""}`} openNewTab={true}>
                  <Icon glyph="shortcut" label="Shortcut" size="small" />
                </Link>
              </>
            )}
          </Inline>
          <Inline alignBlock="center">
            <Button
              appearance="subtle"
              iconAfter="settings"
              spacing="compact"
              onClick={openModal}
              shouldWrap
            ></Button>
          </Inline>
        </Inline>
      </Box>
      <ModalTransition>
        {isOpen && (
          <Modal onClose={closeModal}>
            <ModalHeader>
              <ModalTitle>Duplicate this page</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <Edit
                project={project}
                property={property}
                setProperty={setProperty}
                closeModal={closeModal}
              />
            </ModalBody>
            <ModalFooter></ModalFooter>
          </Modal>
        )}
      </ModalTransition>{" "}
    </>
  ) : (
    <>Loading...</>
  );
};

const Edit = ({ project, property, setProperty, closeModal }) => {
  // const [property, setProperty] = useIssueProperty("test_run", {});
  const [projectResponseJson, setProjectResponseJson] = useState();
  const [runResponseJson, setRunResponseJson] = useState();
  const [selectedProject, setSelectedProject] = useState();
  const [selectedRun, setSelectedRun] = useState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (property) {
      setSelectedProject(property.project);
      setSelectedRun(property.run);
    }
  }, [property]);

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
      setIsLoading(false);
      events.emit("test_run_settings.change", data);
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

  return property !== undefined ? (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormSection>
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
      </FormSection>
      <FormFooter>
        <ButtonGroup>
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
      </FormFooter>
      <Box padding="space.500" />
    </Form>
  ) : (
    <>Loading...</>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
