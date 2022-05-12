import {
  Checkbox,
  Text,
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  IconButton,
  Pivot,
  PivotItem,
  PrimaryButton,
  TextField,
} from "@fluentui/react";
import {
  DownloadIcon,
  PaymentCardIcon,
  UploadIcon,
} from "@fluentui/react-icons";
import axios from "axios";
import React, { Component } from "react";
import { Col, Grid, Row } from "react-flexbox-grid";
import { connect } from "react-redux";
import { manageError } from "../../../core/actions/common-actions";
import { AppPageTitle } from "../../../core/components/app-page-title";
import IntlUtil from "../../../core/helpers/intl-util";
import PageUtil from "../../../core/helpers/page-util";
import TelemetryUtil from "../../../core/helpers/telemetry-util";
import { AppConfigProps } from "../../../core/settings/app-config";
import PageOverlayLoader from "../../common/helpers/page-overlay-loader";
import { OperatorConnectConstants } from "../../common/settings/operator-connect-constants";
import {
  savePayment,
  setQuoteProgressPage,
  setQuoteEstimatorInfoSubscriberQuoteRecords,
  setQuoteEstimatorInfoQuoteSubscriberDetails,
} from "../actions/quote-action";
import { QuotePOFormFields } from "../settings/quote-user-form-fields";

class OrderCheckout extends Component {
  _isMounted = false;
  _axiosSource = axios.CancelToken.source();
  _cancelToken = { cancelToken: this._axiosSource.token };
  _intl_ns_oc_quote = "oc_quote";
  _intl_ns_oc_common = "oc_common";

