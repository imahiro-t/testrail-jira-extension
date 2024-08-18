import React from "react";
import Edit from "./Edit";
import View from "./View";
import { useProductContext } from "@forge/react";
import { REPORT_TYPE, TERM_TYPE } from "../../const";
import {
  FIELD_NAME_PROJECT,
  FIELD_NAME_DATE_TIME_FIELD,
  FIELD_NAME_REPORT_TYPE,
  FIELD_NAME_TERM_TYPE,
  FIELD_NAME_DATE_FROM,
  FIELD_NAME_DATE_TO,
} from "./const";
import { formatDate } from "./util";

const App = () => {
  const context = useProductContext();
  if (!context) {
    return " ";
  }
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
  const reportType =
    gadgetConfiguration[FIELD_NAME_REPORT_TYPE] ?? REPORT_TYPE.MONTHLY;
  const termType =
    gadgetConfiguration[FIELD_NAME_TERM_TYPE] ?? TERM_TYPE.PAST_YEAR;
  const dateFrom =
    gadgetConfiguration[FIELD_NAME_DATE_FROM] ?? createFromDefaultValue();
  const dateTo =
    gadgetConfiguration[FIELD_NAME_DATE_TO] ?? createToDefaultValue();

  return context.extension.entryPoint === "edit" ? (
    <Edit
      project={project}
      dateTimeField={dateTimeField}
      reportType={reportType}
      termType={termType}
      dateFrom={dateFrom}
      dateTo={dateTo}
    />
  ) : (
    <View
      project={project}
      dateTimeField={dateTimeField}
      reportType={reportType}
      termType={termType}
      dateFrom={dateFrom}
      dateTo={dateTo}
    />
  );
};

export default App;
