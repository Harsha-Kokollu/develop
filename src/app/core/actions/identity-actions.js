import axios from "axios";
import TokenUtil from "../helpers/token-util";
import { AppConfigProps } from "../settings/app-config";
import { logMessage } from "./common-actions";

const actionFileName="identity-actions.js"

export function authenticateToken(cancelToken) {
    let headers = {
      "Content-Type": "application/json",
      OperatorDomain: "lumen",
    };
    return new Promise(async function (resolve, reject) {
      axios
        .post(
          AppConfigProps.operatorConnectAPIPrefix + "/authentication/token",
          { data: "" },
          { headers: headers },
          cancelToken
        )
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          if (axios.isCancel(err)) {
            logMessage(
              AppConfigProps.log.severityLevel.warning,
              actionFileName + ">authenticateToken()",
              AppConfigProps.httpStatusCode.clientClosedRequest,
              err.message
            );
          } else {
            reject(err.response);
          }
        });
    });
  }

  export function checkIdentitySession() {
    const tokenData = TokenUtil.getIdentitySippioAccessTokenData();
    if (
      tokenData &&
      tokenData.accountName &&
      tokenData.accountNumber &&
      tokenData.customerId &&
      tokenData.expiry >= Date.now() / 1000
    ) {
      return true;
    } else {
      return false;
    }
  }
  