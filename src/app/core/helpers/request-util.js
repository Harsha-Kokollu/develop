/**
Project: Operator Connect (c)
Title: Request Util 
Description: Helper class with functions for Request 
Copyrights: This file is subject to the terms and conditions defined in file 'LICENSE.txt', which is part of this source code package.
*/
import axios from "axios";
import TokenUtil from "./token-util";

class RequestUtil {
  // Set the Request Headers
  static setRequestHeaders() {
    axios.defaults.baseURL = process.env.REACT_APP_SIPPIO_OPERATOR_CONNECT_API_URL;
    axios.defaults.headers.common["Content-Type"] = "application/json";

    const sippioAccessToken = TokenUtil.getIdentitySippioAccessToken();
    if (sippioAccessToken) {
      // Apply authorization token to every request if logged in
      axios.defaults.headers.common["Authorization"] = sippioAccessToken;
    } else {
      // Delete auth header
      delete axios.defaults.headers.common["Authorization"];
      axios.defaults.headers.common["OperatorDomain"] = process.env.REACT_APP_SIPPIO_OPERATOR_CONNECT_OPERATOR_DOMAIN;
    }

    /*
    axios.defaults.baseURL =
      'https://97zn0qshi5.execute-api.us-east-2.amazonaws.com/dev/'; // process.env.REACT_APP_API_URL;

    axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['x-api-key'] =
      'bryjUflFDj8rWTA23DE2d9cGZVJi8jVf2jdTMiMk'; // process.env.REACT_APP_API_KEY;

    if (token) {
      // Apply authorization token to every request if logged in
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    } else {
      // Delete auth header
      delete axios.defaults.headers.common['Authorization'];
    }
    if (loginUser) {
      axios.defaults.headers.common['Login-User'] = loginUser;
    } else {
      delete axios.defaults.headers.common['Login-User'];
    }
    */
  }
}

export default RequestUtil;
