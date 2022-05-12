/**
Project: Operator Connect (c)
Title: Error Page
Description: Error Page to be displayed when errors occured from server API
Copyrights: This file is subject to the terms and conditions defined in file 'LICENSE.txt', which is part of this source code package.
*/
import React, { useState } from "react";
import {
  Image,
  Text,
  DefaultButton,
  TooltipHost,
  CommandBarButton,
} from "@fluentui/react";
import IntlUtil from "../helpers/intl-util";
import { AppPageTitle } from "../components/app-page-title";
import { AppInsightscontext } from "../settings/app-insights";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { OperatorConnectURLProps } from "../../pages/common/settings/operator-connect-urls";

const ErrorPage = (props) => {
  const _intl_ns_error = "oc_error";
  const [isCopied, setCopied] = useState();

  const renderErrorDetails = () => {
    return (
      <>
        <div className="p-l-15 p-t-10 p-b-10">
          <span>{IntlUtil.getText(_intl_ns_error, "content.pageURL")}</span>:{" "}
          <span>
            {props.location?.state?.pageURL
              ? window.location.origin + props.location?.state?.pageURL
              : window.location.origin + props.location?.pathname}
          </span>
        </div>
        {props.location?.state?.endPoint ? (
          <div className="p-l-15 p-t-5 p-b-10">
            <span>
              {IntlUtil.getText(_intl_ns_error, "content.apiEndPoint")}
            </span>
            : <span>{props.location?.state?.endPoint}</span>
          </div>
        ) : null}
        {props.location?.state?.method ? (
          <div className="p-l-15 p-t-5 p-b-10">
            <span>{IntlUtil.getText(_intl_ns_error, "content.apiMethod")}</span>
            : <span>{props.location?.state?.method}</span>
          </div>
        ) : null}
        {props.location?.state?.statusCode ? (
          <div className="p-l-15 p-t-5 p-b-10">
            <span>
              {IntlUtil.getText(_intl_ns_error, "content.apiStatusCode")}
            </span>
            : <span>{props.location?.state?.statusCode}</span>
          </div>
        ) : null}
        {props.location?.state?.errMessage ? (
          <div className="p-l-15 p-t-5 p-b-10">
            <span>
              {IntlUtil.getText(_intl_ns_error, "content.errorMessage")}
            </span>
            : <span>{props.location?.state?.errMessage}</span>
          </div>
        ) : null}

        {AppInsightscontext?.user?.id ? (
          <div className="p-l-15 p-t-5 p-b-10">
            <span>{IntlUtil.getText(_intl_ns_error, "content.userId")}</span>:{" "}
            <span>{AppInsightscontext?.user?.id}</span>
          </div>
        ) : null}
        {AppInsightscontext?.sessionManager?.automaticSession?.id ? (
          <div className="p-l-15 p-t-5 p-b-10">
            <span>{IntlUtil.getText(_intl_ns_error, "content.sessionId")}</span>
            :{" "}
            <span>
              {AppInsightscontext?.sessionManager?.automaticSession?.id}
            </span>
          </div>
        ) : null}
      </>
    );
  };

  const copyErrorDetails = () => {
    let errorDetails = [
      {
        name: IntlUtil.getText(_intl_ns_error, "content.pageURL"),
        value: window.location.origin + props.location?.state?.pageURL,
      },
      {
        name: IntlUtil.getText(_intl_ns_error, "content.apiEndPoint"),
        value: props.location?.state?.endPoint,
      },
      {
        name: IntlUtil.getText(_intl_ns_error, "content.apiMethod"),
        value: props.location?.state?.method,
      },
      {
        name: IntlUtil.getText(_intl_ns_error, "content.apiStatusCode"),
        value: props.location?.state?.statusCode,
      },
      {
        name: IntlUtil.getText(_intl_ns_error, "content.errorMessage"),
        value: props.location?.state?.errMessage,
      },
      {
        name: IntlUtil.getText(_intl_ns_error, "content.userId"),
        value: AppInsightscontext?.user?.id,
      },
      {
        name: IntlUtil.getText(_intl_ns_error, "content.sessionId"),
        value: AppInsightscontext?.sessionManager?.automaticSession?.id,
      },
    ];
    return errorDetails;
  };

  const onCopyText = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <div id="error-page">
      <AppPageTitle
        pageTitle={IntlUtil.getText(_intl_ns_error, "title.serverError")}
      />
      <div className="error-page-content">
        <div className="error-page-segment bg-white">
          <div className="m-b-20">
            <Text className="error-page-title">
              {IntlUtil.getText(_intl_ns_error, "content.errorTitle")}
            </Text>
          </div>
          <div className="m-b-30">
            <Text className="error-page-text">
              {IntlUtil.getText(_intl_ns_error, "content.serverErrorText")}
            </Text>
            <div className="bg-grey m-t-10 p-t-15 p-b-15">
              {renderErrorDetails()}
            </div>
            <div className="m-b-20 m-t-10">
              <TooltipHost
                content={
                  isCopied === true ? (
                    <Text>Copied to clipboard</Text>
                  ) : (
                    <Text>Copy to clipboard</Text>
                  )
                }
              >
                <CopyToClipboard
                  text={copyErrorDetails()
                    .map((item) => {
                      return item.value
                        ? `${item?.name}: ${item?.value}`
                        : null;
                    })
                    .filter((removeNull) => {
                      return removeNull != null;
                    })
                    .join("\n")}
                  onCopy={() => onCopyText()}
                >
                  <CommandBarButton
                    primary
                    className="text-ff-semibold text-fc-primary"
                    iconProps={{ iconName: "ClipboardList" }}
                    text="Copy Error Details"
                  ></CommandBarButton>
                </CopyToClipboard>
              </TooltipHost>
            </div>
          </div>
          <div className="m-b-20">
            <DefaultButton
              onClick={() => props.navigate(OperatorConnectURLProps.index)}
              text={IntlUtil.getText(
                _intl_ns_error,
                "content.homePageButtonText"
              )}
              className="error-page-button"
            ></DefaultButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
