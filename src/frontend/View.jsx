import React, { useState, useEffect } from "react";
import { Badge, Link, Icon, Box } from "@forge/react";
import { invoke } from "@forge/bridge";

const color = (fieldValue) => {
  if (
    fieldValue.passedCount > 0 &&
    fieldValue.blockedCount === 0 &&
    fieldValue.retestCount === 0 &&
    fieldValue.failedCount === 0 &&
    fieldValue.untestedCount === 0
  ) {
    return "color.background.accent.green.subtlest";
  } else if (
    fieldValue.failedCount > 0 ||
    fieldValue.blockedCount > 0 ||
    fieldValue.retestCount > 0
  ) {
    return "color.background.accent.red.subtlest";
  } else {
    return "color.background.accent.yellow.subtlest";
  }
};

const View = (fieldValue) => {
  const [testRunInfo, setTestRunInfo] = useState(fieldValue);

  useEffect(() => {
    invoke("getTestRunInfo", {
      projectId: fieldValue.projectId,
      runId: fieldValue.run?.value,
    }).then((data) => {
      setTestRunInfo(data);
    });
  }, []);

  return (
    testRunInfo?.url && (
      <>
        <Box padding="space.100" backgroundColor={color(testRunInfo)}>
          <Badge appearance="added">
            {"Passed: " + (testRunInfo.passedCount || 0)}
          </Badge>
          <Badge appearance="primary">
            {"Blocked: " + (testRunInfo.blockedCount || 0)}
          </Badge>
          <Badge appearance="removed">
            {"Retest: " + (testRunInfo.retestCount || 0)}
          </Badge>
          <Badge appearance="important">
            {"Failed: " + (testRunInfo.failedCount || 0)}
          </Badge>
          <Badge appearance="default">
            {"Untested: " + (testRunInfo.untestedCount || 0)}
          </Badge>
          <Link href={`${testRunInfo.url || ""}`} openNewTab={true}>
            <Icon glyph="shortcut" label="Shortcut" size="small" />
          </Link>
        </Box>
      </>
    )
  );
};

export default View;
