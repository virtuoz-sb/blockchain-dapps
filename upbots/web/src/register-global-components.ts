import Vue from "vue";

const componentContext = require.context("@/components/shared", true, /\.vue$/);

componentContext.keys().forEach((fileName) => registerComponent(fileName, componentContext));

function registerComponent(fileName: any, context: any) {
  const config = context(fileName);
  const pathParts = fileName.split("/");
  const compName = pathParts[pathParts.length - 1].replace(".vue", "");
  Vue.component(compName, config.default || config);
}
