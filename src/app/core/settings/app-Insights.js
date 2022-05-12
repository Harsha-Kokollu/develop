import React, { Fragment } from "react";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import {
  ReactPlugin,
  withAITracking,
} from "@microsoft/applicationinsights-react-js";

const reactPlugin = new ReactPlugin();

const ai = new ApplicationInsights({
  config: {
    instrumentationKey:
      process.env.REACT_APP_SIPPIO_OPERATOR_CONNECT_AZURE_APP_INSIGHT_KEY,
    enableAutoRouteTracking: true,
    enableDebug: true,
    extensions: [reactPlugin],
  },
});

ai.loadAppInsights();

export const appInsights = ai.appInsights;
export const AppInsightscontext = ai.context;
export const getAppInsights = () => appInsights;


export default (Component) => withAITracking(reactPlugin, Component);
