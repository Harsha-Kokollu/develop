import axios from "axios";
import { logMessage } from "../../../core/actions/common-actions";
import { AppConfigProps } from "../../../core/settings/app-config";
import { PRODUCT_LIST } from "../../../store/constants";

const actionFileName="common-actions.js"

export function getProducts(cancelToken){
    return new Promise(async function (resolve, reject) {
        axios
          .get(
            AppConfigProps.operatorConnectAPIPrefix + "/catalog-products",
            cancelToken
          )
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            if (axios.isCancel(err)) {
              logMessage(
                AppConfigProps.log.severityLevel.warning,
                actionFileName + ">getProducts()",
                AppConfigProps.httpStatusCode.clientClosedRequest,
                err.message
              );
            } else {
              reject(err.response);
            }
          });
      });
}

export function setProductRecords(productRecords) {
  return async function (dispatch) {
    try {
      dispatch({
        type: PRODUCT_LIST,
        payload: productRecords,
      });
    } catch (err) {
      throw Error(err);
    }
  };
}

export function getCountryStates(cancelToken){
  return new Promise(async function (resolve, reject) {
      axios
        .get(
          AppConfigProps.operatorConnectAPIPrefix + "/general/country-states",
          cancelToken
        )
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          if (axios.isCancel(err)) {
            logMessage(
              AppConfigProps.log.severityLevel.warning,
              actionFileName + ">getProducts()",
              AppConfigProps.httpStatusCode.clientClosedRequest,
              err.message
            );
          } else {
            reject(err.response);
          }
        });
    });
}

