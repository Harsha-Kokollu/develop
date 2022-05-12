import {
  Label,
  TooltipHost,
  Text,
  DefaultButton,
  Dropdown,
  PrimaryButton,
  TextField,
  Dialog,
  DialogFooter,
  DialogType,
} from "@fluentui/react";
import React, { Component } from "react";
import { Col, Grid, Row } from "react-flexbox-grid";
import { connect } from "react-redux";
import IntlUtil from "../../../core/helpers/intl-util";
import PageUtil from "../../../core/helpers/page-util";
import { CreateAccountFormFields } from "../settings/account-form-fields";
import _ from "lodash";
import axios from "axios";
import {
  addSubscriber,
  setQuoteEstimatorInfoQuoteSubscriberDetails,
  setQuoteEstimatorInfoSubscriberQuoteRecords,
  setQuoteProgressPage,
} from "../actions/quote-action";
import { AddFriendIcon, InfoIcon } from "@fluentui/react-icons";
import { getCountryStatesList } from "../../common/actions/general-actions";
import { withTranslation } from "react-i18next";
import { OperatorConnectConstants } from "../../common/settings/operator-connect-constants";
import { AppConfigProps } from "../../../core/settings/app-config";
import SearchDropdown from "../../common/helpers/search-dropdown";
import PageOverlayLoader from "../../common/helpers/page-overlay-loader";
import { AppPageTitle } from "../../../core/components/app-page-title";
import { manageError } from "../../../core/actions/common-actions";
import CustomPageAppInsights from "../../common/helpers/custom-page-app-title";
import TelemetryUtil from "../../../core/helpers/telemetry-util";

class AccountCreate extends Component {
  _isMounted = false;
  _axiosSource = axios.CancelToken.source();
  _cancelToken = { cancelToken: this._axiosSource.token };
  _intl_ns_oc_quote = "oc_quote";
  _intl_ns_oc_common = "oc_common";

  constructor(props) {
    super(props);
    this.subscriberAddPageRef = React.createRef();
    this.businessNameRef = React.createRef();
    this.customerDomainsRef = React.createRef();
    this.billingAccountNumberRef = React.createRef();
    this.addLine1Ref = React.createRef();
    this.cityRef = React.createRef();
    this.countryRef = React.createRef();
    this.postalCodeRef = React.createRef();
    this.firstNameRef = React.createRef();
    this.lastNameRef = React.createRef();
    this.emailRef = React.createRef();
    this.stateRef = React.createRef();
    this.state = {
      accountFormInputFields: this.initAccountFormInputFields(),
      connectionList: [],
      productServices: [],
      communicationPlatformList: [],
      isAccountAddDialogHidden: true,
      quoteRecord: null,
      isPageDataFetched: false,
    };
  }

  setStateAsync = (state) => {
    if (this._isMounted) {
      return new Promise((resolve) => {
        this.setState(state, resolve);
      });
    }
  };

  async componentDidMount() {
    this._isMounted = true;
    TelemetryUtil.trackPageView(
      IntlUtil.getText(this._intl_ns_oc_quote, "title.createAccount")
    );
    PageUtil.scrollIntoView(this.subscriberAddPageRef);
    await this.setStateAsync({ isPageDataFetched: true });

    //await this.loadPageData();
  }

  componentWillUnmount() {
    this._isMounted = false;
    this._axiosSource.cancel(
      IntlUtil.getText(
        this._intl_ns_common,
        "notification.warning.requestCancelled"
      )
    );
  }

  handleFormFieldBlur = async (e) => {
    if (e && e.target.id && this.state.accountFormInputFields) {
      await this.validateFormField(e.target.id);
    }
    // await this.clearAlert();
  };

  validateFormField = async (fieldName) => {
    if (fieldName && this.state.accountFormInputFields) {
      let fieldObj = this.state.accountFormInputFields[fieldName];
      if (fieldObj.isRequired === true) {
        let errorStatus = false;
        if (fieldObj.validate(fieldObj.value) === false) {
          errorStatus = true;
        }
        await this.setStateAsync({
          accountFormInputFields: {
            ...this.state.accountFormInputFields,
            [fieldName]: {
              ...this.state.accountFormInputFields[fieldName],
              isError: errorStatus,
            },
          },
        });
      }
    }
  };

