/**
Project: Operator Connect (c)
Title: Boundary Error  
Description: Error Page to be displayed during the component errors
Copyrights: This file is subject to the terms and conditions defined in file 'LICENSE.txt', which is part of this source code package.
*/
import React, { Component } from "react";
import { Image, Text, DefaultButton } from "@fluentui/react";
import LumenLogo from "../../../assets/images/Lumen-logo.png";
import IntlUtil from "../helpers/intl-util";
import { AppPageTitle } from '../components/app-page-title';
import { OperatorConnectURLProps } from "../../pages/common/settings/operator-connect-urls";

class ErrorBoundary extends Component {
  _intl_ns_common = "oc_common";

  state = {
    errorMessage: "",
  };
  componentDidMount() {
    window.scrollTo(0, 0);
  }
  componentDidUpdate() {
    window.scrollTo(0, 0);
  }

  static getDerivedStateFromError(error) {
    return { errorMessage: error.toString() };
  }
  componentDidCatch(error, info) {
    //console.error(error.toString(), info.componentStack);
  }

  render() {
    if (this.state.errorMessage) {
      return (
        <div id="error-page">
          <AppPageTitle pageTitle={IntlUtil.getText(this._intl_ns_common, "title.clientError")} />
          <header className="error-page-header">
            <Image
              src={LumenLogo}
              alt={IntlUtil.getText(this._intl_ns_common, "content.sippio")}
              title={IntlUtil.getText(this._intl_ns_common, "content.sippio")}
            />
          </header>
          <div className="error-page-content">
            <div className="error-page-segment">
              <div className="m-b-20">
                <Text className="error-page-title">Error</Text>
              </div>
              <div className="m-b-30">
                <Text className="error-page-text">
                  {this.state.errorMessage}
                </Text>
              </div>
              <div className="m-b-20">
                <DefaultButton
                  onClick={() => (document.location.href = OperatorConnectURLProps.index)}
                  text="Go to Home Page"
                  className="error-page-button"
                ></DefaultButton>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return this.props.children;
    }
  }
}

export default ErrorBoundary;
