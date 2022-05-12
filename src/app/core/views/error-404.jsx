/**
Project: Operator Connect (c)
Title: 404 Error  
Description: Error Page to be displayed when page not found
Copyrights: This file is subject to the terms and conditions defined in file 'LICENSE.txt', which is part of this source code package.
*/
import React, { Component } from "react";
import { Image, Text, DefaultButton, TooltipHost, CommandBarButton } from "@fluentui/react";
import LumenLogo from "../../../assets/images/Lumen-logo.png";
import IntlUtil from "../helpers/intl-util";
import { AppPageTitle } from '../components/app-page-title';
//import { CopyToClipboard } from "react-copy-to-clipboard";
import { connect } from "react-redux";
import { getAppInsights } from "../settings/app-Insights";
import { OperatorConnectURLProps } from "../../pages/common/settings/operator-connect-urls";



class Error404 extends Component {
  _intl_ns_common = "common";
  _intl_ns_error = "error";
  _azureInsights = getAppInsights();

  constructor(props) {
    super(props);
    this.state = {
      isCopied: false
    }

  }

  componentDidMount() {
    window.scrollTo(0, 0);
    const queryParams = this.props.location?.state || {};
    console.log(this.props);
    alert();
    this.setState({
      pageURL: queryParams.pageURL,
      method: queryParams.method,
      statusCode: queryParams.statusCode,
      errMessage: queryParams.errMessage,
      endPoint: queryParams.endPoint,
    })
  }
  componentDidUpdate() {
    window.scrollTo(0, 0);
  }
  userProfile = () => {
    let identityProfile = "";
    if (this.props.identityProfile && this.props.identityProfile.email && this.props.identityProfile.accountNumber) {
      identityProfile = (
        <div className="m-t-10">
          <div className="p-l-15 p-b-10 p-t-10">
            <span>
              {IntlUtil.getText(this._intl_ns_error, "content.userName")}
            </span>: <span>
              {this.props.identityProfile.email}
            </span>
          </div>
          <div className="p-l-15 p-t-5 p-b-5">
            <span>
              {IntlUtil.getText(this._intl_ns_error, "content.accountNumber")}
            </span>: <span>
              {this.props.identityProfile.accountNumber}
            </span>
          </div>
        </div>
      )
    }
    return identityProfile;
  }

  renderErrorDetails = () => {
    return (
      <>
        <div >
          {this.userProfile()}
        </div>
        <div className="p-l-15 p-t-10 p-b-10">
          <span>
            {IntlUtil.getText(this._intl_ns_error, "content.pageURL")}
          </span>: <span>
            {
              this.state.pageURL
                ? window.location.origin + this.state.pageURL
                : window.location.origin + this.props.history.location.pathname
            }
          </span>
        </div>
        {this.state.endPoint ?
          <div className="p-l-15 p-t-5 p-b-10">
            <span>
              {IntlUtil.getText(
                this._intl_ns_error,
                "content.apiEndPoint"
              )}
            </span>: <span>
              {this.state.endPoint}
            </span>
          </div> : null}
        {this.state.method ?
          <div className="p-l-15 p-t-5 p-b-10">
            <span>
              {IntlUtil.getText(
                this._intl_ns_error,
                "content.apiMethod"
              )}
            </span>: <span>
              {this.state.method}
            </span>
          </div> : null}
        {this.state.statusCode ?
          <div className="p-l-15 p-t-5 p-b-10">
            <span>
              {IntlUtil.getText(
                this._intl_ns_error,
                "content.apiStatusCode"
              )}
            </span>: <span>
              {this.state.statusCode}
            </span>
          </div> : null}
        {this.state.errMessage ?
          <div className="p-l-15 p-t-5 p-b-10" >
            <span>
              {IntlUtil.getText(
                this._intl_ns_error,
                "content.errorMessage"
              )}
            </span>: <span>
              {this.state.errMessage}
            </span>
          </div> : null}

        {this._azureInsights?.context?.user?.id ?
          <div className="p-l-15 p-t-5 p-b-10">
            <span>
              {IntlUtil.getText(
                this._intl_ns_error,
                "content.userId"
              )}
            </span>: <span>
              {this._azureInsights?.context?.user?.id}
            </span>
          </div> : null}
        {this._azureInsights?.context?.sessionManager?.automaticSession?.id ?
          <div className="p-l-15 p-t-5 p-b-10">
            <span>
              {IntlUtil.getText(
                this._intl_ns_error,
                "content.sessionId"
              )}</span>: <span>
              {this._azureInsights?.context?.sessionManager?.automaticSession?.id}
            </span>
          </div> : null}


      </>
    );
  }