  setFormFieldValue = async (fieldName, fieldValue) => {
    if (fieldName && this.state.accountFormInputFields) {
      await this.setStateAsync({
        accountFormInputFields: {
          ...this.state.accountFormInputFields,
          [fieldName]: {
            ...this.state.accountFormInputFields[fieldName],
            value: fieldValue,
          },
        },
      });
    }
  };

  initAccountFormInputFields = () => {
    let refCollection = {
      businessName: this.businessNameRef,
      customerDomains: this.customerDomainsRef,
      billingAccountNumber: this.billingAccountNumberRef,
      addLine1: this.addLine1Ref,
      city: this.cityRef,
      country: this.countryRef,
      postalCode: this.postalCodeRef,
      firstName: this.firstNameRef,
      lastName: this.lastNameRef,
      email: this.emailRef,
      state: this.stateRef,
      voiceRegionsTemplate: this.voiceRegionsTemplateRef,
      communicationPlatform: this.communicationPlatformsRef,
    };
    return CreateAccountFormFields(this._intl_ns_oc_quote, refCollection);
  };

  handleFormSubmit = async () => {
    let isFormFilled = true;
    if (this.state.accountFormInputFields) {
      PageUtil.scrollToTop();
      await this.setStateAsync({ isAccountAddDialogHidden: true });
      for (const fieldName in this.state.accountFormInputFields) {
        await this.validateFormField(fieldName);
      }
      for (const fieldName in this.state.accountFormInputFields) {
        let fieldObj = this.state.accountFormInputFields[fieldName];
        if (fieldObj.isRequired === true && fieldObj.isError === true) {
          isFormFilled = false;
          break;
        }
      }
      if (isFormFilled === true) {
        await this.setStateAsync({ isPageDataFetched: false });
        let customerObj = {
          businessName: this.state.accountFormInputFields?.businessName.value
            ? this.state.accountFormInputFields?.businessName.value.trim()
            : "",
          customerDomains: this.state.accountFormInputFields?.customerDomains
            .value
            ? this.state.accountFormInputFields?.customerDomains.value.trim()
            : "",
          billingAccountNumber: this.state.accountFormInputFields
            ?.billingAccountNumber.value
            ? this.state.accountFormInputFields?.billingAccountNumber.value.trim()
            : "",

          address: {
            addLine1: this.state.accountFormInputFields?.addLine1.value
              ? this.state.accountFormInputFields?.addLine1.value.trim()
              : "",
            addLine2: this.state.accountFormInputFields?.addLine2.value
              ? this.state.accountFormInputFields?.addLine2.value.trim()
              : "",
            city: this.state.accountFormInputFields?.city.value
              ? this.state.accountFormInputFields?.city.value.trim()
              : "",
            state: this.state.accountFormInputFields?.state.value
              ? this.state.accountFormInputFields?.state.value.trim()
              : "",
            country: this.state.accountFormInputFields?.country.value
              ? this.state.accountFormInputFields?.country.value.trim()
              : "",
            postalCode: this.state.accountFormInputFields?.postalCode.value
              ? this.state.accountFormInputFields?.postalCode.value.trim()
              : "",
          },
          contact: {
            firstName: this.state.accountFormInputFields?.firstName.value
              ? this.state.accountFormInputFields?.firstName.value.trim()
              : "",
            lastName: this.state.accountFormInputFields?.lastName.value
              ? this.state.accountFormInputFields?.lastName.value.trim()
              : "",
            email: this.state.accountFormInputFields?.email.value
              ? this.state.accountFormInputFields?.email.value.trim()
              : "",
            phone: this.state.accountFormInputFields?.phone.value
              ? this.state.accountFormInputFields?.phone.value.trim()
              : "",
          },
        };
        let quoteId =
          this.props?.quoteEstimatorInfo?.subscriberQuoteRecords?.quoteId;
        await addSubscriber(quoteId, customerObj, this._cancelToken)
          .then(async (res) => {
            if (
              res &&
              res.status === AppConfigProps.httpStatusCode.ok &&
              res.data &&
              res.data.result
            ) {
              let productList = [];
              let customerDetailsObject = {
                quoteName: res.data.result.customerName,
                email: res.data.result.customerEmail,
                phone: res.data.result.customerPhone,
                quoteNumber: res.data.result.quoteNumber,
                quoteId: res.data.result.quoteId,
                partnerId: res.data.result.partnerId,
                subscriberAccount: null,
              };
              await this.props.setQuoteEstimatorInfoQuoteSubscriberDetails(
                this.props.quoteEstimatorInfo,
                customerDetailsObject
              );
              await res.data.result.products.forEach((rec) => {
                rec.selectedCountry = rec.countryName;
                rec.connection = rec.planName.trim();
                productList.push({ ...rec });
              });
              let quoteRecord = { ...res.data.result, products: productList };
              let serviceDocumentRecords = [];
              let onboardServiceDocumentRecords = [];
              let communicationPlatformDocumentRecords = [];
              let generalDocumentRecords = [];
              let onboardCountries = [];
              await quoteRecord.documents.forEach((country) => {
                if (country.categoryType === "Country") {
                  onboardCountries.push(country.categoryName);
                }
              });
              if (
                quoteRecord &&
                quoteRecord.documents &&
                quoteRecord.documents.length > 0
              ) {
                quoteRecord.documents.forEach((doc, index) => {
                  if (doc.categoryType === "Service") {
                    serviceDocumentRecords.push(doc);
                  }
                  if (doc.categoryType === "Communication Platform") {
                    communicationPlatformDocumentRecords.push(doc);
                  }
                  if (doc.categoryType === "General") {
                    generalDocumentRecords.push(doc);
                  }
                });
                onboardCountries = Array.from(new Set(onboardCountries));
                onboardCountries.forEach((country) => {
                  let documentList = [];
                  quoteRecord.documents.forEach((doc, index) => {
                    if (
                      doc.categoryType === "Country" &&
                      country === doc.categoryName
                    ) {
                      documentList.push(doc);
                    }
                  });
                  onboardServiceDocumentRecords.push({
                    countryName: country,
                    documents: documentList,
                  });
                });
              }
              let nrcSubTotal = 0;
              let mrcSubTotal = 0;
              let total = 0;
              let allServiceRecords = [];
              if (
                quoteRecord &&
                quoteRecord.products &&
                quoteRecord.products.length > 0
              ) {
                await quoteRecord.products.forEach((obj, index) => {
                  let mrcCount = 0;
                  let nrcCount = 0;
                  let nrcPartnerCost = 0;
                  let mrcPartnerCost = 0;
                  let mrcDiscount = 0;
                  let nrcDiscount = 0;
                  obj.pricing.forEach((price) => {
                    if (
                      price.chargeType?.toLowerCase().trim() ===
                      OperatorConnectConstants.QUOTE.CHARGE_TYPE.ONE_TIME?.toLowerCase().trim()
                    ) {
                      nrcCount =
                        nrcCount +
                        parseFloat(obj?.quantity ?? "0") *
                          parseFloat(price?.sellingPrice ?? "0");
                      nrcPartnerCost = price?.partnerCost ?? "0";
                    }
                    if (
                      price.chargeType?.toLowerCase().trim() ===
                      OperatorConnectConstants.QUOTE.CHARGE_TYPE.RECURRING?.toLowerCase().trim()
                    ) {
                      mrcCount =
                        mrcCount +
                        parseFloat(obj?.quantity ?? "0") *
                          parseFloat(price?.sellingPrice ?? "0");
                      mrcPartnerCost = price?.partnerCost ?? "0";
                    }
                  });

                  nrcSubTotal = nrcSubTotal + nrcCount;
                  mrcSubTotal = mrcSubTotal + mrcCount;
                  allServiceRecords.push({
                    ...obj,
                    connection: obj?.planName,
                    nrcPartnerCost: nrcPartnerCost,
                    mrcPartnerCost: mrcPartnerCost,
                    nrcDiscount: nrcDiscount,
                    mrcDiscount: mrcDiscount,
                    id: index,
                    mrc: mrcCount.toString(),
                    nrc: nrcCount.toString(),
                  });
                });
                total = total + nrcSubTotal + mrcSubTotal;
                await this.setStateAsync({
                  quoteRecord: {
                    ...quoteRecord,
                    products: allServiceRecords,
                    nrcSubTotal: nrcSubTotal,
                    mrcSubTotal: mrcSubTotal,
                    totalCost: total,
                    serviceDocumentRecords: serviceDocumentRecords,
                    onboardServiceDocumentRecords:
                      onboardServiceDocumentRecords,
                    generalDocumentRecords: generalDocumentRecords,
                    communicationPlatformDocumentRecords:
                      communicationPlatformDocumentRecords,
                  },
                });
                await this.props.setQuoteEstimatorInfoSubscriberQuoteRecords(
                  this.props.quoteEstimatorInfo,
                  this.state.quoteRecord
                );
                await this.props.setQuoteProgressPage(
                  OperatorConnectConstants.QUOTE.PROGRESS.CHECKOUT
                );
                await this.setStateAsync({ isPageDataFetched: true });
              } else {
                await this.setStateAsync({ isPageDataFetched: true });
                //await manageError(res, this.props.history);
              }
              // await this.setStateAsync({
              // 	quoteSubmitStatus:
              // 		PartnerPortalConstants.FORM_SUBMIT_STATUS.SUCCESS,
              // });
              await this.setStateAsync({ isPageDataFetched: true });
            } else {
              //PageUtil.scrollIntoView(this.subscriberAddPageRef);
              await this.setStateAsync({ isFormDataSubmitted: false });
            }
          })
          .catch(async (err) => {
            await manageError(err, this.props.location, this.props.navigate);
          });
      } else {
        for (const fieldName in this.state.accountFormInputFields) {
          let fieldObj = this.state.accountFormInputFields[fieldName];
          if (fieldObj.isError === true) {
            if (fieldObj.refObject) {
              fieldObj.refObject.current.focus();
              break;
            }
          }
        }
      }
    }
  };

