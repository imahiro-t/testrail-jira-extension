import React, { useState, useEffect } from "react";
import ForgeReconciler from "@forge/react";
import { useProductContext } from "@forge/react";
import {
  Form,
  SectionMessage,
  Text,
  Label,
  Textfield,
  useForm,
  FormSection,
  FormFooter,
  ButtonGroup,
  LoadingButton,
} from "@forge/react";
import { invoke } from "@forge/bridge";

const FIELD_NAME_HOSTNAME = "FIELD_NAME_HOSTNAME";
const FIELD_NAME_EMAIL = "FIELD_NAME_EMAIL";
const FIELD_NAME_API_KEY = "FIELD_NAME_API_KEY";

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
  const [hostname, setHostname] = useState();
  const [email, setEmail] = useState();
  const [apiKey, setApiKey] = useState();
  const [isExist, setIsExist] = useState(false);
  const [projectId, setProjectId] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [isDeleteInvalid, setIsDeleteInvalid] = useState(false);
  const { handleSubmit, register, getFieldId, formState } = useForm();

  useEffect(() => {
    const id = project.id;
    setProjectId(id);
    invoke("getSettings", { projectId: id }).then((settings) => {
      setHostname(settings["hostname"]);
      setEmail(settings["email"]);
      setApiKey(settings["apiKey"]);
      setIsExist(
        settings["hostname"] && settings["email"] && settings["apiKey"]
      );
    });
  }, []);

  const onSubmit = async (data) => {
    try {
      setIsInvalid(false);
      setIsDeleteInvalid(false);
      setIsLoading(true);
      data[FIELD_NAME_HOSTNAME] = hostname;
      data[FIELD_NAME_EMAIL] = email;
      data[FIELD_NAME_API_KEY] = apiKey;
      const res = await invoke("setSettings", {
        hostname: data[FIELD_NAME_HOSTNAME],
        email: data[FIELD_NAME_EMAIL],
        apiKey: data[FIELD_NAME_API_KEY],
        projectId: projectId,
      });
      setIsInvalid(!res);
      setIsLoading(false);
      if (res) {
        setIsExist(true);
      }
    } catch (e) {
      setIsInvalid(true);
      setIsLoading(false);
      console.error(e);
    }
  };

  const deleteSetting = async () => {
    try {
      setIsInvalid(false);
      setIsDeleteInvalid(false);
      setIsDeleteLoading(true);
      const res = await invoke("deleteSettings", {
        projectId: projectId,
      });
      setIsDeleteInvalid(!res);
      setIsDeleteLoading(false);
      if (res) {
        setHostname("");
        setEmail("");
        setIsExist(false);
      }
    } catch (e) {
      setIsDeleteInvalid(true);
      setIsDeleteLoading(false);
      console.error(e);
    }
  };

  const handleHostnameChange = (data) => {
    setHostname(data.target.value);
  };

  const handleEmailChange = (data) => {
    setEmail(data.target.value);
  };

  const handleApiKeyChange = (data) => {
    setApiKey(data.target.value);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {isInvalid && (
        <SectionMessage appearance="error">
          <Text>An error occurred while saving. Please check your input.</Text>
        </SectionMessage>
      )}
      {isDeleteInvalid && (
        <SectionMessage appearance="error">
          <Text>An error occurred while deleting.</Text>
        </SectionMessage>
      )}
      <FormSection>
        <Label labelFor={getFieldId(FIELD_NAME_HOSTNAME)}>
          TestRail Hostname
        </Label>
        <Textfield
          {...register(FIELD_NAME_HOSTNAME, {})}
          onChange={handleHostnameChange}
          placeholder={hostname ?? "example.testrail.com"}
          value={hostname}
        />
        <Label labelFor={getFieldId(FIELD_NAME_EMAIL)}>
          TestRail User Email
        </Label>
        <Textfield
          {...register(FIELD_NAME_EMAIL, {})}
          onChange={handleEmailChange}
          value={email}
        />
        <Label labelFor={getFieldId(FIELD_NAME_API_KEY)}>
          TestRail API Key
        </Label>
        <Textfield
          {...register(FIELD_NAME_API_KEY, {})}
          onChange={handleApiKeyChange}
          placeholder={apiKey ? "****************" : ""}
        />
      </FormSection>
      <FormFooter>
        <ButtonGroup>
          <LoadingButton
            appearance="danger"
            type="button"
            onClick={deleteSetting}
            isLoading={isDeleteLoading}
            isDisabled={formState.isSubmitting || isDeleteLoading || !isExist}
          >
            Delete
          </LoadingButton>
          <LoadingButton
            appearance="primary"
            type="submit"
            isLoading={isLoading}
            isDisabled={
              !(hostname && email && apiKey) ||
              formState.isSubmitting ||
              isDeleteLoading
            }
          >
            Save
          </LoadingButton>
        </ButtonGroup>
      </FormFooter>
    </Form>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
