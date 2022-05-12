import jwt_decode from "jwt-decode";
import { AppConfigProps } from "../settings/app-config";

class TokenUtil {
  // Set token to local storage
  static setIdentityToken(sippioAccessToken) {
    let token = {
      accessToken: sippioAccessToken,
    };
    if (token) {
      localStorage.setItem(
        AppConfigProps.identitySession.operatorConnectTokenKey,
        JSON.stringify(token)
      );
    }
  }

  // Remove token from  local storage
  static removeIdentityToken() {
    localStorage.removeItem(
      AppConfigProps.identitySession.operatorConnectTokenKey
    );
    localStorage.clear();
  }

  // Get access token from local storage
  static getIdentitySippioAccessToken() {
    if (
      localStorage.getItem(AppConfigProps.identitySession.operatorConnectTokenKey)
    ) {
      const token = localStorage.getItem(
        AppConfigProps.identitySession.operatorConnectTokenKey
      );
      if (token) {
        const parsedToken = JSON.parse(token);
        if (parsedToken && parsedToken.accessToken)
          return parsedToken.accessToken;
      }
    }
    return null;
  }

  // Get refresh token from local storage
  static getIdentitySippioRefreshToken() {
    if (
      localStorage.getItem(AppConfigProps.identitySession.operatorConnectTokenKey)
    ) {
      const token = localStorage.getItem(
        AppConfigProps.identitySession.operatorConnectTokenKey
      );
      if (token) {
        const parsedToken = JSON.parse(token);
        if (parsedToken && parsedToken.refreshToken)
          return parsedToken.refreshToken;
      }
    }
    return null;
  }

  // Get access token from local storage and parse the data
  static getIdentitySippioAccessTokenData() {
    const token = JSON.parse(
      localStorage.getItem(AppConfigProps.identitySession.operatorConnectTokenKey)
    );
    if (token && token.accessToken) {
      const decodedToken = jwt_decode(token.accessToken);
      if (decodedToken&&decodedToken.operator) {
        const identityData = {
customerType:decodedToken.operator?.customerType,
customerId:decodedToken.operator?.customerId,
accountNumber:decodedToken.operator?.accountNumber,
accountName:decodedToken.operator?.accountName,
domainName:decodedToken.operator?.domainName ,
expiry:decodedToken.exp


};

        return identityData;
      }
    }
    return null;
  }
}

export default TokenUtil;
