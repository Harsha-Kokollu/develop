import React, { Component } from "react";
import { Image, Text, DefaultButton } from "@fluentui/react";
import LumenLogo from "../../../assets/images/Lumen-logo.png";
import IntlUtil from "../helpers/intl-util";
import { AppPageTitle } from '../components/app-page-title'
import { OperatorConnectURLProps } from "../../pages/common/settings/operator-connect-urls";

class SessionExpired extends Component {
    _intl_ns_common = "common";
    componentDidMount() {
        window.scrollTo(0, 0);
    }
    componentDidUpdate() {
        window.scrollTo(0, 0);
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
                            <Text className="error-page-title">Session Expired</Text>
                        </div>
                        <div className="m-b-30">
                            <Text className="error-page-text">
                                Your Session is expired, please Signin again.
              </Text>
                        </div>
                        <div className="m-b-20">
                            <DefaultButton
                                onClick={() => this.props.history.push(OperatorConnectURLProps.index)}
                                text="Go to Sign in Page"
                                className="error-page-button"
                            ></DefaultButton>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default SessionExpired;
