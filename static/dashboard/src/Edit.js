import React, { useEffect, useState } from "react";
import { Box, Stack, Text } from "@atlaskit/primitives";
import Select from "@atlaskit/select";
import { RadioGroup } from "@atlaskit/radio";
import { DatePicker } from "@atlaskit/datetime-picker";
import { ButtonGroup } from "@atlaskit/button";
import Button from "@atlaskit/button/new";
import { view, invoke } from "@forge/bridge";
import {
  TERM_TYPE,
  FIELD_NAME_PROJECT,
  FIELD_NAME_DATE_TIME_FIELD,
  FIELD_NAME_TERM_TYPE,
  FIELD_NAME_DATE_FROM,
  FIELD_NAME_DATE_TO,
} from "./const";

const Edit = (props) => {
  const { project, dateTimeField, termType, dateFrom, dateTo } = props;
  const [projectResponseJson, setProjectResponseJson] = useState();
  const [dateTimeFieldResponseJson, setDateTimeFieldResponseJson] = useState();
  const [selectedProject, setSelectedProject] = useState(project);
  const [selectedDateTimeField, setSelectedDateTimeField] =
    useState(dateTimeField);
  const [selectedTermType, setSelectedTermType] = useState(termType);
  const [selectedDateFrom, setSelectedDateFrom] = useState(dateFrom);
  const [selectedDateTo, setSelectedDateTo] = useState(dateTo);

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
  const termTypeOptions = [
    { name: "termType", value: TERM_TYPE.PAST_YEAR, label: "Past Year" },
    { name: "termType", value: TERM_TYPE.DATE_RANGE, label: "Date Range" },
  ];

  const handleProjectChange = (data) => {
    setSelectedProject(data);
  };

  const handleDateTimeFieldChange = (data) => {
    setSelectedDateTimeField(data);
  };

  const handleTermTypeChange = (data) => {
    setSelectedTermType(data.target.value);
  };

  const handleDateFromChange = (data) => {
    setSelectedDateFrom(data);
  };

  const handleDateToChange = (data) => {
    setSelectedDateTo(data);
  };

  const handleSave = () => {
    const newData = {};
    newData[FIELD_NAME_PROJECT] = selectedProject;
    newData[FIELD_NAME_DATE_TIME_FIELD] = selectedDateTimeField;
    newData[FIELD_NAME_TERM_TYPE] = selectedTermType;
    newData[FIELD_NAME_DATE_FROM] = selectedDateFrom;
    newData[FIELD_NAME_DATE_TO] = selectedDateTo;
    view.submit(newData);
  };

  const handleCancel = () => {
    view.close();
  };

  return (
    <>
      <Box padding="space.050">
        <Stack>
          <Box padding="space.050">
            <Stack>
              <Text size="small" weight="bold">
                Project
              </Text>
              <Select
                appearance="default"
                options={projectOptions}
                onChange={handleProjectChange}
                defaultValue={project}
                spacing="compact"
                maxMenuHeight={120}
              />
            </Stack>
          </Box>
          <Box padding="space.050">
            <Stack>
              <Text size="small" weight="bold">
                Target Date Field
              </Text>
              <Select
                appearance="default"
                options={dateTimeFieldOptions}
                onChange={handleDateTimeFieldChange}
                defaultValue={dateTimeField}
                spacing="compact"
                maxMenuHeight={120}
              />
            </Stack>
          </Box>
          <Box padding="space.050">
            <Stack>
              <Text size="small" weight="bold">
                Term Type
              </Text>
              <RadioGroup
                options={termTypeOptions}
                onChange={handleTermTypeChange}
                defaultValue={termType}
              />
            </Stack>
          </Box>
          <Box padding="space.050">
            <Stack>
              <Text size="small" weight="bold">
                From
              </Text>
              <DatePicker
                weekStartDay={1}
                dateFormat="YYYY-MM-DD"
                isDisabled={selectedTermType !== TERM_TYPE.DATE_RANGE}
                onChange={handleDateFromChange}
                defaultValue={dateFrom}
                spacing="compact"
              />
            </Stack>
          </Box>
          <Box padding="space.050">
            <Stack>
              <Text size="small" weight="bold">
                To
              </Text>
              <DatePicker
                weekStartDay={1}
                dateFormat="YYYY-MM-DD"
                isDisabled={selectedTermType !== TERM_TYPE.DATE_RANGE}
                onChange={handleDateToChange}
                defaultValue={dateTo}
                spacing="compact"
              />
            </Stack>
          </Box>
          <Box padding="space.050">
            <ButtonGroup>
              <Button
                onClick={handleSave}
                appearance="primary"
                isDisabled={!(selectedProject && selectedDateTimeField)}
              >
                Save
              </Button>
              <Button onClick={handleCancel} appearance="subtle">
                Cancel
              </Button>
            </ButtonGroup>
          </Box>
        </Stack>
      </Box>
      <Box padding="space.1000"></Box>
      <Box padding="space.500"></Box>
    </>
  );
};

export default Edit;