  constructor(props) {
    super(props);
    this.quoteFromUploadRef = React.createRef();
    this.state = {
      paymentTabs: OperatorConnectConstants.QUOTE.ORDER_CHECKOUT.PAYMENT_TABS,
      tabSelected:
        OperatorConnectConstants.QUOTE.ORDER_CHECKOUT.PAYMENT_TABS[0],
      attachment: null,
      isChecked: false,
      companyPoFormInputFIelds: this.initCompanyPOFormInputFields(),
      isCompanyPoFormFilled: false,
      quoteFileErrors: null,
      isPageDataFetched: false,
      isPaymentDialogHidden: true,
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
    PageUtil.scrollToTop();
    TelemetryUtil.trackPageView(
      IntlUtil.getText(this._intl_ns_oc_quote, "title.checkout")
    );
    await this.setStateAsync({ isPageDataFetched: true });
    await this.loadPageData();
  }

  loadPageData = async () => {
    if (
      this.props.quoteEstimatorInfo &&
      this.props.quoteEstimatorInfo.subscriberDetails
    ) {
      await this.setFormFieldValues(
        this.props.quoteEstimatorInfo.subscriberDetails
      );
    }
  };

  componentWillUnmount() {
    this._isMounted = false;
    this._axiosSource.cancel(
      IntlUtil.getText(
        this._intl_ns_common,
        "notification.warning.requestCancelled"
      )
    );
  }

  initCompanyPOFormInputFields = () => {
    let refCollection = {};
    return QuotePOFormFields(refCollection);
  };

  setFormFieldValues = async (serviceRecord) => {
    if (serviceRecord) {
      await this.setStateAsync({
        companyPoFormInputFIelds: {
          ...this.state.companyPoFormInputFIelds,
          quoteName: {
            ...this.state.companyPoFormInputFIelds["quoteName"],
            value: serviceRecord?.quoteName ?? "",
          },
          email: {
            ...this.state.companyPoFormInputFIelds["email"],
            value: serviceRecord?.email ?? "",
          },
          phone: {
            ...this.state.companyPoFormInputFIelds["phone"],
            value: serviceRecord?.phone ?? "",
          },
        },
      });
    }
  };

  setFormFieldValue = async (fieldName, fieldValue) => {
    if (fieldName && this.state.companyPoFormInputFIelds) {
      await this.setStateAsync({
        companyPoFormInputFIelds: {
          ...this.state.companyPoFormInputFIelds,
          [fieldName]: {
            ...this.state.companyPoFormInputFIelds[fieldName],
            value: fieldValue,
          },
        },
      });
    }
  };

  isCompanyPoFormFilled = () => {
    let isFormFilled = false;
    if (
      this.state.companyPoFormInputFIelds.companyPO.value?.trim() !== "" &&
      this.state.companyPoFormInputFIelds.companyPO.isError === false &&
      this.state.companyPoFormInputFIelds.quoteName.value?.trim() !== "" &&
      this.state.companyPoFormInputFIelds.quoteName.isError === false &&
      this.state.companyPoFormInputFIelds.email.value?.trim() !== "" &&
      this.state.companyPoFormInputFIelds.email.isError === false &&
      this.state.companyPoFormInputFIelds.phone.isError === false
    ) {
      isFormFilled = true;
    }
    return isFormFilled;
  };

  validateCompanyPOFormField = async (fieldName) => {
    if (fieldName && this.state.companyPoFormInputFIelds) {
      let fieldObj = this.state.companyPoFormInputFIelds[fieldName];
      if (fieldObj.isRequired === true) {
        let errorStatus = false;
        if (fieldObj.validate(fieldObj.value) === false) {
          errorStatus = true;
        }
        await this.setStateAsync({
          companyPoFormInputFIelds: {
            ...this.state.companyPoFormInputFIelds,
            [fieldName]: {
              ...this.state.companyPoFormInputFIelds[fieldName],
              isError: errorStatus,
            },
          },
        });
      }
      let formFilled = await this.isCompanyPoFormFilled();
      await this.setStateAsync({ isCompanyPoFormFilled: formFilled });
    }
  };

  handleTabSelect = async (tab) => {
    let tabSelected = null;
    let headerText = tab.props.itemKey;
    if (this.state.paymentTabs) {
      tabSelected = this.state.paymentTabs.find((tab) => {
        return tab.tabName === headerText;
      });
    }
    await this.setStateAsync({
      tabSelected: tabSelected,
    });
  };

  uploadOrderCheckoutFile = async (readerEvent) => {
    let binaryString = readerEvent.target.result;
    let base64String = btoa(binaryString);
    await this.setStateAsync({
      attachment: {
        ...this.state.attachment,
        fileContent: base64String,
      },
    });

    await this.setStateAsync({ quoteFileErrors: null });
  };

  handleFormFieldChange = async (e) => {
    if (e && e.target) {
      await this.setFormFieldValue(e.target.id, e.target.value);
      await this.setStateAsync({
        isCompanyPoFormFilled: this.isCompanyPoFormFilled(),
      });
      await this.setStateAsync({ quoteFileErrors: null });
    }
  };

  handleFormFieldBlur = async (e) => {
    if (e && e.target) {
      await this.validateCompanyPOFormField(e.target.id);
    }
  };

  handleOrderFormAttachmentChange = async (e) => {
    if (e && e.target.files && e.target.files.length === 1) {
      await this.setStateAsync({ quoteFileErrors: null });
      let file = e.target.files[0];
      e.target.value = "";
      if (file) {
        let fileType = file.type;
        if (file.type === "") {
          let fileNameExtension = file.name.split(".");
          if (fileNameExtension[1] && fileNameExtension[1].includes("docx")) {
            fileType =
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          } else if (
            fileNameExtension[1] &&
            fileNameExtension[1].includes("doc")
          ) {
            fileType = "application/msword";
          }
        }
        const isValidFileType = await this.isValidFileType(file);
        const isValidFileSize = await this.isValidFileSize(file);
        if (isValidFileType === true && isValidFileSize === true) {
          const fileObj = { fileName: file.name, fileType: fileType };
          await this.setStateAsync({ attachment: fileObj });

          const reader = new FileReader();
          reader.readAsBinaryString(file);
          reader.onload = await this.uploadOrderCheckoutFile.bind(this);
        } else {
          let errorMessage = "";
          if (isValidFileType === false) {
            errorMessage = "notification.error.attachmentFileTypeInvalid";
          } else if (isValidFileSize === false) {
            errorMessage = "notification.error.attachmentFileSizeInvalid";
          }
          await this.setStateAsync({
            quoteFileErrors: errorMessage,
          });
        }
      }
    }
  };

  closePaymentDialog = async () => {
    await this.setStateAsync({
      isPaymentDialogHidden: true,
    });
  };

  isValidFileType = async (file) => {
    let isValid = false;
    if (file) {
      const fileName = file.name;
      if (fileName && fileName.length > 0) {
        OperatorConnectConstants.QUOTE.ORDER_CHECKOUT.ATTACHMENT_FILE_TYPES.forEach(
          (fileType) => {
            if (
              fileName
                .substr(fileName.length - fileType.length, fileType.length)
                .toLowerCase() === fileType.toLowerCase()
            ) {
              isValid = true;
            }
          }
        );
      }
    }
    return isValid;
  };

  isValidFileSize = async (file) => {
    let isValid = false;
    if (file) {
      if (
        file.size <=
        parseInt(
          OperatorConnectConstants.QUOTE.ORDER_CHECKOUT.ATTACHMENT_FILE_MAX_SIZE
        ) *
          1024
      ) {
        isValid = true;
      }
    }
    return isValid;
  };

  handleDownloadFile = () => {
    window.open(
      OperatorConnectConstants.QUOTE.ORDER_CHECKOUT.SERVICE_ORDER_FORM_URL,
      "_blank"
    );
  };

  handlePaymentFormSubmit = async () => {
    let isFormFilled = true;
    if (this.state.companyPoFormInputFIelds) {
      PageUtil.scrollToTop();
      await this.setStateAsync({ isPaymentDialogHidden: true });
      for (const fieldName in this.state.companyPoFormInputFIelds) {
        await this.validateCompanyPOFormField(fieldName);
      }
      for (const fieldName in this.state.companyPoFormInputFIelds) {
        let fieldObj = this.state.companyPoFormInputFIelds[fieldName];
        if (fieldObj.isRequired === true && fieldObj.isError === true) {
          isFormFilled = false;
          break;
        }
      }
      let attachmentsFile =
        this.state.attachment !== "" && this.state.attachment !== null
          ? [{ ...this.state.attachment, fileTitle: "Service Order Form" }]
          : [];
      if (isFormFilled === true) {
        await this.setStateAsync({ isPageDataFetched: false });
        let paymentObj = {
          paymentType:
            this.state.tabSelected.tabName ===
            OperatorConnectConstants.QUOTE.ORDER_CHECKOUT.PAYMENT_TABS[0]
              .tabName
              ? OperatorConnectConstants.QUOTE.ORDER_CHECKOUT.ORDER_TYPE
                  .PURCHASE_ORDER
              : OperatorConnectConstants.QUOTE.ORDER_CHECKOUT.ORDER_TYPE
                  .CREDIT_CARD,
          creditCardData: null,
          purchaseOrderData: {
            orderNumber:
              this.state.companyPoFormInputFIelds?.companyPO?.value?.trim(),
            name: this.state.companyPoFormInputFIelds?.quoteName?.value?.trim(),
            email: this.state.companyPoFormInputFIelds?.email?.value?.trim(),
            phone: this.state.companyPoFormInputFIelds.phone?.value?.trim(),
          },
          attachments: attachmentsFile,
        };
        let quoteId =
          this.props?.quoteEstimatorInfo?.subscriberQuoteRecords?.quoteId;
        await savePayment(quoteId, paymentObj, this._cancelToken)
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
                  OperatorConnectConstants.QUOTE.PROGRESS.ORDER_CONFIRMATION
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
              await this.setStateAsync({ isPageDataFetched: true });
            }
          })
          .catch(async (err) => {
            await this.setStateAsync({ isPageDataFetched: true });
            await manageError(err, this.props.location, this.props.navigate);
          });
      } else {
        for (const fieldName in this.state.companyPoFormInputFIelds) {
          let fieldObj = this.state.companyPoFormInputFIelds[fieldName];
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

  handleOrderFormAttachmentClick = async (e) => {
    this.quoteFromUploadRef?.current.click();
  };

  renderCreditCardDetails = () => {
    return (
      <>
        <Grid fluid className="m-0 p-l-5 p-t-20">
          <Row>
            <Col xl={12}>
              <span className="text-fw-semibold text-fc-primary text-fs-medium">
                {IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.makeYourPayment"
                )}
              </span>
            </Col>
          </Row>
          <Row>
            <Col xl={4} className="m-t-10">
              <TextField
                maxLength={100}
                disabled={true}
                className="page-form-textfield"
                suffix={<PaymentCardIcon />}
                label={IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.cardNumber"
                )}
              />
            </Col>
          </Row>
          <Row>
            <Col xl={2} className="m-t-10">
              <TextField
                maxLength={20}
                disabled={true}
                className="page-form-textfield"
                label={IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.expiryDate"
                )}
              />
            </Col>
            <Col xl={2} className="m-t-10">
              <TextField
                maxLength={20}
                disabled={true}
                className="page-form-textfield"
                label={IntlUtil.getText(this._intl_ns_oc_quote, "content.cvv")}
              />
            </Col>
          </Row>
          <Row>
            <Col xl={4} className="m-t-10">
              <TextField
                maxLength={20}
                disabled={true}
                className="page-form-textfield"
                label={IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.nameOnCard"
                )}
              />
            </Col>
          </Row>
        </Grid>
      </>
    );
  };

  renderPaymentSaveDialog = () => {
    return (
      <Dialog
        modalProps={{ className: "quote-dialog-wrapper" }}
        hidden={this.state.isPaymentDialogHidden}
        dialogContentProps={{
          type: DialogType.normal,
          showCloseButton: false,
          title: IntlUtil.getText(
            this._intl_ns_oc_quote,
            "notification.warning.checkoutOrderTitle"
          ),
          subText: (
            <>
              <Text>
                {IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "notification.warning.checkoutOrderTextPrefix"
                )}
                {"?"}
              </Text>
            </>
          ),
        }}
      >
        <DialogFooter>
          <PrimaryButton onClick={() => this.handlePaymentFormSubmit()}>
            {IntlUtil.getText(this._intl_ns_oc_common, "content.yes")}
          </PrimaryButton>
          )
          <DefaultButton onClick={() => this.closePaymentDialog()}>
            {IntlUtil.getText(this._intl_ns_oc_common, "content.no")}
          </DefaultButton>
        </DialogFooter>
      </Dialog>
    );
  };

  renderCompanyDetails = () => {
    return (
      <>
        <Grid fluid className="m-0 p-l-5">
          <Row>
            <Col xl={3} lg={4} md={4} xs={12} className="m-t-15">
              <TextField
                required
                value={this.state.companyPoFormInputFIelds.companyPO.value}
                onChange={this.handleFormFieldChange}
                onBlur={this.handleFormFieldBlur}
                id="companyPO"
                name="companyPO"
                label={IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.companyPo"
                )}
                className="page-form-textfield"
                errorMessage={
                  this.state.companyPoFormInputFIelds.companyPO.isError
                    ? IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        this.state.companyPoFormInputFIelds.companyPO
                          .errorMessage
                      )
                    : null
                }
              />
            </Col>
          </Row>
          <Row>
            <Col xl={3} lg={4} md={4} xs={12} className="m-t-10">
              <TextField
                maxLength={50}
                value={this.state.companyPoFormInputFIelds.quoteName.value}
                onChange={this.handleFormFieldChange}
                onBlur={this.handleFormFieldBlur}
                required
                id="quoteName"
                name="quoteName"
                label={IntlUtil.getText(this._intl_ns_oc_quote, "content.name")}
                className="page-form-textfield"
                errorMessage={
                  this.state.companyPoFormInputFIelds.quoteName.isError
                    ? IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        this.state.companyPoFormInputFIelds.quoteName
                          .errorMessage
                      )
                    : null
                }
              />
            </Col>

            <Col xl={3} lg={4} md={4} xs={12} className="m-t-10">
              <TextField
                maxLength={100}
                value={this.state.companyPoFormInputFIelds.email.value}
                onChange={this.handleFormFieldChange}
                onBlur={this.handleFormFieldBlur}
                required
                id="email"
                name="email"
                errorMessage={
                  this.state.companyPoFormInputFIelds.email.isError
                    ? IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        this.state.companyPoFormInputFIelds.email.errorMessage
                      )
                    : null
                }
                label={IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.email"
                )}
                className="page-form-textfield"
              />
            </Col>
            <Col xl={3} lg={4} md={4} xs={12} className="m-t-10">
              <TextField
                maxLength={20}
                value={this.state.companyPoFormInputFIelds.phone.value}
                onChange={this.handleFormFieldChange}
                onBlur={this.handleFormFieldBlur}
                id="phone"
                name="phone"
                label={IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.phone"
                )}
                className="page-form-textfield"
                errorMessage={
                  this.state.companyPoFormInputFIelds.phone.isError
                    ? IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        this.state.companyPoFormInputFIelds.phone.errorMessage
                      )
                    : null
                }
              />
            </Col>
          </Row>
          <Row className="">
            <Col xl={12} className="m-t-20">
              <span className="text-fw-semibold text-fc-primary text-fs-medium">
                {IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.serviceOrderForm"
                )}
              </span>
            </Col>
          </Row>
          <Row>
            <Col xl={12} className="m-t-10 ">
              {IntlUtil.getText(
                this._intl_ns_oc_quote,
                "content.downloadTheForm"
              )}
            </Col>
          </Row>
          <Row>
            <Col xl={12} className="m-t-15">
              <DefaultButton
                onClick={this.handleDownloadFile}
                className="page-frame-button oc-order-create-page-button"
              >
                <DownloadIcon className="page-frame-icon m-r-5" />
                {IntlUtil.getText(this._intl_ns_oc_quote, "content.download")}
              </DefaultButton>
            </Col>
          </Row>
          <Row>
            <Col xs={2} sm={2} md={2} lg={2} xl={12} className="m-t-20">
              <div className="quote-attachment-wrapper">
                <div className="quote-btn-wrapper">
                  <DefaultButton
                    onClick={(e) => {
                      this.handleOrderFormAttachmentClick(e);
                    }}
                    className="page-frame-button oc-order-create-page-button"
                  >
                    <UploadIcon className="page-frame-icon m-r-5" />
                    {IntlUtil.getText(this._intl_ns_oc_quote, "content.upload")}
                  </DefaultButton>
                  <input
                    type="file"
                    name="image"
                    id="file"
                    accept=".doc,.docx"
                    onChange={(e) => {
                      this.handleOrderFormAttachmentChange(e);
                      this.setStateAsync({ isSubmitDisabled: false });
                    }}
                    title=""
                    className="picture-edit-file"
                    ref={this.quoteFromUploadRef}
                  />
                </div>
                <span className="m-t-5 m-l-10">
                  {this.state.attachment?.fileName}
                </span>
                {this.state.attachment?.fileName ? (
                  <div className="m-l-10">
                    <IconButton
                      iconProps={{
                        iconName: "Cancel",
                        color: "white",
                      }}
                      onClick={() => {
                        this.setStateAsync({ attachment: null });
                      }}
                    ></IconButton>
                  </div>
                ) : null}
              </div>
            </Col>
          </Row>
          {this.state.quoteFileErrors ? (
            <Row className="m-t-10">
              <Col xl={12} className="text-fc-error">
                {IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  this.state.quoteFileErrors
                )}
              </Col>
            </Row>
          ) : null}
        </Grid>
      </>
    );
  };

  handleSavePaymentDialog = async () => {
    if (this.state.isCompanyPoFormFilled === true) {
      await this.setStateAsync({
        isPaymentDialogHidden: false,
      });
    } else {
      await this.setStateAsync({
        isPaymentDialogHidden: true,
      });
    }
  };

  handleCheckboxChange = async (e, option) => {
    await this.setStateAsync({ isChecked: option });
  };

  render() {
    return (
      <>
        <div
          className="page-frame-content frame-content-quotes"
          ref={this.orderCheckoutRef}
        >
          <span className="quote-page-text-wrapper text-fc-primary text-fw-semibold text-fs-large m-l-10">
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
          </span>
        </div>
        <div className="page-content-separator"></div>
        <div className="m-l-5">
          <Pivot
            className="order-payment-stats-tabs"
            selectedKey={this.state.tabSelected?.tabName}
            onLinkClick={(props) => {
              this.handleTabSelect(props);
            }}
            headersOnly={true}
            linkFormat="links"
          >
            {this.state.paymentTabs.map((tab, index) => {
              return (
                <PivotItem
                  key={`key-user-tab-${index}`}
                  headerText={IntlUtil.getText(
                    this._intl_ns_oc_quote,
                    `content.${tab.tabValue}`
                  )}
                  itemKey={tab.tabName}
                  // headerButtonProps={{
                  //     disabled: !this.state.isPageDataFetched,
                  // }}
                />
              );
            })}
            )
          </Pivot>
          <div>
            {this.state.tabSelected?.tabName ===
            OperatorConnectConstants.QUOTE.ORDER_CHECKOUT.PAYMENT_TABS[0]
              .tabName
              ? this.renderCompanyDetails()
              : null}
            {this.state.tabSelected?.tabName ===
            OperatorConnectConstants.QUOTE.ORDER_CHECKOUT.PAYMENT_TABS[1]
              .tabName
              ? this.renderCreditCardDetails()
              : null}
            <div className="term-text-wrapper">
              <Checkbox
                disabled={
                  this.state.tabSelected?.tabName ===
                  OperatorConnectConstants.QUOTE.ORDER_CHECKOUT.PAYMENT_TABS[1]
                    .tabName
                }
                checked={this.state.isChecked}
                className="m-t-20 m-l-5 m-r-10"
                onChange={(e, option) => this.handleCheckboxChange(e, option)}
                label={IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.termAgree"
                )}
              />{" "}
              {/* <span className="m-t-20 text-fc-primary text-underline cursor-pointer">{IntlUtil.getText(this._intl_ns_oc_quote,"content.termsAndConditions")}</span> */}
            </div>
          </div>
          <div className="page-content-separator"></div>
          {this.state.tabSelected?.tabName !==
          OperatorConnectConstants.QUOTE.ORDER_CHECKOUT.PAYMENT_TABS[1]
            .tabName ? (
            <div>
              <PrimaryButton
                onClick={this.handleSavePaymentDialog}
                disabled={
                  this.state.isChecked === false ||
                  this.state.isCompanyPoFormFilled === false
                }
                className="m-l-5 m-t-20 page-frame-button"
              >
                {IntlUtil.getText(this._intl_ns_oc_quote, "content.submit")}
              </PrimaryButton>
            </div>
          ) : (
            <PrimaryButton
              disabled={true}
              className="m-l-5 m-t-20 page-frame-button"
            >
              {IntlUtil.getText(this._intl_ns_oc_quote, "content.submit")}
            </PrimaryButton>
          )}{" "}
          <PageOverlayLoader
            hidden={this.state.isPageDataFetched}
            label={IntlUtil.getText(
              this._intl_ns_oc_common,
              "content.loadingInprogress"
            )}
          />
          <AppPageTitle
            pageTitle={IntlUtil.getText(
              this._intl_ns_oc_quote,
              "title.checkout"
            )}
          />
          {this.renderPaymentSaveDialog()}
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  quoteEstimatorInfo: state.quoteStore.quoteEstimatorInfo,
  // countryStatesData:state.generalStore.countryStatesData
});
const mapActionToProps = {
  setQuoteProgressPage,
  setQuoteEstimatorInfoSubscriberQuoteRecords,
  setQuoteEstimatorInfoQuoteSubscriberDetails,
};

export default connect(mapStateToProps, mapActionToProps)(OrderCheckout);
