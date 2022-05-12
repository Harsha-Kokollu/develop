import axios from "axios";
import { OperatorConnectURLProps } from "../../pages/common/settings/operator-connect-urls";
import { AppConfigProps } from "../settings/app-config";

const actionFileName="common-actions.js"

export function logMessage(type, path, statusCode, message) {
    if (AppConfigProps.log.messages === true) {
      console.log(type, path, statusCode, message);
    }
  }

  export function manageError(err, location, navigate) {
    return new Promise(function (resolve, reject) {
      console.error(err, location);
      let path = "";
      if (location?.pathname?.length > 0)
        path = path + location?.pathname;
      if (location?.search?.length > 0)
        path = path + location?.search;
      if (location?.hash?.length > 0)
        path = path + location?.hash;
      let statusCode = "";
      if (err?.status) statusCode = err.status;
      let message = "";
      if (err?.data?.message) message = err.data.message;
      let endPoint = "";
      if (err && err.data && err.config && err.config.baseURL && err.config.url)
        endPoint = err.config.baseURL + err.config.url;
      let method = "";
      if (err && err.data && err.config && err.config.method)
        method = err.config.method;
  
      logMessage(
        AppConfigProps.log.severityLevel.error,
        path,
        statusCode,
        message
      );
      if (
        err &&
        (err.status === AppConfigProps.httpStatusCode.notFound ||
          err.status === AppConfigProps.httpStatusCode.unauthorized)
      ) {
        navigate(OperatorConnectURLProps.pageNotFound, {
          state: {
            pageURL: path,
            method: method,
            statusCode: statusCode,
            errMessage: message,
            endPoint: endPoint,
          },
        });
      } else if (err?.status === AppConfigProps.httpStatusCode.requestTimeout) {
        // navigate(AppURLProps.signin);
      } else {
        navigate(OperatorConnectURLProps.error, {
          state: {
            pageURL: path,
            method: method,
            statusCode: statusCode,
            errMessage: message,
            endPoint: endPoint,
          },
        });
      }
    });
  }
  