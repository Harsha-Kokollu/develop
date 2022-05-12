/**
Project: Voice Panel (c)
Title: Onboard steps 
Description: Component to indicate the Onboard steps progress
Copyrights: This file is subject to the terms and conditions defined in file 'LICENSE.txt', which is part of this source code package.
*/
import React from "react";
import { connect } from "react-redux";
import classNames from "classnames";
import IntlUtil from "../../../core/helpers/intl-util";
import { OperatorConnectConstants } from "../../common/settings/operator-connect-constants";
import { withTranslation } from 'react-i18next';

const QuoteSteps = (props) => {
    const _intl_ns_oc_quote = "oc_quote";

    return (
        <div className="frame-content-progress-steps">
            <ul className="quote-progress">
                <li
                    className={classNames(
                        "steps",
                        {
                            active:
                                props.quoteProgressPage ===
                                OperatorConnectConstants.QUOTE.PROGRESS.SELECT_PRODUCTS,
                        },
                        {
                            completed:
                                props.quoteProgressPage >
                                OperatorConnectConstants.QUOTE.PROGRESS.SELECT_PRODUCTS,
                        }
                    )}
                >
                    <span
                        className={classNames(
                            "title",
                            {
                                active:
                                    props.quoteProgressPage ===
                                    OperatorConnectConstants.QUOTE.PROGRESS.SELECT_PRODUCTS,
                            },
                            {
                                completed:
                                    props.quoteProgressPage >
                                    OperatorConnectConstants.QUOTE.PROGRESS.SELECT_PRODUCTS,
                            }
                        )}
                    >
                        {IntlUtil.getText(
                            _intl_ns_oc_quote,
                            "content.configureProducts"
                        )}
                    </span>
                </li>

                <li
                    className={classNames(
                        "steps",
                        {
                            active:
                                props.quoteProgressPage ===
                                OperatorConnectConstants.QUOTE.PROGRESS.CREATE_ACCOUNT,
                        },
                        {
                            completed:
                                props.quoteProgressPage >
                                OperatorConnectConstants.QUOTE.PROGRESS.CREATE_ACCOUNT,
                        }
                    )}
                >
                    <span
                        className={classNames(
                            "title",
                            {
                                active:
                                    props.quoteProgressPage ===
                                    OperatorConnectConstants.QUOTE.PROGRESS.CREATE_ACCOUNT,
                            },
                            {
                                completed:
                                    props.quoteProgressPage >
                                    OperatorConnectConstants.QUOTE.PROGRESS.CREATE_ACCOUNT,
                            }
                        )}
                    >
                        {IntlUtil.getText(_intl_ns_oc_quote, "content.createAccount")}
                    </span>
                </li>
                <li
                    className={classNames(
                        "steps",
                        {
                            active:
                                props.quoteProgressPage ===
                                OperatorConnectConstants.QUOTE.PROGRESS.CHECKOUT,
                        },
                        {
                            completed:
                                props.quoteProgressPage >
                                OperatorConnectConstants.QUOTE.PROGRESS.CHECKOUT,
                        }
                    )}
                >
                    <span
                        className={classNames(
                            "title",
                            {
                                active:
                                    props.quoteProgressPage ===
                                    OperatorConnectConstants.QUOTE.PROGRESS.CHECKOUT,
                            },
                            {
                                completed:
                                    props.quoteProgressPage >
                                    OperatorConnectConstants.QUOTE.PROGRESS.CHECKOUT,
                            }
                        )}
                    >
                        {IntlUtil.getText(_intl_ns_oc_quote, "content.checkout")}
                    </span>
                </li>
                <li
                    className={classNames(
                        "steps",
                        {
                            active:
                                props.quoteProgressPage ===
                                OperatorConnectConstants.QUOTE.PROGRESS.ORDER_CONFIRMATION,
                        },
                        {
                            completed:
                                props.quoteProgressPage >
                                OperatorConnectConstants.QUOTE.PROGRESS.ORDER_CONFIRMATION,
                        }
                    )}
                >
                    <span
                        className={classNames(
                            "title",
                            {
                                active:
                                    props.quoteProgressPage ===
                                    OperatorConnectConstants.QUOTE.PROGRESS.ORDER_CONFIRMATION,
                            },
                            {
                                completed:
                                    props.quoteProgressPage >
                                    OperatorConnectConstants.QUOTE.PROGRESS.ORDER_CONFIRMATION,
                            }
                        )}
                    >
                        {IntlUtil.getText(_intl_ns_oc_quote, "content.orderConfirmation")}
                    </span>
                </li>
            </ul>
        </div>
    );
}


const mapStateToProps = (state) => ({
    quoteProgressPage: state.quoteStore.quoteProgressPage,
});

const mapActionToProps = {};

export default withTranslation()(connect(mapStateToProps, mapActionToProps)(QuoteSteps));