  handlePhoneFormFieldChange = async (e) => {
    if (e && e.target.id && this.state.accountFormInputFields) {
      const reg = /[0-9]*$/;
      if (e.target.name === "phone") {
        if (reg.test(e.target.value) === true) {
          e.target.value = e.target.value.replace(/\D/g, "");
        }
      }
      await this.setFormFieldValue(e.target.id, e.target.value);
      await this.setStateAsync({ isContinueDisabled: false });
    }
    //await this.clearAlert();
  };
  handleFormFieldChange = async (e) => {
    if (e && e.target) {
      if (e.target.id === "quantity") {
        const regex = new RegExp("^[0-9]*$");
        if (regex.test(e.target.value) === true) {
          if (e.target.value.startsWith("0") === true) {
            e.target.value = "";
          }
        } else {
          e.target.value = "";
        }
      }
      await this.setFormFieldValue(e.target.id, e.target.value);
      await this.validateFormField(e.target.id);
    }
  };

  handleAccountAddDialog = async () => {
    let isFormFilled = true;
    if (this.state.accountFormInputFields) {
      PageUtil.scrollIntoView(this.subscriberAddPageRef);
      for (const fieldName in this.state.accountFormInputFields) {
        await this.validateFormField(fieldName);
      }
      for (const fieldName in this.state.accountFormInputFields) {
        let fieldObj = this.state.accountFormInputFields[fieldName];
        if (fieldObj.isRequired === true && fieldObj.isError === true) {
          isFormFilled = false;
          if (fieldObj.refObject) {
            fieldObj.refObject.current.focus();
            break;
          }
        }
      }
      if (isFormFilled === true) {
        this.setStateAsync({ isAccountAddDialogHidden: false });
      }
    }
  };

