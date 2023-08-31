import Vue from "vue";
import { AxiosStatic } from "axios";
import { Breakpoints } from "./services/types";

declare module "vue/types/vue" {
  interface Vue {
    $http: AxiosStatic;
    $breakpoint: Breakpoints;
    isComingSoon: boolean;
    $emptySvgTemplate: any;
  }
}
