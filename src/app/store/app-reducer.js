/**
Project: Operator Connect (c)
Title: App Reducer
Description: Reducer for the application
Copyrights: This file is subject to the terms and conditions defined in file 'LICENSE.txt', which is part of this source code package.
*/
import { APP_NAME } from "./constants";

const INIT_STATE = {
  appName: "SIPPIO",
};

const appReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case APP_NAME:
      return {
        ...state,
        appName: action.payload,
      };
    default:
      return state;
  }
};

export default appReducer;
