import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";
import { Box } from "@atlaskit/primitives";
import { TERM_TYPE } from "./const";
import { formatDate } from "./util";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LineController,
  BarElement,
  LinearScale,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar, Chart } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  Legend,
  LineElement,
  LineController,
  BarElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  RadialLinearScale,
  Filler
);

const View = (props) => {
  const [dataset, setDataset] = useState();
  const { project, dateTimeField, termType, dateFrom, dateTo } = props;

  const currentDate = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  useEffect(() => {
    if (project && dateTimeField) {
      invoke("searchResults", {
        project: project.value,
        dateTimeField: dateTimeField.value,
        dateFromStr:
          termType === TERM_TYPE.PAST_YEAR ? formatDate(oneYearAgo) : dateFrom,
        dateToStr:
          termType === TERM_TYPE.PAST_YEAR ? formatDate(currentDate) : dateTo,
      }).then(setDataset);
    }
  }, [project, dateTimeField]);

  const backgroundColors = [
    "rgba(75, 192, 192, 0.5)", // Green
    "rgba(201, 203, 207, 0.5)", // Gray
    "rgba(255, 206, 86, 0.5)", // Yellow
    "rgba(255, 99, 132, 0.5)", // Red
    "rgba(75, 192, 192, 0.75)", // Green
    "rgba(201, 203, 207, 0.75)", // Gray
    "rgba(255, 206, 86, 0.75)", // Yellow
    "rgba(255, 99, 132, 0.75)", // Red
  ];

  const createDataForAll = (values) => {
    const labels = values.map((value) => value.IssueKey);
    const valuesForPassed = values.map((value) => value.Passed);
    const valuesForBlocked = values.map((value) => value.Blocked);
    const valuesForRetest = values.map((value) => value.Retest);
    const valuesForFailed = values.map((value) => value.Failed);
    const datasets = [
      {
        label: "Passed",
        data: valuesForPassed,
        borderColor: backgroundColors[0],
        backgroundColor: backgroundColors[0],
      },
      {
        label: "Blocked",
        data: valuesForBlocked,
        borderColor: backgroundColors[1],
        backgroundColor: backgroundColors[1],
      },
      {
        label: "Retest",
        data: valuesForRetest,
        borderColor: backgroundColors[2],
        backgroundColor: backgroundColors[2],
      },
      {
        label: "Failed",
        data: valuesForFailed,
        borderColor: backgroundColors[3],
        backgroundColor: backgroundColors[3],
      },
    ];
    return {
      labels: labels,
      datasets: datasets,
    };
  };

  const total = (value) => {
    return value.Passed + value.Blocked + value.Retest + value.Failed;
  };

  const createDataForFailedRatio = (values) => {
    const labels = values.map((value) => value.IssueKey);
    const valuesForPassed = values.map(
      (value) => (value.Passed / total(value)) * 100
    );
    const valuesForBlocked = values.map(
      (value) => (value.Blocked / total(value)) * 100
    );
    const valuesForRetest = values.map(
      (value) => (value.Retest / total(value)) * 100
    );
    const valuesForFailed = values.map(
      (value) => (value.Failed / total(value)) * 100
    );
    const datasets = [
      {
        type: "bar",
        label: "Passed",
        data: valuesForPassed,
        borderColor: backgroundColors[0],
        backgroundColor: backgroundColors[0],
        yAxisID: "y",
      },
      {
        type: "bar",
        label: "Blocked",
        data: valuesForBlocked,
        borderColor: backgroundColors[1],
        backgroundColor: backgroundColors[1],
        yAxisID: "y",
      },
      {
        type: "bar",
        label: "Retest",
        data: valuesForRetest,
        borderColor: backgroundColors[2],
        backgroundColor: backgroundColors[2],
        yAxisID: "y",
      },
      {
        type: "bar",
        label: "Failed",
        data: valuesForFailed,
        borderColor: backgroundColors[3],
        backgroundColor: backgroundColors[3],
        yAxisID: "y",
      },
      {
        type: "line",
        label: "Passed",
        data: valuesForPassed,
        borderColor: backgroundColors[4],
        backgroundColor: backgroundColors[4],
        yAxisID: "y1",
      },
      {
        type: "line",
        label: "Blocked",
        data: valuesForBlocked,
        borderColor: backgroundColors[5],
        backgroundColor: backgroundColors[5],
        yAxisID: "y1",
      },
      {
        type: "line",
        label: "Retest",
        data: valuesForRetest,
        borderColor: backgroundColors[6],
        backgroundColor: backgroundColors[6],
        yAxisID: "y1",
      },
      {
        type: "line",
        label: "Failed",
        data: valuesForFailed,
        borderColor: backgroundColors[7],
        backgroundColor: backgroundColors[7],
        yAxisID: "y1",
      },
    ];
    return {
      labels: labels,
      datasets: datasets,
    };
  };

  return dataset ? (
    <>
      <Box>
        <Bar
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: "bottom",
              },
              title: {
                display: true,
                text: `Test execution results per issue`,
              },
            },
          }}
          data={createDataForAll(dataset)}
        />
        <Chart
          type="bar"
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: "bottom",
              },
              title: {
                display: true,
                text: `Test execution results ratio per issue`,
              },
            },
            scales: {
              x: {
                stacked: true,
              },
              y: {
                stacked: true,
              },
              y1: {
                type: "linear",
                position: "right",
                stacked: false,
              },
            },
          }}
          data={createDataForFailedRatio(dataset)}
        />
      </Box>
    </>
  ) : (
    <></>
  );
};

export default View;
