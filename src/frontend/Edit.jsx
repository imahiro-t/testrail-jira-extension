import React, { useState, useEffect } from "react";
import {
  Form,
  Label,
  Select,
  useForm,
  Box,
  FormSection,
  FormFooter,
  ButtonGroup,
  LoadingButton,
  Button,
  RequiredAsterisk,
} from "@forge/react";
import { invoke, view } from "@forge/bridge";

const FIELD_NAME_PROJECT = "FIELD_NAME_PROJECT";
const FIELD_NAME_RUN = "FIELD_NAME_RUN";

const Edit = ({ project, run, projectId }) => {
  const [renderContext, setRenderContext] = useState(null);
  const [projectResponseJson, setProjectResponseJson] = useState();
  const [runResponseJson, setRunResponseJson] = useState();
  const [selectedProject, setSelectedProject] = useState(project);
  const [selectedRun, setSelectedRun] = useState(run);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    view
      .getContext()
      .then((context) => setRenderContext(context.extension.renderContext));
  }, []);

  useEffect(() => {
    invoke("getProjects", { projectId: projectId }).then(
      setProjectResponseJson
    );
    if (project) {
      invoke("getRuns", {
        projectId: projectId,
        testRailProjectId: project.value,
      }).then(setRunResponseJson);
    }
  }, []);

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

  const { handleSubmit, register, getFieldId, formState } = useForm({
    defaultValues: {
      project: project,
      run: run,
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      data["project"] = selectedProject || undefined;
      data["run"] = selectedRun || undefined;
      await view.submit(data);
    } catch (e) {
      setIsLoading(false);
      console.error(e);
    }
  };

  const handleProjectChange = (data) => {
    setSelectedProject(data);
    invoke("getRuns", {
      projectId: projectId,
      testRailProjectId: data.value,
    }).then(setRunResponseJson);
  };

  const handleRunChange = (data) => {
    setSelectedRun(data);
  };

  return renderContext === "issue-view" ? (
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
            defaultValue={project}
            onChange={handleProjectChange}
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
            defaultValue={run}
            onChange={handleRunChange}
            isClearable={true}
          />
        </Box>
      </FormSection>
      <FormFooter>
        <ButtonGroup>
          <Button appearance="subtle" onClick={view.close}>
            Close
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
      </FormFooter>
      <Box padding="space.500" />
    </Form>
  ) : (
    <Form onSubmit={handleSubmit(onSubmit)}> </Form>
  );
};

export default Edit;