  copyErrorDetails() {
    let errorDetails = [
      {
        name: IntlUtil.getText(
          this._intl_ns_error,
          "content.userName"
        ),
        value: this.props.identityProfile?.email
      },
      {
        name: IntlUtil.getText(
          this._intl_ns_error,
          "content.accountNumber"
        ),
        value: this.props.identityProfile?.accountNumber
      },
      {
        name: IntlUtil.getText(
          this._intl_ns_error,
          "content.pageURL"
        ),
        value: window.location.origin + this.state.pageURL
      },
      {
        name: IntlUtil.getText(
          this._intl_ns_error,
          "content.apiEndPoint"
        ),
        value: this.state.endPoint
      },
      {
        name: IntlUtil.getText(
          this._intl_ns_error,
          "content.apiMethod"
        ),
        value: this.state.method
      },
      {
        name: IntlUtil.getText(
          this._intl_ns_error,
          "content.apiStatusCode"
        ),
        value: this.state.statusCode
      },
      {
        name: IntlUtil.getText(
          this._intl_ns_error,
          "content.errorMessage"
        ),
        value: this.state.errMessage
      },
      {
        name: IntlUtil.getText(
          this._intl_ns_error,
          "content.userId"
        ),
        value: this._azureInsights?.context?.user?.id
      },
      {
        name: IntlUtil.getText(
          this._intl_ns_error,
          "content.sessionId"
        ),
        value: this._azureInsights?.context?.sessionManager?.automaticSession?.id
      }
    ]
    return errorDetails
  }
  onCopyText = () => {
    this.setState({ isCopied: true });
    setTimeout(() => {
      this.setState({ isCopied: false });
    }, 1000);
  }



  render() {
    return (
      <div id="error-page">
        <AppPageTitle pageTitle={IntlUtil.getText(this._intl_ns_common, "title.pageNotFound")} />
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
              <Text className="error-page-title">Page Not Found</Text>
            </div>
            <div className="m-b-30">
              <Text className="error-page-text">
                The page you requested was either not found or unauthorized
                access.
              </Text>
            </div>
            <div className="bg-white">
              {this.renderErrorDetails()}
            </div>
            <div className="m-b-20 m-t-10">
              <TooltipHost
                content={
                  this.state.isCopied === true ?
                    <Text >
                      Copied to clipboard
                    </Text>
                    :
                    <Text >
                      Copy to clipboard
                    </Text>
                }
              >
                {/* <CopyToClipboard text={this.copyErrorDetails().map((item) => {
                  return item.value ? `${item.name}: ${item.value}` : null
                }).filter((removeNull) => { return removeNull != null; }).join("\n")} onCopy={() => this.onCopyText()}>
                  <CommandBarButton primary className="text-ff-semibold bg-grey text-fc-primary" iconProps={{ iconName: "ClipboardList" }} text="Copy Error Details"></CommandBarButton>
                </CopyToClipboard> */}
              </TooltipHost>
            </div>

            <div className="m-b-20">
              <DefaultButton
                onClick={() => this.props.history.push(OperatorConnectURLProps.index)}
                text="Go to Home Page"
                className="error-page-button"
              ></DefaultButton>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state) => ({
  identityProfile: state.identityStore.identityProfile,
  countryStatesData: state.generalStore.countryStatesData
});
const mapActionToProps = {
};

export default connect(mapStateToProps, mapActionToProps)(Error404);
