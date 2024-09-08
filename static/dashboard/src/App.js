import React, { useEffect, useState } from "react";
import Edit from "./Edit";
import View from "./View";
import { view } from "@forge/bridge";
import { useThemeObserver } from "@atlaskit/tokens";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import {
  TERM_TYPE,
  FIELD_NAME_PROJECT,
  FIELD_NAME_DATE_TIME_FIELD,
  FIELD_NAME_TERM_TYPE,
  FIELD_NAME_DATE_FROM,
  FIELD_NAME_DATE_TO,
} from "./const";
import { formatDate } from "./util";

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
    return "Loading...";
  }

  const currentTheme = (theme) =>
    createTheme({
      palette: {
        mode: theme,
      },
    });

  const {
    extension: { gadgetConfiguration },
  } = context;

  const createFromDefaultValue = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return formatDate(date);
  };

  const createToDefaultValue = () => {
    const date = new Date();
    return formatDate(date);
  };

  const project = gadgetConfiguration[FIELD_NAME_PROJECT];
  const dateTimeField = gadgetConfiguration[FIELD_NAME_DATE_TIME_FIELD];
  const termType =
    gadgetConfiguration[FIELD_NAME_TERM_TYPE] ?? TERM_TYPE.PAST_YEAR;
  const dateFrom =
    gadgetConfiguration[FIELD_NAME_DATE_FROM] ?? createFromDefaultValue();
  const dateTo =
    gadgetConfiguration[FIELD_NAME_DATE_TO] ?? createToDefaultValue();

  return context.extension.entryPoint === "edit" ? (
    <ThemeProvider theme={currentTheme(theme.colorMode)}>
      <Edit
        project={project}
        dateTimeField={dateTimeField}
        termType={termType}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />
    </ThemeProvider>
  ) : (
    <ThemeProvider theme={currentTheme(theme.colorMode)}>
      <View
        project={project}
        dateTimeField={dateTimeField}
        termType={termType}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />
    </ThemeProvider>
  );
};

export default App;
