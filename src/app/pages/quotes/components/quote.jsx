import React, { useEffect } from "react";
import { connect } from "react-redux";
import IntlUtil from "../../../core/helpers/intl-util";
import PageUtil from "../../../core/helpers/page-util";
import { setQuoteProgressPage } from "../actions/quote-action";
import AccountCreate from "./account-create";
import OrderCheckout from "./order-checkout";
import QuoteCreate from "./quote-create";
import QuoteSteps from "./quote-steps";
import { withTranslation } from "react-i18next";
import { OperatorConnectConstants } from "../../common/settings/operator-connect-constants";
import OrderConfirmation from "./order-confirmation";

const Quote = (props) => {
  const _intl_ns_oc_quote = "oc_quote";
  useEffect(() => {
    PageUtil.scrollToTop();
    props.setQuoteProgressPage(0);
  }, []);

  const renderQuoteStepComponents = () => {
    switch (props.quoteProgressPage) {
      case OperatorConnectConstants.QUOTE.PROGRESS.SELECT_PRODUCTS:
        return <QuoteCreate {...props} />;
      case OperatorConnectConstants.QUOTE.PROGRESS.CREATE_ACCOUNT:
        return <AccountCreate {...props} />;
      case OperatorConnectConstants.QUOTE.PROGRESS.CHECKOUT:
        return <OrderCheckout {...props} />;
      case OperatorConnectConstants.QUOTE.PROGRESS.ORDER_CONFIRMATION:
        return <OrderConfirmation {...props} />;

      default:
        return <QuoteCreate {...props} />;
    }
  };

  return (
    <>
      {/* <AppPageTitle pageTitle={IntlUtil.getText(_intl_ns_oc_quote,"title.selectProducts")}/> */}
      <div id="oc-page-container">
        <div className="page-main-header-wrapper">
          <div className="page-main-header-title">
            {IntlUtil.getText(_intl_ns_oc_quote, "content.order")}
          </div>
          <div className="page-main-header-actions">
            {/* Please start coding here for buttons*/}
          </div>
        </div>
        <div>
          <QuoteSteps />
        </div>
        <div className="page-frame-shadow">{renderQuoteStepComponents()}</div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  quoteProgressPage: state.quoteStore.quoteProgressPage,
});
const mapActionToProps = {
  setQuoteProgressPage,
};

export default withTranslation()(
  connect(mapStateToProps, mapActionToProps)(Quote)
);
