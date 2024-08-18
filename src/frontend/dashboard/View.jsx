import React, { useEffect, useState } from "react";
import { Box, DynamicTable } from "@forge/react";
import { invoke } from "@forge/bridge";
import { TERM_TYPE } from "../../const";
import { formatDate } from "./util";

const View = (props) => {
  const [resultResponseJson, setResultResponseJson] = useState();
  const { project, dateTimeField, reportType, termType, dateFrom, dateTo } =
    props;

  const currentDate = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  useEffect(() => {
    if (project && dateTimeField) {
      invoke("searchResults", {
        project: project.value,
        dateTimeField: dateTimeField.value,
        reportType: reportType,
        dateFromStr:
          termType === TERM_TYPE.PAST_YEAR ? formatDate(oneYearAgo) : dateFrom,
        dateToStr:
          termType === TERM_TYPE.PAST_YEAR ? formatDate(currentDate) : dateTo,
      }).then(setResultResponseJson);
    }
  }, []);

  const convertForCount = (values) => {
    return values.map((value) => [value.term, value.count, value.result]);
  };

  const createKey = (input) => {
    return input ? input.replace(/^(the|a|an)/, "").replace(/\s/g, "") : input;
  };

  const createRows = (values) => {
    const store = {};
    values.forEach((value) => {
      if (!store[value.term]) {
        store[value.term] = { term: value.term };
      }
      store[value.term][value.result] = value.count;
    });
    const formatValues = Object.keys(store)
      .sort()
      .map((key) => store[key]);

    return formatValues.reverse().map((value) => ({
      key: `row-${value.term}`,
      cells: [
        {
          key: value.term,
          content: value.term,
        },
        {
          key: value["Passed"],
          content: value["Passed"],
        },
        {
          key: value["Blocked"],
          content: value["Blocked"],
        },
        {
          key: value["Retest"],
          content: value["Retest"],
        },
        {
          key: value["Failed"],
          content: value["Failed"],
        },
        {
          key: value["Untested"],
          content: value["Untested"],
        },
      ],
    }));
  };

  const head = {
    cells: [
      {
        key: "term",
        content: "Term",
        isSortable: true,
      },
      {
        key: "Passed",
        content: "Passed",
        shouldTruncate: true,
        isSortable: true,
      },
      {
        key: "Blocked",
        content: "Blocked",
        shouldTruncate: true,
        isSortable: true,
      },
      {
        key: "Retest",
        content: "Retest",
        shouldTruncate: true,
        isSortable: true,
      },
      {
        key: "Failed",
        content: "Failed",
        shouldTruncate: true,
        isSortable: true,
      },
      {
        key: "Untested",
        content: "Untested",
        shouldTruncate: true,
        isSortable: true,
      },
    ],
  };

  return (
    resultResponseJson && (
      <>
        <Box paddingInline="space.300">
          <DynamicTable
            caption={`List of Test Run Results`}
            head={head}
            rows={createRows(resultResponseJson)}
            rowsPerPage={20}
          />
        </Box>
      </>
    )
  );
};

export default View;
