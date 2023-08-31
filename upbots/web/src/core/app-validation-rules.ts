import Vue from "vue";
import { ValidationObserver, ValidationProvider, extend } from "vee-validate";
import * as rules from "vee-validate/dist/rules";

// install rules
Object.keys(rules).forEach((rule: any) => {
  extend(rule, (rules as any)[rule]);
});

extend("required", {
  ...rules.required,
  message: "{_field_} is required",
});

extend("equal", {
  params: ["target"],
  validate(value, { target }: any) {
    return value === target;
  },
  message: "{_field_} doesn't match {target}",
});

extend("validate_pass", {
  params: ["otherValue", "maxDifference"],
  validate: (value) => {
    const strongRegex = new RegExp(/^(?=.*?[a-z])(?=.*?[0-9]).{8,}$/);
    return strongRegex.test(value);
  },
  message: "Minimum 8 characters, at least one letter and one number",
});

// Install components globally
Vue.component("ValidationObserver", ValidationObserver);
Vue.component("ValidationProvider", ValidationProvider);
