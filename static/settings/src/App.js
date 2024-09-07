import React, { useEffect, useState } from "react";

import { Box, Inline, Stack, Text } from "@atlaskit/primitives";
import Button from "@atlaskit/button/new";
import SectionMessage from "@atlaskit/section-message";
import { useThemeObserver } from "@atlaskit/tokens";
import { invoke, view } from "@forge/bridge";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";

const App = () => {
  const [context, setContext] = useState();
  const theme = useThemeObserver();
  useEffect(async () => {
    await view.theme.enable();
  }, []);
  useEffect(() => {
    view.getContext().then(setContext);
  }, []);
  if (!context) {
    return " ";
  }

  const currentTheme = (theme) =>
    createTheme({
      palette: {
        mode: theme,
      },
    });

  const {
    extension: { project },
  } = context;
  return (
    <ThemeProvider theme={currentTheme(theme.colorMode)}>
      <View project={project} />
    </ThemeProvider>
  );
};

const View = ({ project }) => {
  const [hostname, setHostname] = useState();
  const [email, setEmail] = useState();
  const [apiKey, setApiKey] = useState();
  const [isExist, setIsExist] = useState(false);

  const [isLoadFailed, setIsLoadFailed] = useState(false);
  const [isSaveFailed, setIsSaveFailed] = useState(false);
  const [isDeleteFailed, setIsDeleteFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setIsLoadFailed(false);
    invoke("getSettings", { projectId: project.id })
      .then((settings) => {
        setHostname(settings["hostname"]);
        setEmail(settings["email"]);
        setApiKey(settings["apiKey"]);
        setIsExist(
          settings["hostname"] && settings["email"] && settings["apiKey"]
        );
      })
      .catch((e) => {
        setIsLoadFailed(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const saveConfiguration = (event) => {
    setIsSaving(true);
    setIsSaveFailed(false);
    setIsDeleteFailed(false);
    invoke("setSettings", {
      hostname: hostname,
      email: email,
      apiKey: apiKey,
      projectId: project.id,
    })
      .then((data) => {
        setIsSaveFailed(!data);
        setIsExist(!!data);
      })
      .catch((e) => {
        setIsSaveFailed(true);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const deleteConfiguration = (event) => {
    setIsDeleting(true);
    setIsSaveFailed(false);
    setIsDeleteFailed(false);
    invoke("deleteSettings", {
      projectId: project.id,
    })
      .then((data) => {
        setIsDeleteFailed(!data);
        setIsExist(!data);
        if (!!data) {
          setHostname("");
          setEmail("");
          setApiKey("");
        }
      })
      .catch((e) => {
        setIsDeleteFailed(true);
      })
      .finally(() => {
        setIsDeleting(false);
      });
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

  const textFieldStyles = {
    ".MuiInputBase-root": {
      fontSize: 12,
      fontWeight: 100,
    },
    ".MuiInputBase-input": { padding: "4px" },
  };

  return !isLoading ? (
    <>
      {isLoadFailed && (
        <SectionMessage appearance="error">
          <Text>An error occurred while loading...</Text>
        </SectionMessage>
      )}
      {isSaveFailed && (
        <SectionMessage appearance="error">
          <Text>An error occurred while saving...</Text>
        </SectionMessage>
      )}
      {isDeleteFailed && (
        <SectionMessage appearance="error">
          <Text>An error occurred while deleting...</Text>
        </SectionMessage>
      )}
      <Box padding="space.050">
        <Inline alignBlock="center" spread="space-between">
          <Button
            onClick={saveConfiguration}
            appearance="primary"
            spacing="compact"
            isLoading={isSaving}
            isDisabled={
              isLoadFailed || isDeleting || !(hostname && email && apiKey)
            }
          >
            Save
          </Button>
          <Button
            onClick={deleteConfiguration}
            appearance="danger"
            spacing="compact"
            isLoading={isDeleting}
            isDisabled={isLoadFailed || !isExist || isSaving}
          >
            Delete
          </Button>
        </Inline>
      </Box>
      <Box padding="space.050">
        <Stack>
          <Text size="small">TestRail Hostname</Text>
          <TextField
            value={hostname}
            onChange={handleHostnameChange}
            fullWidth
            sx={textFieldStyles}
            placeholder="example.testrail.com"
          />
        </Stack>
        <Stack>
          <Text size="small">TestRail User Email</Text>
          <TextField
            value={email}
            onChange={handleEmailChange}
            fullWidth
            sx={textFieldStyles}
          />
        </Stack>
        <Stack>
          <Text size="small">TestRail API Key</Text>
          <TextField
            type={"password"}
            value={apiKey}
            onChange={handleApiKeyChange}
            fullWidth
            sx={textFieldStyles}
          />
        </Stack>
      </Box>
    </>
  ) : (
    <>Loading...</>
  );
};

export default App;
