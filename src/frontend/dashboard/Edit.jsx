import React, { useEffect, useState } from "react";
import {
  Select,
  Form,
  Button,
  Box,
  FormSection,
  FormFooter,
  Label,
  useForm,
  RequiredAsterisk,
  RadioGroup,
  DatePicker,
} from "@forge/react";
import { invoke, view } from "@forge/bridge";
import { REPORT_TYPE, TERM_TYPE } from "../../const";
import {
  FIELD_NAME_PROJECT,
  FIELD_NAME_DATE_TIME_FIELD,
  FIELD_NAME_REPORT_TYPE,
  FIELD_NAME_TERM_TYPE,
  FIELD_NAME_DATE_FROM,
  FIELD_NAME_DATE_TO,
} from "./const";

const Edit = (props) => {
  const { project, dateTimeField, reportType, termType, dateFrom, dateTo } =
    props;
  const [projectResponseJson, setProjectResponseJson] = useState();
  const [dateTimeFieldResponseJson, setDateTimeFieldResponseJson] = useState();
  const [selectedProject, setSelectedProject] = useState(project);
  const [selectedDateTimeField, setSelectedDateTimeField] =
    useState(dateTimeField);
  const [selectedTermType, setSelectedTermType] = useState(termType);

  useEffect(() => {
    invoke("getRecentProjects", {}).then(setProjectResponseJson);
    invoke("getDateTimeFields", {}).then(setDateTimeFieldResponseJson);
  }, []);

  const projectOptions = projectResponseJson
    ? projectResponseJson.map((project) => ({
        label: project.name,
        value: project.id,
      }))
    : [];
  const dateTimeFieldOptions = dateTimeFieldResponseJson
    ? dateTimeFieldResponseJson.map((dateTimeField) => ({
        label: dateTimeField.name,
        value: dateTimeField.id,
      }))
    : [];
  const reportTypeOptions = [
    { name: "reportType", value: REPORT_TYPE.MONTHLY, label: "Monthly" },
    { name: "reportType", value: REPORT_TYPE.WEEKLY, label: "Weekly" },
  ];
  const termTypeOptions = [
    { name: "termType", value: TERM_TYPE.PAST_YEAR, label: "Past Year" },
    { name: "termType", value: TERM_TYPE.DATE_RANGE, label: "Date Range" },
  ];

  const { handleSubmit, register, getFieldId } = useForm({
    defaultValues: {
      project: project,
      dateTimeField: dateTimeField,
      reportType: reportType,
      termType: termType,
      dateFrom: dateFrom,
      dateTo: dateTo,
    },
  });

  const handleSave = async (data) => {
    if (!data[FIELD_NAME_PROJECT]) {
      data[FIELD_NAME_PROJECT] = selectedProject;
    }
    if (!data[FIELD_NAME_DATE_TIME_FIELD]) {
      data[FIELD_NAME_DATE_TIME_FIELD] = selectedDateTimeField;
    }
    if (!data[FIELD_NAME_TERM_TYPE]) {
      data[FIELD_NAME_TERM_TYPE] = selectedTermType;
    }
    view.submit(data);
  };

  const handleCancel = () => {
    view.close();
  };

  const handleProjectChange = (data) => {
    setSelectedProject(data);
  };

  const handleDateTimeFieldChange = (data) => {
    setSelectedDateTimeField(data);
  };

  const handleTermTypeChange = (data) => {
    setSelectedTermType(data.target.value);
  };

  return (
    <Form onSubmit={handleSubmit(handleSave)}>
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
          />
        </Box>
        <Box>
          <Label labelFor={getFieldId(FIELD_NAME_DATE_TIME_FIELD)}>
            Target Date Field
            <RequiredAsterisk />
          </Label>
          <Select
            {...register(FIELD_NAME_DATE_TIME_FIELD, {})}
            appearance="default"
            name={FIELD_NAME_DATE_TIME_FIELD}
            options={dateTimeFieldOptions}
            defaultValue={dateTimeField}
            onChange={handleDateTimeFieldChange}
          />
          <Label labelFor={getFieldId(FIELD_NAME_REPORT_TYPE)}>
            Report Type
          </Label>
          <RadioGroup
            {...register(FIELD_NAME_REPORT_TYPE, {})}
            name={FIELD_NAME_REPORT_TYPE}
            options={reportTypeOptions}
            defaultValue={reportType}
          />
        </Box>
        <Box>
          <Label labelFor={getFieldId(FIELD_NAME_TERM_TYPE)}>Term Type</Label>
          <RadioGroup
            {...register(FIELD_NAME_TERM_TYPE, {})}
            name={FIELD_NAME_TERM_TYPE}
            options={termTypeOptions}
            defaultValue={termType}
            onChange={handleTermTypeChange}
          />
          <Label labelFor={getFieldId(FIELD_NAME_DATE_FROM)}>From</Label>
          <DatePicker
            {...register(FIELD_NAME_DATE_FROM, {})}
            name={FIELD_NAME_DATE_FROM}
            defaultValue={dateFrom}
            weekStartDay={1}
            dateFormat="YYYY-MM-DD"
            isDisabled={selectedTermType !== TERM_TYPE.DATE_RANGE}
          />
          <Label labelFor={getFieldId(FIELD_NAME_DATE_TO)}>To</Label>
          <DatePicker
            {...register(FIELD_NAME_DATE_TO, {})}
            name={FIELD_NAME_DATE_TO}
            defaultValue={dateTo}
            weekStartDay={1}
            dateFormat="YYYY-MM-DD"
            isDisabled={selectedTermType !== TERM_TYPE.DATE_RANGE}
          />
        </Box>
      </FormSection>
      <FormFooter>
        <Button onClick={handleCancel} appearance="subtle">
          Cancel
        </Button>
        <Button
          appearance="primary"
          type="submit"
          isDisabled={!(selectedProject && selectedDateTimeField)}
        >
          Save
        </Button>
      </FormFooter>
    </Form>
  );
};

export default Edit;
