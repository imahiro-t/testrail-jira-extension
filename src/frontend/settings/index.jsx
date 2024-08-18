import React, { useState, useEffect } from "react";
import ForgeReconciler from "@forge/react";
import { useProductContext } from "@forge/react";
import {
  Form,
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
  const [hostname, setHostname] = useState();
  const [email, setEmail] = useState();
  const [apiKey, setApiKey] = useState();
  const [projectId, setProjectId] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const { handleSubmit, register, getFieldId, formState } = useForm();
  const context = useProductContext();
  useEffect(() => {
    if (context) {
      const id = context.extension.project.id;
      setProjectId(id);
      invoke("getSettings", { projectId: id }).then((settings) => {
        setHostname(settings["hostname"]);
        setEmail(settings["email"]);
        setApiKey(settings["apiKey"]);
      });
    }
  }, [context]);
  if (!context) {
    return " ";
  }

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      if (!data[FIELD_NAME_HOSTNAME]) {
        data[FIELD_NAME_HOSTNAME] = hostname;
      }
      if (!data[FIELD_NAME_EMAIL]) {
        data[FIELD_NAME_EMAIL] = email;
      }
      if (!data[FIELD_NAME_API_KEY]) {
        data[FIELD_NAME_API_KEY] = apiKey;
      }
      await invoke("setSettings", {
        hostname: data[FIELD_NAME_HOSTNAME],
        email: data[FIELD_NAME_EMAIL],
        apiKey: data[FIELD_NAME_API_KEY],
        projectId: projectId,
      });
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
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
      <FormSection>
        <Label labelFor={getFieldId(FIELD_NAME_HOSTNAME)}>
          TestRail Hostname
        </Label>
        <Textfield
          {...register(FIELD_NAME_HOSTNAME, {})}
          onChange={handleHostnameChange}
          placeholder={hostname}
        />
        <Label labelFor={getFieldId(FIELD_NAME_EMAIL)}>
          TestRail User Email
        </Label>
        <Textfield
          {...register(FIELD_NAME_EMAIL, {})}
          onChange={handleEmailChange}
          placeholder={email}
        />
        <Label labelFor={getFieldId(FIELD_NAME_API_KEY)}>
          TestRail API Key
        </Label>
        <Textfield
          {...register(FIELD_NAME_API_KEY, {})}
          onChange={handleApiKeyChange}
          placeholder={apiKey ? "**********" : ""}
        />
      </FormSection>
      <FormFooter>
        <ButtonGroup>
          <LoadingButton
            appearance="primary"
            type="submit"
            isLoading={isLoading}
            isDisabled={
              !(hostname && email && apiKey) || formState.isSubmitting
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
