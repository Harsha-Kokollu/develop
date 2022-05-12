import axios from "axios";
import _ from "lodash";
import { logMessage } from "../../../core/actions/common-actions";
import { AppConfigProps } from "../../../core/settings/app-config";
const actionFileName = "order-actions.js";

export function getProduct(productId,cancelToken) {
    return new Promise(function (resolve, reject) {      
        axios
          .get(
            AppConfigProps.operatorConnectAPIPrefix+"/catalog-products/"+productId,
            cancelToken
          )
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            if (axios.isCancel(err)) {
              logMessage(
                AppConfigProps.log.severityLevel.warning,
                actionFileName + ">getQuoteVersions()",
                AppConfigProps.httpStatusCode.clientClosedRequest,
                err.message
              );
            } else {
              reject(err.response);
            }
          });
      
    });
  }
  