  renderSubscriberAddDialog = () => {
    return (
      <Dialog
        hidden={this.state.isAccountAddDialogHidden}
        modalProps={{ className: "quote-dialog-wrapper" }}
        dialogContentProps={{
          type: DialogType.normal,
          showCloseButton: false,
          title: IntlUtil.getText(
            this._intl_ns_oc_quote,
            "notification.warning.addCustomerTitle"
          ),
          subText: (
            <>
              <Text>
                {IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "notification.warning.addCustomerTextPrefix"
                )}
              </Text>
            </>
          ),
        }}
      >
        <DialogFooter>
          <PrimaryButton onClick={(e) => this.handleFormSubmit(e)}>
            {IntlUtil.getText(this._intl_ns_oc_common, "content.yes")}
          </PrimaryButton>
          <DefaultButton
            onClick={() => {
              this.setStateAsync({ isAccountAddDialogHidden: true });
              this.setStateAsync({ isFormDataSubmitted: false });
            }}
          >
            {IntlUtil.getText(this._intl_ns_oc_common, "content.no")}
          </DefaultButton>
        </DialogFooter>
      </Dialog>
    );
  };

  renderCompanyDetails = () => {
    return (
      <>
        <Grid fluid className="page-frame-content m-0 p-0">
          <Row>
            <Col>
              <Text className="m-l-15 text-fw-semibold text-fc-primary text-fs-large quote-page-text-wrapper">
                {IntlUtil.getSubstituteText(
                  this._intl_ns_oc_quote,
                  "content.quoteReferenceNumber",
                  [
                    {
                      key: "<QUOTE_NUMBER>",
                      value:
                        this.props?.quoteEstimatorInfo?.subscriberQuoteRecords
                          ?.quoteNumber,
                    },
                  ]
                )}
              </Text>
            </Col>
          </Row>
          <Row>
            <Col className="m-t-10">
              <Text className="m-l-15 quote-page-text-wrapper">
                {IntlUtil.getSubstituteText(
                  this._intl_ns_oc_quote,
                  "content.quoteText",
                  [
                    {
                      key: "<EMAIL>",
                      value:
                        this.props?.quoteEstimatorInfo?.subscriberQuoteRecords
                          ?.customerEmail,
                    },
                  ]
                )}
              </Text>
            </Col>
          </Row>
          <div className="page-content-separator"></div>
          <Row>
            <Col className="m-t-15">
              <Text className="m-l-15 text-bold text-fc-primary text-fs-large quote-page-text-wrapper">
                {IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.provideCompany"
                )}
              </Text>
            </Col>
          </Row>
          <Row className="m-0 p-0 m-t-15">
            <Col xl={12} className="m-t-20">
              <Text className="text-fw-semibold text-fc-primary text-fs-medium">
                {IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.companyDetails"
                )}
              </Text>
            </Col>
          </Row>
          <Row className="m-0 p-0">
            <Col xl={3} lg={3} md={5} xs={12} className="m-t-10 m-r-10">
              <TextField
                maxLength={50}
                required
                componentRef={this.businessNameRef}
                id="businessName"
                name="businessName"
                value={this.state.accountFormInputFields.businessName.value}
                errorMessage={
                  this.state.accountFormInputFields.businessName.isError
                    ? IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        this.state.accountFormInputFields.businessName
                          .errorMessage
                      )
                    : null
                }
                onChange={this.handleFormFieldChange}
                onBlur={this.handleFormFieldBlur}
                label={IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.businessName"
                )}
                className="page-form-textfield"
              />
            </Col>
            <Col xl={3} lg={3} md={5} xs={12} className="m-t-10 m-r-10">
              <TextField
                maxLength={50}
                id="customerDomains"
                name="customerDomains"
                componentRef={this.customerDomainsRef}
                onBlur={this.handleFormFieldBlur}
                errorMessage={
                  this.state.accountFormInputFields.customerDomains.isError
                    ? IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        this.state.accountFormInputFields.customerDomains
                          .errorMessage
                      )
                    : null
                }
                value={this.state.accountFormInputFields.customerDomains.value}
                onChange={this.handleFormFieldChange}
                label={
                  <div className="quote-account-form-tooltip">
                    <Label className="m-0 p-0" required={true}>
                      {IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        "content.customerDomains"
                      )}
                    </Label>
                    <TooltipHost
                      content={IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        "content.tooltip.customerDomainsInfo"
                      )}
                    >
                      <InfoIcon />
                    </TooltipHost>
                  </div>
                }
                className="page-form-textfield"
              />
            </Col>
          </Row>
          <Row className="m-0 p-0">
            <Col xl={3} lg={3} md={5} xs={12} className="m-t-10 m-r-10">
              <TextField
                maxLength={50}
                required
                componentRef={this.billingAccountNumberRef}
                id="billingAccountNumber"
                name="billingAccountNumber"
                value={
                  this.state.accountFormInputFields.billingAccountNumber.value
                }
                errorMessage={
                  this.state.accountFormInputFields.billingAccountNumber.isError
                    ? IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        this.state.accountFormInputFields.billingAccountNumber
                          .errorMessage
                      )
                    : null
                }
                onChange={this.handleFormFieldChange}
                onBlur={this.handleFormFieldBlur}
                label={IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.billingAccountNumber"
                )}
                className="page-form-textfield"
              />
            </Col>
          </Row>

          <Row className="m-0 p-0 m-t-15">
            <Col xl={12} className="m-t-20">
              <Text className="text-fw-semibold text-fc-primary text-fs-medium">
                {IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.addressDetails"
                )}
              </Text>
            </Col>
          </Row>

          <Row className="m-0 p-0">
            <Col xl={3} lg={3} md={5} xs={12} className="m-t-10 m-r-10">
              <TextField
                maxLength={100}
                required
                componentRef={this.addLine1Ref}
                id="addLine1"
                name="addLine1"
                value={this.state.accountFormInputFields.addLine1.value}
                errorMessage={
                  this.state.accountFormInputFields.addLine1.isError
                    ? IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        this.state.accountFormInputFields.addLine1.errorMessage
                      )
                    : null
                }
                onChange={this.handleFormFieldChange}
                onBlur={this.handleFormFieldBlur}
                label={IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.streetAddress1"
                )}
                className="page-form-textfield"
              />
            </Col>
            <Col xl={3} lg={3} md={5} xs={12} className="m-t-10 m-r-10">
              <TextField
                maxLength={100}
                id="addLine2"
                name="addLine2"
                value={this.state.accountFormInputFields.addLine2.value}
                errorMessage={
                  this.state.accountFormInputFields.addLine2.isError
                    ? IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        this.state.accountFormInputFields.addLine2.errorMessage
                      )
                    : null
                }
                onBlur={this.handleFormFieldBlur}
                onChange={this.handleFormFieldChange}
                label={IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.streetAddress2"
                )}
                className="page-form-textfield"
              />
            </Col>
          </Row>
          <Row className="m-0 p-0">
            <Col xl={3} lg={3} md={5} xs={12} className="m-t-10 m-r-10">
              <TextField
                maxLength={50}
                required
                id="city"
                name="city"
                componentRef={this.cityRef}
                value={this.state.accountFormInputFields.city.value}
                errorMessage={
                  this.state.accountFormInputFields.city.isError
                    ? IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        this.state.accountFormInputFields.city.errorMessage
                      )
                    : null
                }
                onBlur={this.handleFormFieldBlur}
                onChange={this.handleFormFieldChange}
                label={IntlUtil.getText(this._intl_ns_oc_quote, "content.city")}
                className="page-form-textfield"
              />
            </Col>
            <Col xl={3} lg={3} md={5} xs={12} className="m-t-10 m-r-10">
              <TextField
                maxLength={50}
                required
                id="state"
                name="state"
                componentRef={this.stateRef}
                value={this.state.accountFormInputFields.state.value}
                errorMessage={
                  this.state.accountFormInputFields.state.isError
                    ? IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        this.state.accountFormInputFields.state.errorMessage
                      )
                    : null
                }
                onBlur={this.handleFormFieldBlur}
                onChange={this.handleFormFieldChange}
                label={IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.state"
                )}
                className="page-form-textfield"
              />
            </Col>
          </Row>
          <Row className="m-0 p-0">
            <Col xl={3} lg={3} md={5} xs={12} className="m-t-10 m-r-10">
              <SearchDropdown
                required
                componentRef={this.countryRef}
                id="country"
                name="country"
                selectedKey={this.state.accountFormInputFields.country.value}
                onChange={(e, option) => {
                  this.setFormFieldValue("country", option.key);
                }}
                onBlur={(e, option) => this.validateFormField(e.target.id)}
                errorMessage={
                  this.state.accountFormInputFields.country.isError
                    ? IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        this.state.accountFormInputFields.country.errorMessage
                      )
                    : null
                }
                label={IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.country"
                )}
                className="page-form-dropdown"
                options={getCountryStatesList(this.props.countryStatesData)}
              />
            </Col>
            <Col xl={3} lg={3} md={5} xs={12} className="m-t-10 m-r-10">
              <TextField
                maxLength={10}
                required
                componentRef={this.postalCodeRef}
                id="postalCode"
                name="postalCode"
                onBlur={this.handleFormFieldBlur}
                value={this.state.accountFormInputFields.postalCode.value}
                errorMessage={
                  this.state.accountFormInputFields.postalCode.isError
                    ? IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        this.state.accountFormInputFields.postalCode
                          .errorMessage
                      )
                    : null
                }
                onChange={this.handleFormFieldChange}
                label={IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.zipCode"
                )}
                className="page-form-textfield"
              />
            </Col>
          </Row>
          <Row className="m-0 p-0 m-t-15">
            <Col xl={12} className="m-t-20">
              <Text className="text-fw-semibold text-fc-primary text-fs-medium">
                {IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.contactDetails"
                )}
              </Text>
            </Col>
          </Row>
          <Row className="m-0 p-0">
            <Col xl={3} lg={3} md={5} xs={12} className="m-t-10 m-r-10">
              <TextField
                maxLength={50}
                required
                componentRef={this.firstNameRef}
                id="firstName"
                name="firstName"
                value={this.state.accountFormInputFields.firstName.value}
                errorMessage={
                  this.state.accountFormInputFields.firstName.isError
                    ? IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        this.state.accountFormInputFields.firstName.errorMessage
                      )
                    : null
                }
                onChange={this.handleFormFieldChange}
                onBlur={this.handleFormFieldBlur}
                label={IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.firstName"
                )}
                className="page-form-textfield"
              />
            </Col>
            <Col xl={3} lg={3} md={5} xs={12} className="m-t-10 m-r-10">
              <TextField
                required
                componentRef={this.lastNameRef}
                id="lastName"
                name="lastName"
                value={this.state.accountFormInputFields.lastName.value}
                errorMessage={
                  this.state.accountFormInputFields.lastName.isError
                    ? IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        this.state.accountFormInputFields.lastName.errorMessage
                      )
                    : null
                }
                onChange={this.handleFormFieldChange}
                onBlur={this.handleFormFieldBlur}
                label={IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.lastName"
                )}
                className="page-form-textfield"
              />
            </Col>
          </Row>
          <Row className="m-0 p-0">
            <Col xl={3} lg={3} md={5} xs={12} className="m-t-10 m-r-10">
              <TextField
                maxLength={100}
                required
                id="email"
                name="email"
                componentRef={this.emailRef}
                onBlur={this.handleFormFieldBlur}
                value={this.state.accountFormInputFields.email.value}
                errorMessage={
                  this.state.accountFormInputFields.email.isError
                    ? IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        this.state.accountFormInputFields.email.errorMessage
                      )
                    : null
                }
                onChange={this.handleFormFieldChange}
                label={IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.emailAddress"
                )}
                className="page-form-textfield"
              />
            </Col>
            <Col xl={3} lg={3} md={5} xs={12} className="m-t-10 m-r-10">
              <TextField
                maxLength={20}
                id="phone"
                name="phone"
                value={this.state.accountFormInputFields.phone.value}
                errorMessage={
                  this.state.accountFormInputFields.phone.isError
                    ? IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        this.state.accountFormInputFields.phone.errorMessage
                      )
                    : null
                }
                onChange={this.handlePhoneFormFieldChange}
                label={IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.phone"
                )}
                className="page-form-textfield"
              />
            </Col>
          </Row>
        </Grid>
      </>
    );
  };

  render() {
    return (
      <>
        <div className="page-frame-content frame-content-quotes">
          <div>
            {this.renderCompanyDetails()}
            <div className="page-content-separator"></div>
            <div className="m-t-10">
              <PrimaryButton
                onClick={this.handleAccountAddDialog}
                className="oc-quote-page-footer-actions page-frame-button"
              >
                <AddFriendIcon className="page-frame-icon m-r-5" />
                {IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.createAccount"
                )}
              </PrimaryButton>
            </div>
          </div>
          {this.renderSubscriberAddDialog()}
          <PageOverlayLoader
            hidden={this.state.isPageDataFetched}
            label={IntlUtil.getText(
              this._intl_ns_oc_common,
              "content.loadingInprogress"
            )}
          />
          <CustomPageAppInsights
            pageTitle={IntlUtil.getText(
              this._intl_ns_oc_quote,
              "title.createAccount"
            )}
          />
          <AppPageTitle
            pageTitle={IntlUtil.getText(
              this._intl_ns_oc_quote,
              "title.createAccount"
            )}
          />
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  quoteEstimatorInfo: state.quoteStore.quoteEstimatorInfo,
  countryStatesData: state.generalStore.countryStatesData,
});
const mapActionToProps = {
  setQuoteProgressPage,
  setQuoteEstimatorInfoSubscriberQuoteRecords,
  setQuoteEstimatorInfoQuoteSubscriberDetails,
};

export default withTranslation()(
  connect(mapStateToProps, mapActionToProps)(AccountCreate)
);
