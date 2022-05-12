/**
Project: Operator Connect (c)
Title: Page Not Found Error  
Description: Error Page to be displayed when page not found
Copyrights: This file is subject to the terms and conditions defined in file 'LICENSE.txt', which is part of this source code package.
*/
import React from "react";
import { Text, DefaultButton } from "@fluentui/react";
import IntlUtil from "../helpers/intl-util";
import { connect } from "react-redux";
import { AppPageTitle } from '../components/app-page-title';
import { OperatorConnectURLProps } from "../../pages/common/settings/operator-connect-urls";

const ErrorPageNotFound = (props) => {
  const _intl_ns_error = "oc_error";
  return (
    <div id="error-page">
      <AppPageTitle pageTitle={IntlUtil.getText(_intl_ns_error, "title.pageNotFound")} />
      <div className="error-page-content">
        <div className="error-page-segment bg-white">
          <div className="m-b-20">
            <Text className="error-page-title">{IntlUtil.getText(_intl_ns_error, "content.pageNotFound")}</Text>
          </div>
          <div className="m-b-30">
            <Text className="error-page-text">
              {IntlUtil.getText(_intl_ns_error, "content.pageText")}
            </Text>
            <div className="bg-grey">
            </div>
            <div className="m-b-20 m-t-10">
            </div>

          </div>

          <div className="m-b-20">
            <DefaultButton
              onClick={() => props.navigate(OperatorConnectURLProps.index)}
              text={IntlUtil.getText(_intl_ns_error, "content.homePageButtonText")}
              className="error-page-button page-frame-button"
            ></DefaultButton>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
});
const mapActionToProps = {
};

export default connect(mapStateToProps, mapActionToProps)(ErrorPageNotFound);
