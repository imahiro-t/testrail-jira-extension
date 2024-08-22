import React, { useEffect, useState } from "react";
import ForgeReconciler, {
  Form,
  Label,
  Select,
  useForm,
  Box,
  FormSection,
  FormFooter,
  ButtonGroup,
  LoadingButton,
  RequiredAsterisk,
  useProductContext,
  useIssueProperty,
} from "@forge/react";
import { invoke, events } from "@forge/bridge";

const FIELD_NAME_PROJECT = "FIELD_NAME_PROJECT";
const FIELD_NAME_RUN = "FIELD_NAME_RUN";

const App = () => {
  const context = useProductContext();
  if (!context) {
    return " ";
  }
  const {
    extension: { project },
  } = context;
  return <Edit project={project} />;
};

const Edit = ({ project }) => {
  const [property, setProperty] = useIssueProperty("test_run", {});
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
