import React from "react";
import Edit from "./Edit";
import View from "./View";
import { useProductContext } from "@forge/react";

const App = () => {
  const context = useProductContext();
  if (!context) {
    return " ";
  }
  const {
    extension: { fieldValue, project },
  } = context;

  return context.extension.entryPoint === "edit" ? (
    <Edit {...fieldValue} projectId={project.id} />
  ) : (
    <View {...fieldValue} projectId={project.id} />
  );
};

export default App;
