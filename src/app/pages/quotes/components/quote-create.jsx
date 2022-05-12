import {
  ChoiceGroup,
  Text,
  DefaultButton,
  PrimaryButton,
  TextField,
  css,
  TooltipHost,
  TooltipOverflowMode,
  IconButton,
  Modal,
  MessageBar,
  MessageBarType,
  Dialog,
  DialogFooter,
  DialogType,
  ConstrainMode,
  CheckboxVisibility,
  SelectionMode,
  DetailsRow,
  Sticky,
  StickyPositionType,
  DetailsList,
  DetailsListLayoutMode,
} from "@fluentui/react";
import React, { Component } from "react";
import { Col, Grid, Row } from "react-flexbox-grid";
import { connect } from "react-redux";
import IntlUtil from "../../../core/helpers/intl-util";
import PageUtil from "../../../core/helpers/page-util";
import SearchDropdown from "../../common/helpers/search-dropdown";
import { ConfigProductFormFields } from "../settings/config-product-form-fields";
import _ from "lodash";
import {
  setQuoteEstimatorInfoProductRecords,
  setQuoteEstimatorInfoServiceAndConnectionRecords,
  setQuoteEstimatorInfoServiceAndConnectionCost,
  setQuoteEstimatorInfoQuoteSubscriberDetails,
  setQuoteEstimatorInfoCommunicationPlatformDocumentRecords,
  setQuoteEstimatorInfoGeneralDocumentRecords,
  setQuoteEstimatorInfoOnboardServiceDocumentRecords,
  setQuoteEstimatorInfoServiceDocumentRecords,
  setQuoteEstimatorInfoSubscriberQuoteRecords,
  getDocuments,
  getProductsAvailable,
  resetQuoteEstimatorInfo,
  setQuoteProgressPage,
  saveQuote,
} from "../actions/quote-action";
import axios from "axios";
import { OperatorConnectConstants } from "../../common/settings/operator-connect-constants";
import { QuoteEstimatorTableColumns } from "../settings/quote-estimator-table-columns";
import { QuoteUserFormFields } from "../settings/quote-user-form-fields";
import {
  ActivateOrdersIcon,
  ChevronRightMedIcon,
  ClearIcon,
  DownloadIcon,
  IncreaseIndentArrowIcon,
  InfoIcon,
  PreviewIcon,
  TextDocumentIcon,
} from "@fluentui/react-icons";
import { modalStyles } from "../../common/helpers/styles";
import QuoteBuilderEstimator from "../helper/quote-builder-estimator";
import { manageError } from "../../../core/actions/common-actions";
import { AppConfigProps } from "../../../core/settings/app-config";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";
import PageOverlayLoader from "../../common/helpers/page-overlay-loader";
import { getCountryQuoteStatesList } from "../../common/actions/general-actions";
import { AppPageTitle } from "../../../core/components/app-page-title";
import TelemetryUtil from "../../../core/helpers/telemetry-util";

class QuoteCreate extends Component {
  _isMounted = false;
  _axiosSource = axios.CancelToken.source();
  _cancelToken = { cancelToken: this._axiosSource.token };
  _intl_ns_oc_quote = "oc_quote";
  _intl_ns_oc_common = "oc_common";

  constructor(props) {
    super(props);
    this.state = {
      configProductFormInputFields: this.initConfigProductFormInputFields(),
      quoteUserFormInputFields: this.initQuoteUserFormInputFields(),
      connectionList: [],
      productServices: [],
      communicationPlatformList: [],
      tableHeaderColumns: this.initQuoteEstimatorheaderColumns(),
      isFormFilled: false,
      editedServiceRecord: null,
      isUserFormFilled: false,
      isPreviewModalOpen: false,
      quoteServiceSubmitStatus: null,
      quoteServiceError: null,
      isProductFieldsEnabled: false,
      deleteServiceRecord: null,
      isServiceDeleteDialogHidden: true,
      isPageDataFetched: false,
      quoteRecord: null,
      isSaveQuoteDialogHidden: true,
      processType: null,
      serviceErrorObject: null,
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
    PageUtil.scrollIntoView(this.quoteCreatePageRef);
    TelemetryUtil.trackPageView(
      IntlUtil.getText(this._intl_ns_oc_quote, "title.selectProducts")
    );
    await this.props.resetQuoteEstimatorInfo(this.props.quoteEstimatorInfo);
    await this.setStateAsync({ isPageDataFetched: true });
  }

  fetchDocuments = async () => {
    let communicationPlatforms = "";
    let communicationPlatformList = [];
    let services = "";
    let countries = "";
    if (
      this.props.quoteEstimatorInfo.serviceAndConnectionRecords &&
      this.props.quoteEstimatorInfo.serviceAndConnectionRecords.length > 0
    ) {
      await this.props.quoteEstimatorInfo.serviceAndConnectionRecords.forEach(
        (rec) => {
          if (countries.includes(rec.selectedCountry) === false) {
            let comma = countries !== "" && countries !== null ? "," : "";
            countries = countries + comma + rec.selectedCountry;
          }

          if (services.includes(rec.productName) === false) {
            let comma = services !== "" && services !== null ? "," : "";
            services = services + comma + rec.productName;
          }
          if (
            communicationPlatformList.includes(
              rec?.communicationPlatform?.platformName
            ) === false
          ) {
            if (
              rec.communicationPlatform &&
              rec.communicationPlatform.platformName
            ) {
              communicationPlatformList.push(
                rec.communicationPlatform.platformName
              );
            }
          }
        }
      );
    }
    await axios
      .all([
        getDocuments("Country", countries, this._cancelToken),
        getDocuments("Service", services, this._cancelToken),
        getDocuments("General", "Technical", this._cancelToken),
      ])

      .then(
        axios.spread(async (country, service, general) => {
          if (
            country &&
            country.status === AppConfigProps.httpStatusCode.ok &&
            country.data &&
            service &&
            service.status === AppConfigProps.httpStatusCode.ok &&
            service.data &&
            general &&
            general.status === AppConfigProps.httpStatusCode.ok &&
            general.data
          ) {
            if (country.data.records) {
              let onboardServiceDocumentRecords = country.data.records;
              let filteredConnections = [];
              let filteredOnboardServiceDocumentRecords = [];
              let selectedDocuments = [];

              if (
                this.props.quoteEstimatorInfo?.serviceAndConnectionRecords &&
                this.props.quoteEstimatorInfo?.serviceAndConnectionRecords
                  .length > 0
              ) {
                this.props.quoteEstimatorInfo?.serviceAndConnectionRecords.forEach(
                  (rec) => {
                    filteredConnections.push({ documentType: rec.connection });
                    selectedDocuments.push({
                      documentType: rec.connection,
                      countryName: rec.countryName,
                    });
                  }
                );

                _.forEach(onboardServiceDocumentRecords, (servDoc, key) => {
                  _.forEach(selectedDocuments, (filteredCountry, key2) => {
                    if (
                      servDoc.documentType === filteredCountry.documentType &&
                      servDoc.categoryName === filteredCountry.countryName
                    ) {
                      filteredOnboardServiceDocumentRecords.push(servDoc);
                    }
                  });
                });
                await onboardServiceDocumentRecords.forEach((doc) => {
                  if (filteredConnections.includes(doc.documentType) === true) {
                    filteredOnboardServiceDocumentRecords.push(doc);
                  }
                });

                let sortedDocuments = _.chain(
                  filteredOnboardServiceDocumentRecords
                )
                  .groupBy("categoryName")
                  .map((value, key) => ({ countryName: key, documents: value }))
                  .value();

                await this.props.setQuoteEstimatorInfoOnboardServiceDocumentRecords(
                  this.props.quoteEstimatorInfo,
                  sortedDocuments
                );
              }
            }
            if (service.data.records) {
              let serviceDocumentRecords = _.uniqBy(
                service.data.records,
                "documentNum"
              );

              await this.props.setQuoteEstimatorInfoServiceDocumentRecords(
                this.props.quoteEstimatorInfo,
                serviceDocumentRecords
              );
            }
            if (general.data.records) {
              let generalDocumentRecords = _.uniqBy(
                general.data.records,
                "documentNum"
              );

              await this.props.setQuoteEstimatorInfoGeneralDocumentRecords(
                this.props.quoteEstimatorInfo,
                generalDocumentRecords
              );
            }
          }
        })
      )
      .catch(async (err) => {
        await this.setStateAsync({ isPageDataFetched: true });
        await manageError(err, this.props.location, this.props.navigate);
      });
    communicationPlatforms = Object.values(communicationPlatformList).join(",");
    if (communicationPlatforms?.trim() !== "") {
      await getDocuments(
        "Communication Platform",
        communicationPlatforms,
        this._cancelToken
      )
        .then(async (communicationPlatform) => {
          if (
            communicationPlatform &&
            communicationPlatform.status === AppConfigProps.httpStatusCode.ok &&
            communicationPlatform.data
          ) {
            if (communicationPlatform.data.records) {
              let communicationPlatformDocumentRecords = _.uniqBy(
                communicationPlatform.data.records,
                "documentNum"
              );
              await this.props.setQuoteEstimatorInfoCommunicationPlatformDocumentRecords(
                this.props.quoteEstimatorInfo,
                communicationPlatformDocumentRecords
              );
            }
            //await this.setStateAsync({ isPageDataFetched: true });
          }
        })
        .catch(async (err) => {
          //await this.setStateAsync({ isPageDataFetched: true });
          await this.setStateAsync({
            isPageExitEnabled: false,
          });
          await manageError(err, this.props.history);
        });
    } else {
      await this.props.setQuoteEstimatorInfoCommunicationPlatformDocumentRecords(
        this.props.quoteEstimatorInfo,
        []
      );
      //await this.setStateAsync({ isPageDataFetched: true });
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
  isUserFormFilled = () => {
    let isFormFilled = false;
    if (
      this.state.quoteUserFormInputFields.quoteName.value?.trim() !== "" &&
      this.state.quoteUserFormInputFields.quoteName.isError === false &&
      this.state.quoteUserFormInputFields.email.value?.trim() !== "" &&
      this.state.quoteUserFormInputFields.email.isError === false &&
      this.state.quoteUserFormInputFields.phone.isError === false
    ) {
      isFormFilled = true;
    }
    return isFormFilled;
  };

  setProductDetails = async (logStatusMessage) => {
    if (
      this.state.quoteUserFormInputFields &&
      this.state.configProductFormInputFields
    ) {
      let presentService = this.props.quoteEstimatorInfo?.productRecords.find(
        (rec) =>
          rec.productId ===
          this.state.configProductFormInputFields.service.value
      );
      const customProperties = {
        CustomerData: {
          customerName: this.state.quoteUserFormInputFields.quoteName.value,
          customerEmail: this.state.quoteUserFormInputFields.email.value,
          customerPhone: this.state.quoteUserFormInputFields.phone.value,
        },
        ProductData: {
          countryName: this.state.quoteUserFormInputFields.country.value,
          productName: presentService.productName,
          planName: this.state.configProductFormInputFields.connection.value,
          communicationPlatform:
            this.state.configProductFormInputFields.communicationPlatform.value,
          quantity: parseInt(
            this.state.configProductFormInputFields.quantity.value
          ),
        },
      };
      TelemetryUtil.trackTrace(
        logStatusMessage,
        AppConfigProps.SeverityLevel.Verbose,
        customProperties
      );
    }
  };

  setDeletedProductDetails = async (item) => {
    if (this.state.quoteUserFormInputFields && item) {
      const customProperties = {
        CustomerData: {
          customerName: this.state.quoteUserFormInputFields.quoteName.value,
          customerEmail: this.state.quoteUserFormInputFields.email.value,
          customerPhone: this.state.quoteUserFormInputFields.phone.value,
        },
        ProductData: {
          countryName: item.countryName,
          productName: item.productName,
          planName: item.connection,
          communicationPlatform: item.communicationPlatform,
          quantity: item.quantity,
        },
      };
      TelemetryUtil.trackTrace(
        OperatorConnectConstants.AZURE_APPLICATION_INSIGHTS_LOG_MESSAGE
          .QUOTE_PRODUCT_DATA_DELETED,
        AppConfigProps.SeverityLevel.Verbose,
        customProperties
      );
    }
  };
  initQuoteEstimatorheaderColumns = () => {
    let tableHeaderColumns = [
      {
        key: "actions",
        name: IntlUtil.getText(this._intl_ns_oc_quote, "content.actions"),
        fieldName: "actions",
        data: "string",
        minWidth: 130,
        maxWidth: 130,
        isRowHeader: true,
        isResizable: true,
        isSortable: false,
        isSorted: false,
        isSortedDescending: false,
      },
    ];
    QuoteEstimatorTableColumns(this._intl_ns_oc_quote).forEach((table) => {
      if (table.fieldName === "nrc") {
        table.name = (
          <TooltipHost
            content={IntlUtil.getText(
              this._intl_ns_oc_quote,
              "content.tooltip.nrc"
            )}
          >
            <span>
              {IntlUtil.getText(this._intl_ns_oc_quote, table.name)}
              <InfoIcon className="m-l-5" />
            </span>
          </TooltipHost>
        );
      } else if (table.fieldName === "mrc") {
        table.name = (
          <TooltipHost
            content={IntlUtil.getText(
              this._intl_ns_oc_quote,
              "content.tooltip.mrc"
            )}
          >
            <span>
              {IntlUtil.getText(this._intl_ns_oc_quote, table.name)}
              <InfoIcon className="m-l-5" />
            </span>
          </TooltipHost>
        );
      } else {
        table.name = IntlUtil.getText(this._intl_ns_oc_quote, table.name);
      }
      tableHeaderColumns.push({ ...table });
    });
    return tableHeaderColumns;
  };
  handleConfigProductDropdownChange = async (e, option) => {
    await this.setFormFieldValue(e.target.id, option.key);
    await this.validateFormField(e.target.id);

    if (e.target.id === "service") {
      await this.setSelectedProduct(option.key);
    }
    await this.setStateAsync({
      isFormFilled: await this.isFormFilled(),
    });
    await this.clearAlert();
  };

  setSelectedProduct = async (productId) => {
    let connectionValue = "";
    let selectedServiceConditions = "";
    let connectionList = [];
    let filteredCommunicationPlatform = "";

    if (
      this.props.quoteEstimatorInfo?.productRecords &&
      this.props.quoteEstimatorInfo?.productRecords.length > 0
    ) {
      await this.props.quoteEstimatorInfo?.productRecords.forEach((rec) => {
        if (rec.productId === productId) {
          selectedServiceConditions = rec.conditions;
          if (rec.communicationPlatforms) {
            rec.communicationPlatforms.forEach((platform) => {
              filteredCommunicationPlatform = platform.name;
            });
          }
          if (rec.planTypes && rec.planTypes.length > 0) {
            rec.planTypes.forEach((planType) => {
              if (rec.planTypes.length === 1) {
                connectionValue = planType.planName;
              } else {
                connectionValue = "";
              }
              connectionList.push({
                key: planType.planName,
                text: planType.planName,
              });
            });
          }
        }
      });
    }
    await this.setStateAsync({ isServiceDisabled: false });
    await this.setFormFieldValue("connection", connectionValue);
    await this.setFormFieldValue(
      "communicationPlatform",
      filteredCommunicationPlatform
    );
    await this.setStateAsync({
      editedServiceRecord: null,
      selectedServiceConditions: selectedServiceConditions,
    });
    await this.setStateAsync({ connectionList: connectionList });
  };

  isFormFilled = async () => {
    let isFormFilled = false;
    if (
      this.state.configProductFormInputFields?.service?.value
        ?.toLowerCase()
        ?.trim() !== "" &&
      this.state.configProductFormInputFields?.connection?.value
        ?.toLowerCase()
        ?.trim() !== "" &&
      this.state.configProductFormInputFields?.communicationPlatform.value !==
        "" &&
      this.state.configProductFormInputFields?.quantity?.value !== "" &&
      this.state.quoteUserFormInputFields?.name?.value
        ?.toLowerCase()
        ?.trim() !== "" &&
      this.state.quoteUserFormInputFields?.email?.value
        ?.toLowerCase()
        ?.trim() !== ""
    ) {
      isFormFilled = true;
    }
    return isFormFilled;
  };
  validateFormField = async (fieldName) => {
    if (fieldName && this.state.configProductFormInputFields) {
      let fieldObj = this.state.configProductFormInputFields[fieldName];
      if (fieldObj.isRequired === true) {
        let errorStatus = false;
        if (fieldObj.validate(fieldObj.value) === false) {
          errorStatus = true;
        }
        await this.setStateAsync({
          configProductFormInputFields: {
            ...this.state.configProductFormInputFields,
            [fieldName]: {
              ...this.state.configProductFormInputFields[fieldName],
              isError: errorStatus,
            },
          },
        });
      }
      let formFilled = await this.isFormFilled();
      await this.setStateAsync({ isFormFilled: formFilled });
    }
  };

  validateUserFormField = async (fieldName) => {
    if (fieldName && this.state.quoteUserFormInputFields) {
      let fieldObj = this.state.quoteUserFormInputFields[fieldName];
      if (fieldObj.isRequired === true) {
        let errorStatus = false;
        if (fieldObj.validate(fieldObj.value) === false) {
          errorStatus = true;
        }
        await this.setStateAsync({
          quoteUserFormInputFields: {
            ...this.state.quoteUserFormInputFields,
            [fieldName]: {
              ...this.state.quoteUserFormInputFields[fieldName],
              isError: errorStatus,
            },
          },
        });
      }
      let formFilled = this.isUserFormFilled();
      await this.setStateAsync({ isUserFormFilled: formFilled });
    }
  };

  handleEditServiceRecord = async (e, item) => {
    let connectionList = [];
    let planTypes = [];
    if (item) {
      await this.clearAlert();
      await this.fetchProductsAvailable(item.selectedCountry);
      await this.setUserFormFieldValue("country", item.selectedCountry);
      if (
        this.props.quoteEstimatorInfo?.productRecords &&
        this.props.quoteEstimatorInfo?.productRecords.length > 0
      ) {
        if (this.props.pageType === "edit") {
          let communicationPlatformList = [];
          let communicationPlatforms = [];
          let filteredCommunicationPlatforms = [];
          let selectedServiceConditions = "";
          await this.props.quoteEstimatorInfo?.productRecords.forEach((rec) => {
            if (rec.productId === item.productId) {
              selectedServiceConditions = rec.conditions;
              if (rec.communicationPlatforms) {
                rec.communicationPlatforms.forEach((platform) => {
                  communicationPlatforms.push({
                    key: platform.name,
                    text: platform.name,
                  });
                });
                planTypes = rec.planTypes;
                rec.planTypes.forEach((planType) => {
                  if (
                    planType.planName?.toLowerCase().trim() ===
                    item.connection?.toLowerCase().trim()
                  ) {
                    connectionList.push({
                      key: planType.planName,
                      text: planType.planName,
                    });
                  } else {
                    connectionList.push({
                      key: planType.planName,
                      text: planType.planName,
                    });
                  }
                });
              }
            }
          });
          let serviceAndConnectionRecords = [];
          await this.props.quoteEstimatorInfo.serviceAndConnectionRecords.forEach(
            (rec) => {
              if (rec.productId === item.productId) {
                rec.planTypes = planTypes;
                serviceAndConnectionRecords.push({ ...rec });
              } else {
                serviceAndConnectionRecords.push(rec);
              }
            }
          );
          await this.props.setQuoteEstimatorInfoServiceAndConnectionRecords(
            this.props.quoteEstimatorInfo,
            serviceAndConnectionRecords
          );
          communicationPlatforms = Array.from(new Set(communicationPlatforms));

          communicationPlatformList = _.orderBy(
            communicationPlatforms,
            ["key"],
            "asc"
          );
          await this.setStateAsync({
            communicationPlatformList: communicationPlatformList,
            connectionList: connectionList,
            selectedServiceConditions: selectedServiceConditions,
          });
          await this.setFormFieldValues(item);
          if (filteredCommunicationPlatforms.length === 0) {
            await this.setFormFieldValue(
              "communicationPlatform",
              "No Platform"
            );
            await this.validateFormField("communicationPlatform");
          }
        }
      }
      await this.setStateAsync({ editedServiceRecord: null });
      await this.setStateAsync({ isHostEnabled: true });
      if (this.props.pageType !== "edit") {
        let communicationPlatformList = [];
        let communicationPlatforms = [];
        let filteredCommunicationPlatforms = [];
        let selectedServiceConditions = "";
        await this.props.quoteEstimatorInfo?.productRecords.forEach((rec) => {
          if (rec.productId === item.productId) {
            selectedServiceConditions = rec.conditions;
            if (rec.communicationPlatforms) {
              rec.communicationPlatforms.forEach((platform) => {
                communicationPlatforms.push({
                  key: platform.name,
                  text: platform.name,
                });
                filteredCommunicationPlatforms.push(platform.name);
              });
            }
          }
        });
        communicationPlatforms = Array.from(new Set(communicationPlatforms));
        communicationPlatformList = _.orderBy(
          communicationPlatforms,
          ["key"],
          "asc"
        );
        await this.setStateAsync({
          communicationPlatformList: communicationPlatformList,
          connectionList: connectionList,
          selectedServiceConditions: selectedServiceConditions,
        });
        await this.setFormFieldValues(item);
        if (filteredCommunicationPlatforms.length === 0) {
          await this.setFormFieldValue("communicationPlatform", "No Platform");
          await this.validateFormField("communicationPlatform");
        }

        if (item.planTypes) {
          await item.planTypes.forEach(async (planType) => {
            if (
              planType.planName?.toLowerCase().trim() ===
              item.connection?.toLowerCase().trim()
            ) {
              connectionList.push({
                key: planType.planName,
                text: planType.planName,
              });
            } else {
              connectionList.push({
                key: planType.planName,
                text: planType.planName,
              });
            }
          });
        }
        await this.setFormFieldValues(item);
      }

      await this.setStateAsync({ connectionList: connectionList });
      await this.setStateAsync({
        editedServiceRecord: item,
        isServiceDisabled: false,
        selectedCountry: item.selectedCountry,
      });
      let isFormDataFilled = await this.isFormFilled();
      await this.setStateAsync({ isFormFilled: isFormDataFilled });
    }
  };

  handleUserFormFieldBlur = async (e) => {
    if (e?.target) {
      await this.validateUserFormField(e?.target.id);
    }
  };

  setFormFieldValue = async (fieldName, fieldValue) => {
    if (fieldName && this.state.configProductFormInputFields) {
      await this.setStateAsync({
        configProductFormInputFields: {
          ...this.state.configProductFormInputFields,
          [fieldName]: {
            ...this.state.configProductFormInputFields[fieldName],
            value: fieldValue,
          },
        },
      });
    }
  };

  setUserFormFieldValue = async (fieldName, fieldValue) => {
    if (fieldName && this.state.quoteUserFormInputFields) {
      await this.setStateAsync({
        quoteUserFormInputFields: {
          ...this.state.quoteUserFormInputFields,
          [fieldName]: {
            ...this.state.quoteUserFormInputFields[fieldName],
            value: fieldValue,
          },
        },
      });
    }
  };

  initConfigProductFormInputFields = () => {
    let collectionObject = {};
    return ConfigProductFormFields(this._intl_ns_oc_quote, collectionObject);
  };

  initQuoteUserFormInputFields = () => {
    let collectionObject = {};
    return QuoteUserFormFields(this._intl_ns_oc_quote, collectionObject);
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
      await this.setStateAsync({
        isFormFilled: await this.isFormFilled(),
      });
    }
    await this.clearAlert();
  };

  clearAlert = async () => {
    await this.setStateAsync({
      quoteServiceError: null,
      quoteServiceSubmitStatus: null,
    });
  };

  handleUserFormFieldChange = async (e) => {
    if (e && e.target) {
      await this.setUserFormFieldValue(e.target.id, e.target.value);
      await this.props.setQuoteEstimatorInfoQuoteSubscriberDetails(
        this.props.quoteEstimatorInfo,
        {
          ...this.props.quoteEstimatorInfo?.subscriberDetails,
          [e.target.id]: e.target.value,
        }
      );
      await this.setStateAsync({ isUserFormFilled: this.isUserFormFilled() });
      await this.setStateAsync({
        isFormFilled: this.isFormFilled(),
      });
    }
    await this.clearAlert();
  };

  handleChoiceGroupChange = async (e, option) => {
    if (e && e.target) {
      if (e.target.name === "connection") {
        await this.setFormFieldValue(e.target.name, option.key);
        await this.validateFormField(e.target.name);
      }
    }
    await this.setStateAsync({
      isFormFilled: await this.isFormFilled(),
    });
    await this.clearAlert();
  };
  fetchProductsAvailable = async (country) => {
    await this.setStateAsync({ isPageDataFetched: false, connectionList: [] });
    await getProductsAvailable(country, this._cancelToken)
      .then(async (res) => {
        if (
          res &&
          res.status === AppConfigProps.httpStatusCode.ok &&
          res.data &&
          res.data.records
        ) {
          let productList = [];
          const records = res.data.records.map((rec) => {
            productList.push({ key: rec.productId, text: rec.productName });
            return { ...rec };
          });

          await this.props.setQuoteEstimatorInfoProductRecords(
            this.props.quoteEstimatorInfo,
            records
          );
          await this.setStateAsync({ countryProductRecords: records });
          await this.setStateAsync({ productServices: productList });
          await this.setStateAsync({ isPageDataFetched: true });
        } else {
          await this.props.setQuoteEstimatorInfoProductRecords(
            this.props.quoteEstimatorInfo,
            []
          );
          //await this.setStateAsync({ isPageDataFetched: true });
        }
      })
      .catch(async (err) => {
        await this.setStateAsync({ isPageDataFetched: true });
        //await this.setStateAsync({ isPageExitEnabled: false });
        await manageError(err, this.props.location, this.props.navigate);
      });
  };

  handleAddServices = async () => {
    let serviceRecords = [];
    let orderEstimatorRecords = [];
    let allServiceRecords = [];

    if (
      this.props.quoteEstimatorInfo?.serviceAndConnectionRecords &&
      this.props.quoteEstimatorInfo?.serviceAndConnectionRecords.length > 0
    ) {
      serviceRecords = [
        ...this.props.quoteEstimatorInfo?.serviceAndConnectionRecords,
      ];
    }

    if (
      this.props.quoteEstimatorInfo?.productRecords &&
      this.props.quoteEstimatorInfo?.productRecords.length > 0
    ) {
      await this.props.quoteEstimatorInfo?.productRecords.forEach((item) => {
        if (
          item.productId ===
          this.state.configProductFormInputFields.service.value
        ) {
          let pricing = [];
          if (item.planTypes) {
            item.planTypes.forEach((planType) => {
              if (
                planType.planName ===
                this.state.configProductFormInputFields.connection.value
              ) {
                planType.pricing.forEach(async (price) => {
                  if (
                    price.chargeType?.toLowerCase().trim() ===
                    OperatorConnectConstants.QUOTE.CHARGE_TYPE.RECURRING?.toLowerCase().trim()
                  ) {
                    pricing.push({
                      chargeType: price.chargeType,
                      chargeName: price.chargeName,
                      msrpAmount: price.msrpAmount,
                      partnerCost: price.partnerCost,
                      discountPercent: 0,
                      sellingPrice: price.msrpAmount,
                    });
                  } else if (
                    price.chargeType?.toLowerCase().trim() ===
                    OperatorConnectConstants.QUOTE.CHARGE_TYPE.ONE_TIME?.toLowerCase().trim()
                  ) {
                    pricing.push({
                      chargeType: price.chargeType,
                      chargeName: price.chargeName,
                      msrpAmount: price.msrpAmount,
                      partnerCost: price.partnerCost,
                      discountPercent: 0,
                      sellingPrice: price.msrpAmount,
                    });
                  }
                });
              }
            });
          }
          orderEstimatorRecords = {
            ...item,
            connection:
              this.state.configProductFormInputFields.connection.value,
            pricing: pricing,
            forms: [],
            communicationPlatform:
              this.state.configProductFormInputFields.communicationPlatform
                .value,
            quantity: parseInt(
              this.state.configProductFormInputFields.quantity.value
            ),
            selectedCountry: this.state.quoteUserFormInputFields.country.value,
          };
        }
      });
    }

    serviceRecords.push(orderEstimatorRecords);
    await this.props.setQuoteEstimatorInfoServiceAndConnectionRecords(
      this.props.quoteEstimatorInfo,
      serviceRecords
    );
    let nrcSubTotal = 0;
    let mrcSubTotal = 0;
    let total = 0;

    if (
      this.props.quoteEstimatorInfo?.serviceAndConnectionRecords &&
      this.props.quoteEstimatorInfo?.serviceAndConnectionRecords.length > 0
    ) {
      await this.props.quoteEstimatorInfo?.serviceAndConnectionRecords.forEach(
        async (obj, index) => {
          let mrcCount = 0;
          let nrcCount = 0;
          if (obj.pricing && obj.pricing.length > 0) {
            obj.pricing.forEach((price) => {
              if (
                price.chargeType?.toLowerCase().trim() ===
                OperatorConnectConstants.QUOTE.CHARGE_TYPE.RECURRING?.toLowerCase().trim()
              ) {
                mrcCount =
                  mrcCount +
                  parseFloat(obj?.quantity ?? "0") *
                    parseFloat(price?.msrpAmount ?? "0");
              } else if (
                price.chargeType?.toLowerCase().trim() ===
                OperatorConnectConstants.QUOTE.CHARGE_TYPE.ONE_TIME?.toLowerCase().trim()
              ) {
                nrcCount =
                  nrcCount +
                  parseFloat(obj?.quantity ?? "0") *
                    parseFloat(price?.msrpAmount ?? "0");
              }
            });
          }
          nrcSubTotal = nrcSubTotal + nrcCount;
          mrcSubTotal = mrcSubTotal + mrcCount;
          allServiceRecords.push({
            ...obj,
            id: index,
            mrc: mrcCount.toString(),
            nrc: nrcCount.toString(),
          });
        }
      );
      total = total + nrcSubTotal + !isNaN(mrcSubTotal) ? mrcSubTotal : "";
      await this.props.setQuoteEstimatorInfoServiceAndConnectionRecords(
        this.props.quoteEstimatorInfo,
        [...allServiceRecords]
      );
      await this.props.setQuoteEstimatorInfoServiceAndConnectionCost(
        this.props.quoteEstimatorInfo,
        nrcSubTotal.toString(),
        mrcSubTotal.toString(),
        total.toString()
      );
      await this.setStateAsync({
        configProductFormInputFields: this.initConfigProductFormInputFields(),
        isServiceDisabled: true,
        connectionList: [],
        connectionValue: "",
        editedServiceRecord: null,
      });
    }
  };

  closeDeleteConfirm = async () => {
    await this.setStateAsync({ isServiceDeleteDialogHidden: true });
  };
  renderQuoteDeleteDialog = () => {
    return (
      <Dialog
        modalProps={{ className: "quote-dialog-wrapper" }}
        hidden={this.state.isServiceDeleteDialogHidden}
        dialogContentProps={{
          type: DialogType.normal,
          showCloseButton: false,
          title: IntlUtil.getText(
            this._intl_ns_oc_quote,
            "notification.warning.serviceAndConnection"
          ),
          subText: (
            <>
              <Text>
                {IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "notification.warning.deleteServiceTextPrefix"
                )}{" "}
                {IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "notification.warning.deleteServiceTextSuffix"
                )}
              </Text>
            </>
          ),
        }}
      >
        <DialogFooter>
          <PrimaryButton onClick={() => this.handleDeleteServiceRecord()}>
            {IntlUtil.getText(this._intl_ns_oc_common, "content.yes")}
          </PrimaryButton>
          <DefaultButton
            onClick={() => {
              this.closeDeleteConfirm();
            }}
          >
            {IntlUtil.getText(this._intl_ns_oc_common, "content.no")}
          </DefaultButton>
        </DialogFooter>
      </Dialog>
    );
  };

  closeSaveConfirm = async () => {
    await this.setStateAsync({
      isSaveQuoteDialogHidden: true,
    });
  };

  handleDocumentsAndQuoteForm = async () => {
    await this.setStateAsync({
      isSaveQuoteDialogHidden: true,
      isPreviewModalOpen: false,
    });
    await this.setStateAsync({ isPageDataFetched: false });
    await this.fetchDocuments();
    await this.handleQuoteFormSubmit();
    await this.setStateAsync({ isPageDataFetched: true });
  };

  handleQuoteFormSubmit = async () => {
    if (
      this.props.quoteEstimatorInfo &&
      this.props.quoteEstimatorInfo.serviceAndConnectionRecords &&
      this.props.quoteEstimatorInfo.serviceAndConnectionRecords.length > 0
    ) {
      PageUtil.scrollToTop();
      let products = [];
      let documents = [];
      await this.props.quoteEstimatorInfo.serviceAndConnectionRecords.forEach(
        (service) => {
          let serviceObj = {
            productId: service.productId,
            countryName: service.selectedCountry,
            planName: service.connection,
            communicationPlatform: service?.communicationPlatform ?? null,
            quantity: service.quantity,
            forms: service.forms,
            pricing: service.pricing,
          };
          products.push(serviceObj);
        }
      );
      if (
        this.props.quoteEstimatorInfo &&
        this.props.quoteEstimatorInfo.serviceDocumentRecords &&
        this.props.quoteEstimatorInfo.serviceDocumentRecords.length > 0
      ) {
        await this.props.quoteEstimatorInfo.serviceDocumentRecords.forEach(
          (service) => {
            documents.push({ documentId: service.documentId });
          }
        );
      }
      if (
        this.props.quoteEstimatorInfo &&
        this.props.quoteEstimatorInfo.communicationPlatformDocumentRecords &&
        this.props.quoteEstimatorInfo.communicationPlatformDocumentRecords
          .length > 0
      ) {
        await this.props.quoteEstimatorInfo.communicationPlatformDocumentRecords.forEach(
          (platform) => {
            documents.push({ documentId: platform.documentId });
          }
        );
      }

      if (
        this.props.quoteEstimatorInfo &&
        this.props.quoteEstimatorInfo.generalDocumentRecords &&
        this.props.quoteEstimatorInfo.generalDocumentRecords.length > 0
      ) {
        await this.props.quoteEstimatorInfo.generalDocumentRecords.forEach(
          (general) => {
            documents.push({ documentId: general.documentId });
          }
        );
      }
      if (
        this.props.quoteEstimatorInfo &&
        this.props.quoteEstimatorInfo.onboardServiceDocumentRecords &&
        this.props.quoteEstimatorInfo.onboardServiceDocumentRecords.length > 0
      ) {
        this.props.quoteEstimatorInfo.onboardServiceDocumentRecords.forEach(
          (onboard) => {
            if (onboard && onboard.documents && onboard.documents.length > 0) {
              onboard.documents.forEach((doc) => {
                documents.push({ documentId: doc.documentId });
              });
            }
          }
        );
      }
      let productList = {
        customerName:
          this.props.quoteEstimatorInfo &&
          this.props.quoteEstimatorInfo.subscriberDetails &&
          this.props.quoteEstimatorInfo.subscriberDetails.quoteName,
        customerEmail:
          this.props.quoteEstimatorInfo &&
          this.props.quoteEstimatorInfo.subscriberDetails &&
          this.props.quoteEstimatorInfo.subscriberDetails.email,
        customerPhone:
          this.props.quoteEstimatorInfo &&
          this.props.quoteEstimatorInfo.subscriberDetails &&
          this.props.quoteEstimatorInfo.subscriberDetails.phone,
        products: products,
        documents: documents,
        quoteNotes: "",
        headerNotes: null,
        footerNotes: null,
        companyLogo: null,
      };
      await saveQuote(productList, this._cancelToken)
        .then(async (res) => {
          if (
            res &&
            res.status === AppConfigProps.httpStatusCode.ok &&
            res.data &&
            res.data.result
          ) {
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
            await this.props.setQuoteEstimatorInfoSubscriberQuoteRecords(
              this.props.quoteEstimatorInfo,
              res.data.result
            );
            await this.props.setQuoteProgressPage(
              OperatorConnectConstants.QUOTE.PROGRESS.CREATE_ACCOUNT
            );

            // /await this.setStateAsync({ isPageDataFetched: true });
          } else {
            await this.setStateAsync({ isPageDataFetched: true });
            await manageError(res, this.props.location, this.props.navigate);
          }
          //await this.setStateAsync({ isPageDataFetched: true });
        })
        .catch(async (err) => {
          await this.setStateAsync({ isPageDataFetched: true });
          await manageError(err, this.props.location, this.props.navigate);
        });
    }
  };

  handleSaveQuoteDialog = async (value) => {
    if (
      this.props.quoteEstimatorInfo &&
      this.props.quoteEstimatorInfo.serviceAndConnectionRecords &&
      this.props.quoteEstimatorInfo.serviceAndConnectionRecords.length > 0
    ) {
      await this.setStateAsync({
        isSaveQuoteDialogHidden: false,
        processType: value,
      });
    } else {
      await this.setStateAsync({
        isSaveQuoteDialogHidden: true,
        processType: null,
      });
    }
  };

  renderQuoteSaveDialog = () => {
    return (
      <Dialog
        modalProps={{ className: "quote-dialog-wrapper" }}
        hidden={this.state.isSaveQuoteDialogHidden}
        dialogContentProps={{
          type: DialogType.normal,
          showCloseButton: false,
          title:
            this.state.processType === "quoteSave"
              ? IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "notification.warning.quoteSave"
                )
              : IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "notification.warning.orderCreate"
                ),
          subText: (
            <>
              {this.state.processType === "quoteSave" ? (
                <Text>
                  {IntlUtil.getText(
                    this._intl_ns_oc_quote,
                    "notification.warning.quoteSaveTextPrefix"
                  )}
                  {"?"}
                </Text>
              ) : (
                <Text>
                  {IntlUtil.getText(
                    this._intl_ns_oc_quote,
                    "notification.warning.orderCreateTextPrefix"
                  )}
                  {"?"}
                </Text>
              )}
            </>
          ),
        }}
      >
        <DialogFooter>
          <PrimaryButton onClick={() => this.handleDocumentsAndQuoteForm()}>
            {IntlUtil.getText(this._intl_ns_oc_common, "content.yes")}
          </PrimaryButton>
          )
          <DefaultButton onClick={() => this.closeSaveConfirm()}>
            {IntlUtil.getText(this._intl_ns_oc_common, "content.no")}
          </DefaultButton>
        </DialogFooter>
      </Dialog>
    );
  };

  setFormFieldValues = async (serviceRecord) => {
    if (serviceRecord) {
      await this.setStateAsync({
        configProductFormInputFields: {
          ...this.state.configProductFormInputFields,
          service: {
            ...this.state.configProductFormInputFields["service"],
            value: serviceRecord?.productId ?? "",
          },
          connection: {
            ...this.state.configProductFormInputFields["connection"],
            value: serviceRecord?.connection ?? "",
          },
          communicationPlatform: {
            ...this.state.configProductFormInputFields["communicationPlatform"],
            value: serviceRecord?.communicationPlatform ?? "",
          },
          quantity: {
            ...this.state.configProductFormInputFields["quantity"],
            value: serviceRecord?.quantity ?? "",
          },
        },
      });
    }
  };

  handleAddServiceAndConnection = async (e) => {
    let serviceAvailableStatus = true;
    let errorMessage = null;
    let previousService = "";
    let presentService = this.props.quoteEstimatorInfo?.productRecords.find(
      (rec) =>
        rec.productId === this.state.configProductFormInputFields.service.value
    );
    if (
      this.props.quoteEstimatorInfo?.serviceAndConnectionRecords &&
      this.props.quoteEstimatorInfo?.serviceAndConnectionRecords.length > 0
    ) {
      for (let rec of this.props.quoteEstimatorInfo
        ?.serviceAndConnectionRecords) {
        if (
          rec.connection ===
            this.state.configProductFormInputFields.connection.value &&
          rec.selectedCountry ===
            this.state.quoteUserFormInputFields.country.value &&
          rec.communicationPlatform ===
            this.state.configProductFormInputFields.communicationPlatform
              .value &&
          rec.productId ===
            this.state.configProductFormInputFields.service.value
        ) {
          serviceAvailableStatus = false;
          errorMessage = {
            presentProductName: rec.productName,
            country: this.state.quoteUserFormInputFields.country.value,
            connection:
              this.state.configProductFormInputFields.connection.value,
            error: "notification.error.serviceIsAlreadyAdded",
          };

          break;
        } else if (
          rec.selectedCountry ===
            this.state.quoteUserFormInputFields.country.value &&
          rec.productId !==
            this.state.configProductFormInputFields.service.value
        ) {
          previousService = rec.productName;
          errorMessage = {
            previousProductName: previousService,
            presentProductName: presentService.productName,
            country: this.state.quoteUserFormInputFields.country.value,
            connection:
              this.state.configProductFormInputFields.connection.value,
            error: "notification.error.serviceCannotBeAdded",
          };
          serviceAvailableStatus = false;
          break;
        }
      }
    }
    if (serviceAvailableStatus === true) {
      await this.setProductDetails(
        OperatorConnectConstants.AZURE_APPLICATION_INSIGHTS_LOG_MESSAGE
          .QUOTE_PRODUCT_DATA_ADDED
      );
      await this.setStateAsync({ isPageDataFetched: false });
      await this.handleAddServices();
      await this.setStateAsync({ countryProductRecords: [] });
      await this.setStateAsync({ isPageDataFetched: true });
    } else {
      await this.setStateAsync({
        quoteServiceSubmitStatus:
          OperatorConnectConstants.FORM_SUBMIT_STATUS.FAILURE,
      });
      await this.setStateAsync({
        quoteServiceError: errorMessage,
      });
    }
  };

  handleEditServiceAndConnection = async () => {
    let serviceAvailableStatus = true;
    let errorMessage = null;
    let presentService = this.props.quoteEstimatorInfo?.productRecords.find(
      (rec) =>
        rec.productId === this.state.configProductFormInputFields.service.value
    );
    let previousService = "";
    await this.clearAlert();
    for (let rec of this.props.quoteEstimatorInfo
      ?.serviceAndConnectionRecords) {
      if (
        rec.connection?.toLowerCase().trim() ===
          this.state.configProductFormInputFields.connection.value
            ?.toLowerCase()
            .trim() &&
        rec.selectedCountry?.toLowerCase().trim() ===
          this.state.quoteUserFormInputFields.country.value
            ?.toLowerCase()
            .trim() &&
        rec.communicationPlatform?.platformName?.toLowerCase().trim() ===
          this.state.configProductFormInputFields.communicationPlatform.value?.platformName
            ?.toLowerCase()
            .trim() &&
        rec.productId?.toLowerCase().trim() ===
          this.state.configProductFormInputFields.service.value
            ?.toLowerCase()
            .trim() &&
        rec.id !== this.state.editedServiceRecord.id
      ) {
        serviceAvailableStatus = false;
        errorMessage = {
          presentProductName: rec.productName,
          country: this.state.quoteUserFormInputFields.country.value,
          connection: this.state.configProductFormInputFields.connection.value,
          error: "notification.error.serviceIsAlreadyAdded",
        };
        break;
      } else if (
        rec.productId !==
          this.state.configProductFormInputFields.service.value &&
        rec.selectedCountry ===
          this.state.quoteUserFormInputFields.country.value
      ) {
        previousService = rec.productName;
        errorMessage = {
          previousProductName: previousService,
          presentProductName: presentService.productName,
          country: this.state.quoteUserFormInputFields.country.value,
          connection: this.state.configProductFormInputFields.connection.value,
          error: "notification.error.serviceCannotBeAdded",
        };

        serviceAvailableStatus = false;
        break;
      } else {
        serviceAvailableStatus = true;
      }
    }
    if (serviceAvailableStatus === true) {
      await this.setProductDetails(
        OperatorConnectConstants.AZURE_APPLICATION_INSIGHTS_LOG_MESSAGE
          .QUOTE_PRODUCT_DATA_UPDATED
      );
      await this.handleAddQuoteEditServices();
      await this.setUserFormFieldValue("country", "");
      await this.setStateAsync({ isFormFilled: false });
    } else {
      await this.setStateAsync({
        quoteServiceSubmitStatus:
          OperatorConnectConstants.FORM_SUBMIT_STATUS.FAILURE,
      });
      await this.setStateAsync({
        quoteServiceError: errorMessage,
      });
      //await this.setStateAsync({ isServiceDisabled: true });
    }
  };
  handleDeleteServiceRecord = async () => {
    let deleteRecord = [];
    let nrcSubTotal = 0;
    let mrcSubTotal = 0;
    let total = 0;
    if (this.state.deleteServiceRecord) {
      await this.setDeletedProductDetails(this.state.deleteServiceRecord);
      await this.setStateAsync({
        isServiceDeleteDialogHidden: true,
        isFormFilled: false,
      });
      await this.props.quoteEstimatorInfo?.serviceAndConnectionRecords.forEach(
        (obj) => {
          if (this.state.deleteServiceRecord?.id !== obj?.id) {
            if (obj.pricing && obj.pricing.length > 0) {
              let mrcCount = 0;
              let nrcCount = 0;
              let nrcPartnerCost = 0;
              let mrcPartnerCost = 0;

              obj.pricing.forEach((price) => {
                if (
                  price.chargeType?.toLowerCase().trim() ===
                  OperatorConnectConstants.QUOTE.CHARGE_TYPE.RECURRING?.toLowerCase().trim()
                ) {
                  mrcPartnerCost = price.partnerCost;
                  mrcCount =
                    mrcCount +
                    parseFloat(obj?.quantity ?? "0") *
                      parseFloat(price?.msrpAmount ?? "0");
                } else if (
                  price.chargeType?.toLowerCase().trim() ===
                  OperatorConnectConstants.QUOTE.CHARGE_TYPE.ONE_TIME?.toLowerCase().trim()
                ) {
                  nrcPartnerCost = price.partnerCost;
                  nrcCount =
                    nrcCount +
                    parseFloat(obj?.quantity ?? "0") *
                      parseFloat(price?.msrpAmount ?? "0");
                }
              });

              nrcSubTotal = nrcSubTotal + nrcCount;
              mrcSubTotal = mrcSubTotal + mrcCount;
              deleteRecord.push({
                ...obj,
                mrc: mrcCount.toString(),
                nrc: nrcCount.toString(),
                nrcPartnerCost: nrcPartnerCost,
                mrcPartnerCost: mrcPartnerCost,
              });
            }
          }
        }
      );
    }
    total = total + nrcSubTotal + mrcSubTotal;
    await this.props.setQuoteEstimatorInfoServiceAndConnectionRecords(
      this.props.quoteEstimatorInfo,
      deleteRecord
    );
    await this.props.setQuoteEstimatorInfoServiceAndConnectionCost(
      this.props.quoteEstimatorInfo,
      nrcSubTotal.toString(),
      mrcSubTotal.toString(),
      total.toString()
    );
    await this.setStateAsync({ deleteServiceRecord: null });
    await this.setStateAsync({
      configProductFormInputFields: this.initConfigProductFormInputFields(),
      editedServiceRecord: null,
      isFormFilled: false,
      connectionList: [],
      selectedServiceConditions: null,
    });
    if (
      this.props.quoteEstimatorInfo &&
      (!this.props.quoteEstimatorInfo.serviceAndConnectionRecords ||
        this.props.quoteEstimatorInfo.serviceAndConnectionRecords.length === 0)
    ) {
      await this.props.setQuoteEstimatorInfoCommunicationPlatformDocumentRecords(
        this.props.quoteEstimatorInfo,
        []
      );
      await this.props.setQuoteEstimatorInfoGeneralDocumentRecords(
        this.props.quoteEstimatorInfo,
        []
      );
      await this.props.setQuoteEstimatorInfoOnboardServiceDocumentRecords(
        this.props.quoteEstimatorInfo,
        []
      );
      await this.props.setQuoteEstimatorInfoServiceDocumentRecords(
        this.props.quoteEstimatorInfo,
        []
      );
    }
    await this.setUserFormFieldValue("country", "");
    await this.setStateAsync({
      countryProductRecords: [],
      configProductFormInputFields: this.initConfigProductFormInputFields(),
    });
    await this.clearAlert();
  };

  handleCalculateDiscount = (amount, discount) => {
    let discountedAmount = 0;
    let disc = discount ? discount : 0;
    let amt = amount ? amount : 0;
    discountedAmount = amount - (amt * disc) / 100;
    return parseFloat(Number(discountedAmount).toFixed(2));
  };

  handleAddQuoteEditServices = async () => {
    if (
      this.state.editedServiceRecord &&
      this.props.quoteEstimatorInfo?.serviceAndConnectionRecords
    ) {
      let editedOrderEstimatorRecord = [];
      let nrcSubTotal = 0;
      let mrcSubTotal = 0;
      let total = 0;
      let connectionList = [];
      let pricing = [];
      editedOrderEstimatorRecord =
        await this.props.quoteEstimatorInfo?.serviceAndConnectionRecords.map(
          (obj) => {
            let mrcCount = 0;
            let nrcCount = 0;
            if (this.state.editedServiceRecord.id === obj.id) {
              let quantity =
                this.state.configProductFormInputFields.quantity.value !== ""
                  ? this.state.configProductFormInputFields.quantity.value
                  : "0";
              if (obj.planTypes) {
                obj.planTypes.forEach((planType) => {
                  connectionList.push({
                    key: planType.planName,
                    text: planType.planName,
                  });

                  if (planType.planName === obj.connection) {
                    planType.pricing.forEach((price) => {
                      if (
                        price.chargeType?.toLowerCase().trim() ===
                        OperatorConnectConstants.QUOTE.CHARGE_TYPE.RECURRING?.toLowerCase().trim()
                      ) {
                        pricing.push({
                          chargeType: price.chargeType,
                          chargeName: price.chargeName,
                          msrpAmount: price.msrpAmount,
                          sellingPrice: price.msrpAmount,
                          discountPercent: 0,
                          partnerCost: price.partnerCost,
                        });
                        mrcCount =
                          mrcCount +
                          parseFloat(quantity ?? "0") *
                            parseFloat(price?.msrpAmount ?? "0");
                      } else if (
                        price.chargeType?.toLowerCase().trim() ===
                        OperatorConnectConstants.QUOTE.CHARGE_TYPE.ONE_TIME?.toLowerCase().trim()
                      ) {
                        pricing.push({
                          chargeType: price.chargeType,
                          msrpAmount: price.msrpAmount,
                          chargeName: price.chargeName,
                          sellingPrice: price.msrpAmount,
                          discountPercent: 0,
                          partnerCost: price.partnerCost,
                        });
                        nrcCount =
                          nrcCount +
                          parseFloat(quantity ?? "0") *
                            parseFloat(price?.msrpAmount ?? "0");
                      }
                    });
                  }
                });
              }
              nrcCount = this.handleCalculateDiscount(
                parseFloat(nrcCount),
                parseFloat("0")
              );
              mrcCount = this.handleCalculateDiscount(
                parseFloat(mrcCount),
                parseFloat("0")
              );
              nrcSubTotal = nrcSubTotal + nrcCount;
              mrcSubTotal = mrcSubTotal + mrcCount;
              obj.pricing = pricing;
              return {
                ...obj,
                connection:
                  this.state.configProductFormInputFields.connection.value,
                communicationPlatform:
                  this.state.configProductFormInputFields.communicationPlatform
                    .value,
                quantity: parseInt(
                  this.state.configProductFormInputFields.quantity.value
                ),
                mrc: mrcCount.toString(),
                nrc: nrcCount.toString(),
              };
            } else {
              nrcSubTotal = nrcSubTotal + parseFloat(obj.nrc);
              mrcSubTotal = mrcSubTotal + parseFloat(obj.mrc);
              return obj;
            }
          }
        );
      total = total + nrcSubTotal + !isNaN(mrcSubTotal) ? mrcSubTotal : "";
      await this.props.setQuoteEstimatorInfoServiceAndConnectionRecords(
        this.props.quoteEstimatorInfo,
        [...editedOrderEstimatorRecord]
      );
      await this.props.setQuoteEstimatorInfoServiceAndConnectionCost(
        this.props.quoteEstimatorInfo,
        nrcSubTotal.toString(),
        mrcSubTotal.toString(),
        total.toString()
      );
      await this.setStateAsync({ editedServiceRecord: null });
      await this.setStateAsync({
        configProductFormInputFields: this.initConfigProductFormInputFields(),
        connectionList: connectionList,
      });
      await this.setUserFormFieldValue("country", "");
    }
    await this.setStateAsync({
      countryProductRecords: [],
      connectionList: [],
      deleteRecord: null,
    });
  };

  renderPreviewQuoteModal = () => {
    return (
      <>
        <Modal
          isOpen={this.state.isPreviewModalOpen}
          className={`quote-customize-modal-content ${modalStyles.container}`}
        >
          <div className={modalStyles.body}>
            <div className={modalStyles.header}>
              <span className="m-l-10">
                {IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.previewQuote"
                )}
              </span>
              <ClearIcon
                onClick={() =>
                  this.setStateAsync({ isPreviewModalOpen: false })
                }
                className="m-r-10 cursor-pointer"
              />
            </div>
            <div className={modalStyles.content}>
              <div className="m-l-5 m-r-5 m-b-5">
                <QuoteBuilderEstimator
                  intlNamespace={this._intl_ns_oc_quote}
                  quoteEstimatorInfo={this.props.quoteEstimatorInfo}
                />
              </div>
              <Grid fluid className="m-0 p-0">
                <Row>
                  {this.state.isPageDataFetched === true ? (
                    <>
                      <Col xl={12} className="m-0 p-0">
                        {(this.props.quoteEstimatorInfo &&
                          this.props.quoteEstimatorInfo
                            ?.serviceDocumentRecords &&
                          this.props.quoteEstimatorInfo?.serviceDocumentRecords
                            .length > 0) ||
                        (this.props.quoteEstimatorInfo &&
                          this.props.quoteEstimatorInfo
                            ?.communicationPlatformDocumentRecords &&
                          this.props.quoteEstimatorInfo
                            ?.communicationPlatformDocumentRecords.length >
                            0) ? (
                          <Row className={`m-t-10 m-l-5 m-r-5`}>
                            <Col xl={12} className="m-t-5 m-l-5">
                              <span
                                className={`m-t-5 ${modalStyles.modalContentLabel}`}
                              >
                                {IntlUtil.getText(
                                  this._intl_ns_oc_quote,
                                  "content.introductionToService"
                                )}
                              </span>
                              <ul className={`quote-create-list-wrapper`}>
                                {this.props.quoteEstimatorInfo &&
                                  this.props.quoteEstimatorInfo
                                    ?.serviceDocumentRecords &&
                                  this.props.quoteEstimatorInfo?.serviceDocumentRecords.map(
                                    (service, index) => {
                                      return (
                                        <li
                                          key={`service-${index}`}
                                          className="quote-link-text"
                                        >
                                          <span
                                            onClick={(e) =>
                                              this.handleDocumentClick(
                                                e,
                                                service.documentLink
                                              )
                                            }
                                          >
                                            {service.documentTitle}
                                          </span>
                                        </li>
                                      );
                                    }
                                  )}
                                {this.props.quoteEstimatorInfo &&
                                  this.props.quoteEstimatorInfo
                                    ?.communicationPlatformDocumentRecords &&
                                  this.props.quoteEstimatorInfo?.communicationPlatformDocumentRecords.map(
                                    (platform, index) => {
                                      return (
                                        <li
                                          key={`platform-${index}`}
                                          className="quote-link-text"
                                        >
                                          <ChevronRightMedIcon className="m-r-5" />

                                          <span
                                            onClick={(e) =>
                                              this.handleDocumentClick(
                                                e,
                                                platform.documentLink
                                              )
                                            }
                                          >
                                            {platform.documentTitle}
                                          </span>
                                        </li>
                                      );
                                    }
                                  )}
                              </ul>
                            </Col>
                          </Row>
                        ) : null}
                        {this.props.quoteEstimatorInfo
                          ?.generalDocumentRecords &&
                        this.props.quoteEstimatorInfo?.generalDocumentRecords
                          .length > 0 ? (
                          <Row className={`m-t-10 m-l-5 m-r-0`}>
                            <Col xl={12} className="m-t-5 m-l-0">
                              <span
                                className={`${modalStyles.modalContentLabel}`}
                              >
                                {IntlUtil.getText(
                                  this._intl_ns_oc_quote,
                                  "content.technicalAndCoverageInfo"
                                )}
                              </span>
                              <ul className="bg-grey p-5 quote-create-list-wrapper">
                                {this.props.quoteEstimatorInfo?.generalDocumentRecords.map(
                                  (general, index) => {
                                    return (
                                      <li
                                        key={`general-${index}`}
                                        className="quote-link-text"
                                      >
                                        <ChevronRightMedIcon className="m-r-5" />
                                        <span
                                          onClick={(e) =>
                                            this.handleDocumentClick(
                                              e,
                                              general.documentLink
                                            )
                                          }
                                        >
                                          {general.documentTitle}
                                        </span>
                                      </li>
                                    );
                                  }
                                )}
                              </ul>
                            </Col>
                          </Row>
                        ) : null}
                        {this.props.quoteEstimatorInfo
                          ?.onboardServiceDocumentRecords &&
                        this.props.quoteEstimatorInfo
                          ?.onboardServiceDocumentRecords.length > 0 ? (
                          <Row className="m-t-10 m-l-5 m-r-0">
                            <Col xl={12} className="m-t-5 m-l-0">
                              <span
                                className={`m-t-5 text-fw-semibold p-b-0 ${modalStyles.modalContentLabel}`}
                              >
                                {IntlUtil.getText(
                                  this._intl_ns_oc_quote,
                                  "content.requiredDocToOnboardService"
                                )}
                              </span>

                              <ul className="p-5 bg-grey quote-create-list-wrapper">
                                {this.props.quoteEstimatorInfo.onboardServiceDocumentRecords.map(
                                  (onboard, index) => {
                                    return (
                                      <>
                                        {onboard &&
                                        onboard.documents &&
                                        onboard.documents.length > 0 ? (
                                          <>
                                            <li
                                              key={`country-${index}`}
                                              className="quote-header-text"
                                            >
                                              <span className="text-fw-semibold">
                                                {onboard.countryName}
                                              </span>
                                            </li>
                                            {onboard.documents.map(
                                              (doc, index) => {
                                                return (
                                                  <li
                                                    key={`onboard-${index}`}
                                                    className="quote-link-text"
                                                  >
                                                    <ChevronRightMedIcon className="m-r-5" />

                                                    <span
                                                      onClick={(e) =>
                                                        this.handleDocumentClick(
                                                          e,
                                                          doc.documentLink
                                                        )
                                                      }
                                                    >
                                                      {doc.documentTitle}
                                                    </span>
                                                  </li>
                                                );
                                              }
                                            )}
                                          </>
                                        ) : null}
                                      </>
                                    );
                                  }
                                )}
                              </ul>
                            </Col>
                          </Row>
                        ) : null}
                      </Col>
                    </>
                  ) : null}
                </Row>
              </Grid>
              <div className="m-t-10 oc-quote-page-footer-actions">
                <div className="modal-page-frame-separator"></div>
                <DefaultButton
                  onClick={this.handleSavePDF}
                  className="oc-quote-page-footer-button page-frame-button"
                  disabled={
                    this.props.quoteEstimatorInfo
                      ?.serviceAndConnectionRecords === null ||
                    this.props.quoteEstimatorInfo
                      ?.serviceAndConnectionRecords === undefined ||
                    this.props.quoteEstimatorInfo?.serviceAndConnectionRecords
                      .length === 0
                  }
                >
                  <DownloadIcon className="m-r-5 page-frame-icon" />
                  {IntlUtil.getText(
                    this._intl_ns_oc_quote,
                    "content.downloadQuote"
                  )}
                </DefaultButton>
                <PrimaryButton
                  className="oc-quote-page-footer-button page-frame-button"
                  onClick={() => this.handleSaveQuoteDialog("quoteSave")}
                  disabled={
                    this.props.quoteEstimatorInfo
                      ?.serviceAndConnectionRecords === null ||
                    this.props.quoteEstimatorInfo
                      ?.serviceAndConnectionRecords === undefined ||
                    this.props.quoteEstimatorInfo?.serviceAndConnectionRecords
                      .length === 0
                  }
                >
                  <TextDocumentIcon className="m-r-5 page-frame-icon" />
                  {IntlUtil.getText(
                    this._intl_ns_oc_quote,
                    "content.saveQuote"
                  )}
                </PrimaryButton>
                <PrimaryButton
                  className="oc-quote-page-footer-button page-frame-button"
                  onClick={() => this.handleSaveQuoteDialog("orderCreate")}
                  disabled={
                    this.props.quoteEstimatorInfo
                      ?.serviceAndConnectionRecords === null ||
                    this.props.quoteEstimatorInfo
                      ?.serviceAndConnectionRecords === undefined ||
                    this.props.quoteEstimatorInfo?.serviceAndConnectionRecords
                      .length === 0
                  }
                >
                  <ActivateOrdersIcon className="m-r-5 page-frame-icon" />
                  {IntlUtil.getText(
                    this._intl_ns_oc_quote,
                    "content.createOrder"
                  )}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  };

  handleDeleteServiceRecordDialog = async (item) => {
    await this.setStateAsync({ deleteServiceRecord: item });
    await this.setStateAsync({ isServiceDeleteDialogHidden: false });
  };

  handleDocumentClick = (e, option) => {
    window.open(option, "_blank");
  };

  handleSavePDF = async () => {
    let tableHeaders = [];
    let tableRecords = [];
    let currencySymbol = "";
    await this.setStateAsync({ isPageDataFetched: false });
    await this.fetchDocuments();
    await this.setStateAsync({ isPageDataFetched: true });

    if (
      this.props.quoteEstimatorInfo?.serviceAndConnectionRecords &&
      this.props.quoteEstimatorInfo?.serviceAndConnectionRecords.length > 0
    ) {
      await this.props.quoteEstimatorInfo?.serviceAndConnectionRecords.forEach(
        (rec) => {
          rec.productDetails = `${rec.selectedCountry} - ${rec.productName} - ${
            rec.connection
          }${
            rec?.communicationPlatform ? " - " + rec?.communicationPlatform : ""
          }`;
          rec.nrcWithSymbol =
            rec.currencySymbol + parseFloat(rec?.nrc ?? "0").toFixed(2);
          let mrcPlatformWithSymbol = "";
          let mrcOtherWithSymbol = "";
          rec.pricing.forEach((price) => {
            if (
              price?.chargeType?.toLowerCase().trim() ===
              OperatorConnectConstants.QUOTE.CHARGE_TYPE.RECURRING?.toLowerCase().trim()
            ) {
              if (
                price?.chargeName?.toLowerCase().trim() ===
                OperatorConnectConstants.QUOTE.CHARGE_NAME.PLATFORM_CHARGES?.toLowerCase().trim()
              ) {
                mrcPlatformWithSymbol =
                  price.msrpAmount !== null
                    ? rec.currencySymbol +
                      parseFloat(rec.quantity * price?.msrpAmount ?? 0).toFixed(
                        2
                      ) +
                      ` (${price.chargeName})`
                    : "";
              }
            }
          });
          rec.pricing.forEach((price) => {
            if (
              price?.chargeType?.toLowerCase().trim() ===
              OperatorConnectConstants.QUOTE.CHARGE_TYPE.RECURRING?.toLowerCase().trim()
            ) {
              if (
                price?.chargeName?.toLowerCase().trim() !==
                OperatorConnectConstants.QUOTE.CHARGE_NAME.PLATFORM_CHARGES?.toLowerCase().trim()
              ) {
                mrcOtherWithSymbol =
                  price.msrpAmount !== null
                    ? rec.currencySymbol +
                      parseFloat(rec.quantity * price?.msrpAmount ?? 0).toFixed(
                        2
                      ) +
                      ` (${price.chargeName})`
                    : "";
              }
            }
          });
          rec.mrcAllWithSymbol =
            mrcPlatformWithSymbol + mrcPlatformWithSymbol !== ""
              ? "\n"
              : "" + mrcOtherWithSymbol;
          currencySymbol = rec.currencySymbol;
          tableRecords.push({ ...rec });
        }
      );
    }
    QuoteEstimatorTableColumns(this._intl_ns_oc_quote).forEach((res) => {
      if (res.fieldName === "productName") {
        res.fieldName = "productDetails";
        res.name = IntlUtil.getText(this._intl_ns_oc_quote, res.name);
      }
      if (res.fieldName === "quantity") {
        res.name = IntlUtil.getText(this._intl_ns_oc_quote, res.name);
      }
      if (res.fieldName === "termPlan") {
        res.name = IntlUtil.getText(this._intl_ns_oc_quote, res.name);
      }
      if (res.fieldName === "nrc") {
        res.fieldName = "nrcWithSymbol";
        res.name = "NRC";
      }
      if (res.fieldName === "mrc") {
        res.fieldName = "mrcAllWithSymbol";
        res.name = "MRC";
      }
      tableHeaders.push({ header: res.name, dataKey: res.fieldName });
    });

    let pdfDoc = new jsPDF("p", "pt", "a4");
    let image = this.state.resizedImage;
    let introductionNotes =
      this.props.quoteEstimatorInfo?.customizedQuoteRecord?.introductionNotes;
    let comments =
      this.props.quoteEstimatorInfo?.customizedQuoteRecord?.comments;
    let imageHeight = 0;
    pdfDoc.setFontSize(12);
    if (image && image.length > 0) {
      imageHeight = pdfDoc.getImageProperties(this.state.resizedImage).height;
      pdfDoc.addImage(image, 40, 40);
    }
    pdfDoc.setFontSize(18);
    pdfDoc.setFont("helvetica", "bold");
    pdfDoc.setTextColor("#231f20");
    pdfDoc.line(0, imageHeight + 50, 0, 0);
    pdfDoc.text(
      285,
      imageHeight + 55,
      IntlUtil.getText(this._intl_ns_oc_quote, "content.quote"),
      { align: "center" }
    );
    pdfDoc.text(285, imageHeight + 56, "_____", { align: "center" });

    pdfDoc.setFont("helvetica", "normal");
    pdfDoc.setFontSize(11);

    let introductionNotesLines = "";
    if (introductionNotes && introductionNotes.length > 0) {
      introductionNotesLines = pdfDoc.splitTextToSize(introductionNotes, 510);
      pdfDoc.text(40, imageHeight + 80, introductionNotesLines);
      imageHeight = imageHeight + 5;
    }
    let height =
      pdfDoc.getTextDimensions(introductionNotesLines).h + imageHeight;
    autoTable(pdfDoc, {
      startY: height + 80,
      body: [
        {
          dateTitle:
            IntlUtil.getText(this._intl_ns_oc_quote, "content.date") +
            ": " +
            moment().format("MMM D, YYYY"),
          dateValue: "",
        },
      ],
      columns: [{ header: "", dataKey: "dateTitle" }],
      columnStyles: {
        0: { cellWidth: "auto" },
      },
      didParseCell: (table) => {
        if (table.row.index === 0) {
          table.cell.styles.fillColor = "#ffffff";
          table.cell.styles.textColor = "#00517c";
        }
      },
      willDrawCell: (data) => {
        if (data.section === "head") {
          if (data.table.pageCount > 1) {
            return false;
          }
        }
        if (data.column.index === 0 && data.cell.section === "body") {
          pdfDoc.setFont("helvetica", "bold");
        }
        if (data.column.index === 1 && data.cell.section === "body") {
          pdfDoc.setFont("helvetica", "bold");
        }
      },
    });

    autoTable(pdfDoc, {
      startY: pdfDoc.lastAutoTable.finalY + 0,
      body: [
        {
          nameKey:
            IntlUtil.getText(this._intl_ns_oc_quote, "content.name") +
            ": " +
            this.props.quoteEstimatorInfo?.subscriberDetails.quoteName,
          nameValue: "",
        },
      ],
      columns: [{ header: "", dataKey: "nameKey" }],
      columnStyles: {
        0: { textColor: "#00517c" },
        //1: { textColor: "#0075C9" }
      },
      didParseCell: (table) => {
        if (table.row.index === 0) {
          table.cell.styles.fillColor = "#ffffff";
          table.cell.styles.textColor = "#00517c";
        }
      },
      willDrawCell: (data) => {
        if (data.section === "head") {
          if (data.table.pageCount > 1) {
            return false;
          }
        }
        if (data.column.index === 0 && data.cell.section === "body") {
          pdfDoc.setFont("helvetica", "bold");
        }
        if (data.column.index === 1 && data.cell.section === "body") {
          pdfDoc.setFont("helvetica", "bold");
        }
      },
    });

    autoTable(pdfDoc, {
      startY: pdfDoc.lastAutoTable.finalY + 0,
      body: [
        {
          dataKey:
            IntlUtil.getText(this._intl_ns_oc_quote, "content.email") +
            ": " +
            this.props.quoteEstimatorInfo?.subscriberDetails.email,
          numKey: this.props.quoteEstimatorInfo?.subscriberDetails.phone
            ? IntlUtil.getText(this._intl_ns_oc_quote, "content.phone") +
              ": " +
              this.props.quoteEstimatorInfo?.subscriberDetails.phone
            : "",
        },
      ],
      columns: [
        { header: "", dataKey: "dataKey" },
        { header: "", dataKey: "numKey" },
      ],
      columnStyles: {
        0: { textColor: "#00517c" },
        1: { textColor: "#00517c", cellWidth: "auto" },
      },

      didParseCell: (table) => {
        if (table.row.index === 0) {
          table.cell.styles.fillColor = "#ffffff";
          table.cell.styles.textColor = "#00517c";
        }
      },
      willDrawCell: (data) => {
        if (data.section === "head") {
          if (data.table.pageCount > 1) {
            return false;
          }
        }
        if (data.column.index === 0 && data.cell.section === "body") {
          pdfDoc.setFont("helvetica", "bold");
        }
        if (data.column.index === 1 && data.cell.section === "body") {
          pdfDoc.setFont("helvetica", "bold");
        }
        if (data.column.index === 2 && data.cell.section === "body") {
          pdfDoc.setFont("helvetica", "bold");
        }
        if (data.column.index === 3 && data.cell.section === "body") {
          pdfDoc.setFont("helvetica", "bold");
        }
      },
    });

    autoTable(pdfDoc, {
      startY: pdfDoc.lastAutoTable.finalY + 0,
      columnStyles: {
        0: { cellWidth: 140 },
        4: { cellWidth: 140 },
      },

      body: [
        ...tableRecords,
        {
          termPlan: IntlUtil.getText(
            this._intl_ns_oc_quote,
            "content.subTotal"
          ),
          nrcWithSymbol:
            currencySymbol +
            parseFloat(
              this.props.quoteEstimatorInfo?.serviceNrcSubTotalCost
            ).toFixed(2),
          mrcAllWithSymbol:
            currencySymbol +
            parseFloat(
              this.props.quoteEstimatorInfo?.serviceMrcSubTotalCost
            ).toFixed(2),
        },
        {
          termPlan: IntlUtil.getText(this._intl_ns_oc_quote, "content.total"),
          mrcAllWithSymbol:
            currencySymbol +
            parseFloat(this.props.quoteEstimatorInfo?.serviceTotalCost).toFixed(
              2
            ),
        },
      ],
      columns: tableHeaders,
      didParseCell: (table) => {
        if (table.section === "head") {
          table.cell.styles.fillColor = "#d0d0d0";
          table.cell.styles.textColor = "#231f20";
        } else {
          if (
            table.cell.raw ===
              IntlUtil.getText(this._intl_ns_oc_quote, "content.total") ||
            table.cell.raw ===
              IntlUtil.getText(this._intl_ns_oc_quote, "content.subTotal")
          ) {
            table.cell.styles.fontStyle = "bold";
          }
          if (
            table.column.dataKey === "nrcWithSymbol" ||
            table.column.dataKey === "mrcAllWithSymbol"
          ) {
            table.cell.styles.fontStyle = "bold";
            table.cell.styles.textColor = "#0075C9";
          }
          if (
            table.cell.raw ===
            IntlUtil.getText(
              this._intl_ns_oc_quote,
              "content.termsAndConditions"
            )
          ) {
            table.cell.styles.cellWidth = "wrap";
          }
          let rows = table.table.body;
          if (table.row.index === rows.length - 1) {
            table.cell.styles.fillColor = "#ffffff";
          }
          if (table.row.index === rows.length - 2) {
            table.cell.styles.fillColor = "#e2e2e2";
          }
        }
      },
      willDrawCell: (data) => {
        if (data.section === "head") {
          if (data.table.pageCount > 1) {
            return false;
          }
        }
        if (
          data.cell?.raw ===
          IntlUtil.getText(this._intl_ns_oc_quote, "content.termsAndConditions")
        ) {
          pdfDoc.setTextColor(0, 81, 124);
          pdfDoc?.textWithLink(
            data.row.raw?.mrcAllWithSymbol,
            data.cell.x + 10,
            data.cell.y + 10,
            { url: OperatorConnectConstants.QUOTE.sippioTermsAndConditionsURL }
          );
        }
      },
    });
    let splitLines = "";
    let previousTextDimensions = pdfDoc.lastAutoTable.finalY + 10;
    if (comments && comments.length > 0) {
      splitLines = pdfDoc.splitTextToSize(comments, 510);
      if (
        pdfDoc.getCurrentPageInfo().pageContext.mediaBox.topRightY - 50 <=
        pdfDoc.getTextDimensions(splitLines).h + previousTextDimensions
      ) {
        pdfDoc.addPage();
        previousTextDimensions =
          previousTextDimensions + pdfDoc.getTextDimensions(splitLines).h + 20;
        pdfDoc.text(40, previousTextDimensions, splitLines);
      } else {
        pdfDoc.text(40, previousTextDimensions + 20, splitLines);
        previousTextDimensions =
          previousTextDimensions + pdfDoc.getTextDimensions(splitLines).h + 20;
      }
    }

    pdfDoc.setFontSize(12);
    pdfDoc.setFont("helvetica", "bold");
    pdfDoc.setTextColor("#231f20");
    pdfDoc.text(
      40,
      previousTextDimensions + 15,
      IntlUtil.getText(this._intl_ns_oc_quote, "content.attachments") + ": "
    );
    previousTextDimensions = previousTextDimensions + 25;

    if (
      this.props.quoteEstimatorInfo &&
      this.props.quoteEstimatorInfo.serviceDocumentRecords &&
      this.props.quoteEstimatorInfo.serviceDocumentRecords.length > 0
    ) {
      let checkedServiceDocRecords = [];

      await this.props.quoteEstimatorInfo.serviceDocumentRecords.forEach(
        (rec) => {
          checkedServiceDocRecords.push({
            documentTitle: rec.documentTitle,
            documentLink: rec?.documentLink,
          });
        }
      );

      autoTable(pdfDoc, {
        margin: { left: 35 },
        startY: previousTextDimensions,
        body: [...checkedServiceDocRecords],
        columns: [
          {
            header: IntlUtil.getText(
              this._intl_ns_oc_quote,
              "content.introductionToService"
            ),
            dataKey: "documentTitle",
          },
        ],
        didParseCell: (table) => {
          if (table.section === "head") {
            table.cell.styles.fillColor = "#ffffff";
            table.cell.styles.textColor = "#231f20";
          } else {
            table.cell.styles.fillColor = "#ffffff";
          }
        },
        willDrawCell: (data) => {
          if (data.section === "head") {
            if (data.table.pageCount > 1) {
              return false;
            }
          }
          if (data.column.index === 0 && data.cell.section === "body") {
            pdfDoc.setTextColor(0, 81, 124);
            pdfDoc?.textWithLink(
              data.row.raw?.documentTitle,
              data.cell.x + 10,
              data.cell.y + 10,
              { url: data.row.raw?.documentLink }
            );
          }
        },
      });
      previousTextDimensions = pdfDoc.lastAutoTable.finalY;
    }

    if (
      this.props.quoteEstimatorInfo &&
      this.props.quoteEstimatorInfo.communicationPlatformDocumentRecords &&
      this.props.quoteEstimatorInfo.communicationPlatformDocumentRecords
        .length > 0
    ) {
      let checkedPlatformDocRecords = [];

      await this.props.quoteEstimatorInfo.communicationPlatformDocumentRecords.forEach(
        (rec) => {
          checkedPlatformDocRecords.push({
            documentTitle: rec?.documentTitle,
            documentLink: rec?.documentLink,
          });
        }
      );
      autoTable(pdfDoc, {
        margin: { left: 35 },
        startY: previousTextDimensions,
        body: [...checkedPlatformDocRecords],
        columns: [{ header: "", dataKey: "documentTitle" }],
        didParseCell: (table) => {
          if (table.section === "head") {
            table.cell.styles.fillColor = "#ffffff";
            table.cell.styles.textColor = "#ffffff";
          } else {
            table.cell.styles.fillColor = "#ffffff";
          }
        },
        willDrawCell: (data) => {
          if (data.section === "head") {
            if (data.table.pageCount > 1) {
              return false;
            }
          }
          if (data.column.index === 0 && data.cell.section === "body") {
            pdfDoc.setTextColor(0, 81, 124);
            pdfDoc?.textWithLink(
              data.row.raw.documentTitle,
              data.cell.x + 10,
              data.cell.y + 10,
              { url: data.row.raw?.documentLink }
            );
          }
        },
      });
      previousTextDimensions = pdfDoc.lastAutoTable.finalY + 10;
    }

    if (
      this.props.quoteEstimatorInfo &&
      this.props.quoteEstimatorInfo.generalDocumentRecords &&
      this.props.quoteEstimatorInfo.generalDocumentRecords.length > 0
    ) {
      let checkedGeneralDocRecords = [];
      await this.props.quoteEstimatorInfo.generalDocumentRecords.forEach(
        (rec) => {
          checkedGeneralDocRecords.push({
            documentTitle: rec.documentTitle,
            documentLink: rec?.documentLink,
          });
        }
      );
      autoTable(pdfDoc, {
        margin: { left: 35 },
        startY: previousTextDimensions,
        body: [...checkedGeneralDocRecords],
        columns: [
          {
            header: IntlUtil.getText(
              this._intl_ns_oc_quote,
              "content.technicalAndCoverageInfo"
            ),
            dataKey: "documentTitle",
          },
        ],
        didParseCell: (table) => {
          if (table.section === "head") {
            table.cell.styles.fillColor = "#ffffff";
            table.cell.styles.textColor = "#231f20";
          } else {
            table.cell.styles.fillColor = "#ffffff";
          }
        },
        willDrawCell: (data) => {
          if (data.section === "head") {
            if (data.table.pageCount > 1) {
              return false;
            }
          }
          if (data.column.index === 0 && data.cell.section === "body") {
            pdfDoc.setTextColor(0, 81, 124);
            pdfDoc?.textWithLink(
              data.row.raw.documentTitle,
              data.cell.x + 10,
              data.cell.y + 10,
              { url: data.row.raw.documentLink }
            );
          }
        },
      });
      previousTextDimensions = pdfDoc.lastAutoTable.finalY + 10;
    }

    if (
      this.props.quoteEstimatorInfo &&
      this.props.quoteEstimatorInfo.onboardServiceDocumentRecords &&
      this.props.quoteEstimatorInfo.onboardServiceDocumentRecords.length > 0
    ) {
      let checkedOnboardDocRecords = [];
      let documents = [];
      await this.props.quoteEstimatorInfo.onboardServiceDocumentRecords.forEach(
        (rec) => {
          if (rec && rec.documents && rec.documents.length > 0) {
            rec.documents.forEach((doc) => {
              documents.push(doc);
            });
          }
        }
      );
      let selectedCountries = [];
      await this.props.quoteEstimatorInfo.onboardServiceDocumentRecords.forEach(
        (rec) => {
          selectedCountries.push(rec.countryName);
          checkedOnboardDocRecords.push({
            documentTitle: rec.countryName,
            documentLink: "#",
          });
          rec.documents.forEach((doc) => {
            checkedOnboardDocRecords.push({
              documentTitle: doc.documentTitle,
              documentLink: doc?.documentLink,
            });
          });
        }
      );
      autoTable(pdfDoc, {
        margin: { left: 35 },
        startY: previousTextDimensions,
        body: [...checkedOnboardDocRecords],

        columns: [
          {
            header: IntlUtil.getText(
              this._intl_ns_oc_quote,
              "content.requiredDocToOnboardService"
            ),
            dataKey: "documentTitle",
          },
        ],
        didParseCell: (table) => {
          if (table.section === "head") {
            table.cell.styles.fillColor = "#ffffff";
            table.cell.styles.textColor = "#231f20";
          } else {
            table.cell.styles.fillColor = "#ffffff";
          }
        },
        willDrawCell: (data) => {
          if (data.section === "head") {
            if (data.table.pageCount > 1) {
              return false;
            }
          }
          if (data.column.index === 0 && data.cell.section === "body") {
            if (
              selectedCountries.includes(data.row.raw.documentTitle) === true
            ) {
              pdfDoc.setTextColor(0, 0, 0);
              pdfDoc.setFont("helvetica", "bold");
            } else {
              pdfDoc.setTextColor(0, 81, 124);
              pdfDoc?.textWithLink(
                data.row.raw.documentTitle,
                data.cell.x + 10,
                data.cell.y + 10,
                { url: data.row.raw.documentLink }
              );
            }
          }
        },
      });
    }
    pdfDoc.save(`Quote_${moment(new Date()).format("YYYYMMDDHHMMSS")}`);
    await this.setStateAsync({ isViewModalOpen: false });
  };

  handleQuoterBuilderItemRender = (item, index, column) => {
    switch (column.key) {
      case "actions":
        return (
          <div className="page-frame-table-item-actions">
            <IconButton
              iconProps={{ iconName: "Edit" }}
              onClick={(e) => this.handleEditServiceRecord(e, item)}
              className="quote-estimator-icon-button"
            />{" "}
            <IconButton
              onClick={() => this.handleDeleteServiceRecordDialog(item)}
              iconProps={{ iconName: "Delete" }}
              className="quote-estimator-icon-button"
            />
          </div>
        );
      case "productName":
        let communicationPlatform = item.communicationPlatform
          ? " - " + item.communicationPlatform
          : "";
        let recurringList = [];
        let oneTimeList = [];
        item &&
          item.pricing &&
          item.pricing.forEach((price) => {
            if (
              price.chargeType?.toLowerCase().trim() ===
              OperatorConnectConstants.QUOTE.CHARGE_TYPE.ONE_TIME?.toLowerCase().trim()
            ) {
              oneTimeList.push(price.chargeType);
            }
            if (
              price.chargeType?.toLowerCase().trim() ===
              OperatorConnectConstants.QUOTE.CHARGE_TYPE.RECURRING?.toLowerCase().trim()
            ) {
              recurringList.push(price.chargeType);
            }
          });
        return (
          <TooltipHost
            overflowMode={TooltipOverflowMode.Self}
            hostClassName="quote-description-text"
            content={`${item.selectedCountry} - ${item?.productName} - ${item?.connection} - ${communicationPlatform}`}
          >
            <div className="oc-product-align">{`${item.selectedCountry} - ${item?.productName} - ${item?.connection}${communicationPlatform}`}</div>
          </TooltipHost>
        );
      case "nrc":
        return (
          <>
            {item &&
              item.pricing &&
              item.pricing.map((price, index) => {
                if (
                  price?.chargeType?.toLowerCase().trim() ===
                  OperatorConnectConstants.QUOTE.CHARGE_TYPE.ONE_TIME?.toLowerCase().trim()
                ) {
                  if (
                    price?.chargeName?.toLowerCase().trim() ===
                      OperatorConnectConstants.QUOTE.CHARGE_NAME.ACTIVATION_FEE?.toLowerCase().trim() ||
                    price?.chargeName?.toLowerCase().trim() ===
                      OperatorConnectConstants.QUOTE.CHARGE_NAME.PORTING_FEE?.toLowerCase().trim()
                  ) {
                    let pricing =
                      price.msrpAmount !== null &&
                      price.msrpAmount !== undefined
                        ? item?.currencySymbol +
                          parseFloat(
                            parseFloat(item?.quantity ?? "0") *
                              parseFloat(price.msrpAmount)
                          ).toFixed(2)
                        : "";
                    return (
                      <>
                        <span className="text-fc-primary text-ff-semibold">
                          {" "}
                          <TooltipHost
                            hostClassName={css("m-0 p-0")}
                            key={`q-${index}`}
                            content={price?.chargeName}
                          >
                            {pricing}{" "}
                          </TooltipHost>
                        </span>
                      </>
                    );
                  }
                } else {
                  return <></>;
                }
                return <></>;
              })}
            {item &&
              item.pricing &&
              item.pricing.map((price, index) => {
                if (
                  price?.chargeType?.toLowerCase().trim() ===
                  OperatorConnectConstants.QUOTE.CHARGE_TYPE.ONE_TIME?.toLowerCase().trim()
                ) {
                  if (
                    price?.chargeName?.toLowerCase().trim() !==
                      OperatorConnectConstants.QUOTE.CHARGE_NAME.ACTIVATION_FEE?.toLowerCase().trim() &&
                    price?.chargeName?.toLowerCase().trim() !==
                      OperatorConnectConstants.QUOTE.CHARGE_NAME.PORTING_FEE?.toLowerCase().trim()
                  ) {
                    let pricing =
                      price.msrpAmount !== null &&
                      price.msrpAmount !== undefined
                        ? item?.currencySymbol +
                          parseFloat(
                            parseFloat(item?.quantity ?? "0") *
                              parseFloat(price.msrpAmount)
                          ).toFixed(2)
                        : "";

                    return (
                      <>
                        {oneTimeList.length > 1 ? " + " : ""}{" "}
                        <span className="text-fc-primary text-ff-semibold">
                          {" "}
                          <TooltipHost
                            hostClassName={css("m-0 p-0")}
                            key={`q-${index}`}
                            content={price?.chargeName}
                          >
                            {pricing}
                          </TooltipHost>
                        </span>
                      </>
                    );
                  }
                } else {
                  return <></>;
                }
                return <></>;
              })}
          </>
        );
      case "mrc":
        return (
          <>
            {item &&
              item.pricing &&
              item.pricing.map((price, index) => {
                if (
                  price?.chargeType?.toLowerCase().trim() ===
                  OperatorConnectConstants.QUOTE.CHARGE_TYPE.RECURRING?.toLowerCase().trim()
                ) {
                  if (
                    price?.chargeName?.toLowerCase().trim() ===
                    OperatorConnectConstants.QUOTE.CHARGE_NAME.PLATFORM_CHARGES?.toLowerCase().trim()
                  ) {
                    let pricing =
                      price.msrpAmount !== null &&
                      price.msrpAmount !== undefined
                        ? item?.currencySymbol +
                          parseFloat(
                            parseFloat(item?.quantity ?? "0") *
                              parseFloat(price.msrpAmount)
                          ).toFixed(2)
                        : "";
                    return (
                      <>
                        <div className="text-fc-primary text-ff-semibold">
                          {" "}
                          <TooltipHost
                            hostClassName={css("m-0 p-0")}
                            key={`q-${index}`}
                            content={price?.chargeName}
                          >
                            {pricing}{" "}
                          </TooltipHost>
                        </div>
                      </>
                    );
                  } else {
                    return <></>;
                  }
                } else {
                  return <></>;
                }
              })}
            {item &&
              item.pricing &&
              item.pricing.map((price, index) => {
                if (
                  price?.chargeType?.toLowerCase().trim() ===
                  OperatorConnectConstants.QUOTE.CHARGE_TYPE.RECURRING?.toLowerCase().trim()
                ) {
                  if (
                    price?.chargeName?.toLowerCase().trim() !==
                    OperatorConnectConstants.QUOTE.CHARGE_NAME.PLATFORM_CHARGES?.toLowerCase().trim()
                  ) {
                    let pricing =
                      price.msrpAmount !== null &&
                      price.msrpAmount !== undefined
                        ? item?.currencySymbol +
                          parseFloat(
                            parseFloat(item?.quantity ?? "0") *
                              parseFloat(price.msrpAmount)
                          ).toFixed(2)
                        : "";

                    return (
                      <>
                        <span className="text-fc-primary text-ff-semibold">
                          {" "}
                          <TooltipHost
                            hostClassName={css("m-0 p-0")}
                            key={`q-${index}`}
                            content={price?.chargeName}
                          >
                            {pricing}
                          </TooltipHost>
                        </span>
                      </>
                    );
                  }
                } else {
                  return <></>;
                }
                return <></>;
              })}
          </>
        );
      default:
        return (
          <div>
            <TooltipHost
              overflowMode={TooltipOverflowMode.Self}
              hostClassName="user-description-text"
              content={item[column.fieldName]}
            >
              {item[column.fieldName]}
            </TooltipHost>
          </div>
        );
    }
  };
  // total item row
  renderTotalDetailsFooterItemColumn = (item, index, column) => {
    switch (column.key) {
      case "termPlan":
        return (
          <div>
            <div>
              <b>{IntlUtil.getText(this._intl_ns_oc_quote, "content.total")}</b>
            </div>
          </div>
        );

      case "mrc":
        let quoteTotalEstimatorInfo = this.props.quoteEstimatorInfo;
        return (
          <div className="text-fc-primary text-ff-semibold">
            <div>
              {quoteTotalEstimatorInfo?.serviceTotalCost &&
              quoteTotalEstimatorInfo.serviceAndConnectionRecords &&
              quoteTotalEstimatorInfo.serviceAndConnectionRecords.length > 0
                ? quoteTotalEstimatorInfo.serviceAndConnectionRecords[0]
                    ?.currencySymbol +
                  parseFloat(quoteTotalEstimatorInfo?.serviceTotalCost).toFixed(
                    2
                  )
                : null}
            </div>
          </div>
        );

      default:
        return (
          <div>
            <TooltipHost
              overflowMode={TooltipOverflowMode.Self}
              hostClassName="user-description-text"
              content={item[column.fieldName]}
            >
              {item[column.fieldName]}
            </TooltipHost>
          </div>
        );
    }
  };
  // sub item row
  renderSubTotalDetailsFooterItemColumn = (item, index, column) => {
    switch (column.key) {
      case "termPlan":
        return (
          <div className="">
            <div>
              <b>
                {IntlUtil.getText(this._intl_ns_oc_quote, "content.subTotal")}
              </b>
            </div>
          </div>
        );
      case "nrc":
        let quoteNrcEstimatorInfo = this.props.quoteEstimatorInfo;
        return (
          <div>
            <div className="text-fc-primary text-ff-semibold">
              {quoteNrcEstimatorInfo?.serviceNrcSubTotalCost &&
              quoteNrcEstimatorInfo?.serviceAndConnectionRecords &&
              quoteNrcEstimatorInfo?.serviceAndConnectionRecords.length > 0
                ? quoteNrcEstimatorInfo?.serviceAndConnectionRecords[0]
                    ?.currencySymbol +
                  parseFloat(
                    quoteNrcEstimatorInfo?.serviceNrcSubTotalCost
                  ).toFixed(2)
                : null}
            </div>
          </div>
        );
      case "mrc":
        let quoteMrcEstimatorInfo = this.props.quoteEstimatorInfo;
        return (
          <div>
            <div className="text-fc-primary text-ff-semibold">
              {!isNaN(quoteMrcEstimatorInfo?.serviceMrcSubTotalCost) &&
              quoteMrcEstimatorInfo?.serviceAndConnectionRecords &&
              quoteMrcEstimatorInfo?.serviceAndConnectionRecords.length > 0
                ? quoteMrcEstimatorInfo?.serviceAndConnectionRecords[0]
                    ?.currencySymbol +
                  parseFloat(
                    quoteMrcEstimatorInfo?.serviceMrcSubTotalCost
                  ).toFixed(2)
                : ""}
            </div>
          </div>
        );

      default:
        return (
          <div>
            <TooltipHost
              overflowMode={TooltipOverflowMode.Self}
              hostClassName="user-description-text"
              content={item[column.fieldName]}
            >
              {item[column.fieldName]}
            </TooltipHost>
          </div>
        );
    }
  };
  // footer detail row
  onRenderQuoterBuilderDetailsFooter = (detailsFooterProps) => {
    return (
      <div className="page-frame-table-footer">
        <DetailsRow
          {...detailsFooterProps}
          columns={detailsFooterProps.columns}
          className="page-frame-table-footer-row"
          item={{}}
          itemIndex={-1}
          groupNestingDepth={detailsFooterProps.groupNestingDepth}
          selectionMode={SelectionMode.none}
          selection={detailsFooterProps.selection}
          onRenderItemColumn={this.renderSubTotalDetailsFooterItemColumn}
        />
        <DetailsRow
          {...detailsFooterProps}
          columns={detailsFooterProps.columns}
          className="page-frame-table-footer-row"
          item={{}}
          itemIndex={-1}
          groupNestingDepth={detailsFooterProps.groupNestingDepth}
          selectionMode={SelectionMode.none}
          selection={detailsFooterProps.selection}
          onRenderItemColumn={this.renderTotalDetailsFooterItemColumn}
        />
      </div>
    );
  };
  // render detail list
  renderQuoterBuilderEstimatorList = () => {
    return (
      <>
        <DetailsList
          className="page-frame-table"
          columns={[...this.initQuoteEstimatorheaderColumns()]}
          items={this.props.quoteEstimatorInfo?.serviceAndConnectionRecords}
          compact={false}
          layoutMode={DetailsListLayoutMode.justified}
          isHeaderVisible={true}
          onRenderItemColumn={this.handleQuoterBuilderItemRender}
          onRenderDetailsHeader={(detailsHeaderProps, defaultRender) => (
            <Sticky
              stickyPosition={StickyPositionType.Header}
              isScrollSynced
              stickyClassName="page-frame-table-header-sticky"
            >
              {defaultRender(detailsHeaderProps)}
            </Sticky>
          )}
          constrainMode={ConstrainMode.unconstrained}
          selectionMode={SelectionMode.none}
          checkboxVisibility={CheckboxVisibility.always}
          onRenderDetailsFooter={this.onRenderQuoterBuilderDetailsFooter}
        />
      </>
    );
  };

  renderQuoterBuilderEstimator = (intlNamespace, quoteEstimatorInfo) => {
    return (
      <>
        <div className="quote-estimator-page-content">
          <div className="quote-page-table-wrapper">
            {this.renderQuoterBuilderEstimatorList()}
            <div className="quote-page-table-footer-text">
              <span>
                {IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.taxesApplicable"
                )}
              </span>
            </div>
          </div>
        </div>
      </>
    );
  };

  setCustomerDetails = async () => {
    if (this.state.quoteUserFormInputFields) {
      const customProperties = {
        CustomerData: {
          customerName: this.state.quoteUserFormInputFields.quoteName.value,
          customerEmail: this.state.quoteUserFormInputFields.email.value,
          customerPhone: this.state.quoteUserFormInputFields.phone.value,
        },
      };
      TelemetryUtil.trackTrace(
        OperatorConnectConstants.AZURE_APPLICATION_INSIGHTS_LOG_MESSAGE
          .QUOTE_CUSTOMER_DATA_SUBMITTED,
        AppConfigProps.SeverityLevel.Verbose,
        customProperties
      );
    }
  };

  handleSubscriberDetails = async () => {
    await this.setCustomerDetails();
    await this.setStateAsync({ isProductFieldsEnabled: true });
  };

  renderSubscriberDetails = () => {
    return (
      <>
        <Grid fluid className="m-0 p-0">
          <Row className="m-0 p-0">
            <Col xl={12}>
              <Text className="text-fw-semibold text-fc-primary text-fs-medium">
                {IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.nameYourQuote"
                )}{" "}
              </Text>
            </Col>
          </Row>
          <Row className="m-0 p-0">
            <Col xl={3} lg={3} md={3} xs={12} className="m-t-10 m-r-10">
              <TextField
                required
                maxLength={50}
                id="quoteName"
                name="quoteName"
                value={this.state.quoteUserFormInputFields.quoteName.value}
                onChange={this.handleUserFormFieldChange}
                onBlur={this.handleUserFormFieldBlur}
                label={IntlUtil.getText(this._intl_ns_oc_quote, "content.name")}
                errorMessage={
                  this.state.quoteUserFormInputFields.quoteName.isError
                    ? IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        this.state.quoteUserFormInputFields.quoteName
                          .errorMessage
                      )
                    : null
                }
                className="page-form-textfield"
              />
            </Col>
            <Col xl={3} lg={3} md={3} xs={12} className="m-t-10 m-r-10">
              <TextField
                required
                id="email"
                name="email"
                maxLength={100}
                value={this.state.quoteUserFormInputFields.email.value}
                onChange={this.handleUserFormFieldChange}
                onBlur={this.handleUserFormFieldBlur}
                label={IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.email"
                )}
                errorMessage={
                  this.state.quoteUserFormInputFields.email.isError
                    ? IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        this.state.quoteUserFormInputFields.email.errorMessage
                      )
                    : null
                }
                className="page-form-textfield"
              />
            </Col>
            <Col xl={3} lg={3} md={3} xs={12} className="m-t-10">
              <TextField
                id="phone"
                name="phone"
                maxLength={20}
                value={this.state.quoteUserFormInputFields.phone.value}
                onChange={this.handleUserFormFieldChange}
                onBlur={this.handleUserFormFieldBlur}
                label={IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.phone"
                )}
                errorMessage={
                  this.state.quoteUserFormInputFields.phone.isError
                    ? IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        this.state.quoteUserFormInputFields.phone.errorMessage
                      )
                    : null
                }
                className="page-form-textfield"
              />
            </Col>
            <Col xl={1} lg={1} md={1} xs={12} className="m-t-10">
              <DefaultButton
                disabled={this.state.isUserFormFilled === false}
                onClick={this.handleSubscriberDetails}
                style={{ marginTop: "29.5px" }}
                className="page-frame-button quote-page-icon-button"
              >
                <IncreaseIndentArrowIcon style={{ height: "40px" }} />
              </DefaultButton>
            </Col>
          </Row>
        </Grid>
      </>
    );
  };

  handleCountryFormDropdownChange = async (e, option) => {
    if (e && e.target) {
      await this.setUserFormFieldValue("country", option.key);
      await this.setStateAsync({
        configProductFormInputFields: this.initConfigProductFormInputFields(),
      });
      if (option.key !== "") {
        await this.setStateAsync({ isPageDataFetched: false });

        await this.fetchProductsAvailable(option.key);
        await this.setStateAsync({ isPageDataFetched: true });
        await this.clearAlert();
      }
    }
  };

  renderProducts = () => {
    return (
      <>
        <Grid fluid className="m-l-0 m-r-0 p-l-0 p-r-0">
          <Row className="m-0 p-0">
            <Col xl={12} className="m-t-20">
              <Text className="text-fw-semibold text-fc-primary text-fs-medium">
                {IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.chooseCountryAndSelectProducts"
                )}{" "}
              </Text>
            </Col>
          </Row>

          <Row className="m-0 p-0">
            <Col xl={3} lg={3} md={3} xs={12} className="m-t-10">
              <SearchDropdown
                required
                defaultSelectedKey={
                  this.state.quoteUserFormInputFields.country.value
                }
                label={IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.country"
                )}
                className="page-form-dropdown"
                onChange={(e, option) =>
                  this.handleCountryFormDropdownChange(e, option)
                }
                disabled={this.state.editedServiceRecord}
                errorMessage={
                  this.state.quoteUserFormInputFields.country.isError
                    ? IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        this.state.quoteUserFormInputFields.country.errorMessage
                      )
                    : null
                }
                options={getCountryQuoteStatesList(
                  this.props.countryStatesData
                )}
              />
            </Col>
          </Row>
          <Row className="m-0 p-0">
            <Col xl={3} lg={3} md={3} xs={12} className="m-t-10 m-r-10">
              <SearchDropdown
                required
                id="service"
                label={IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.service"
                )}
                className="page-form-dropdown"
                selectedKey={
                  this.state.configProductFormInputFields?.service.value
                }
                onChange={(e, option) =>
                  this.handleConfigProductDropdownChange(e, option)
                }
                disabled={
                  this.state.editedServiceRecord ||
                  this.state.quoteUserFormInputFields.country.value === ""
                }
                options={this.state.productServices}
                errorMessage={
                  this.state.configProductFormInputFields?.service.isError
                    ? IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        this.state.configProductFormInputFields?.service
                          ?.errorMessage
                      )
                    : null
                }
              />
            </Col>
            {this.state.configProductFormInputFields.service.value !== "" ? (
              <>
                <Col xl={3} lg={3} md={3} xs={12} className="m-t-10 m-r-10">
                  <ChoiceGroup
                    required
                    id="connection"
                    name="connection"
                    disabled={this.state.editedServiceRecord}
                    selectedKey={
                      this.state.configProductFormInputFields.connection.value
                    }
                    label={IntlUtil.getText(
                      this._intl_ns_oc_quote,
                      "content.connection"
                    )}
                    onChange={(e, option) =>
                      this.handleChoiceGroupChange(e, option)
                    }
                    className="page-form-choice-group"
                    options={this.state.connectionList}
                  />

                  {this.state.configProductFormInputFields?.connection
                    .isError ? (
                    <span className="text-fc-error text-fs-small">
                      {IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        this.state.configProductFormInputFields?.connection
                          ?.errorMessage
                      )}
                    </span>
                  ) : null}
                </Col>

                {/* <Col xl={3} lg={2} md={3} xs={12} className="m-t-10 m-r-10">
							<SearchDropdown
								required
								id="communicationPlatform"
								label={IntlUtil.getText(this._intl_ns_oc_quote, "content.platform")}
								className="page-form-dropdown"
								selectedKey={this.state.configProductFormInputFields?.communicationPlatform.value}
								onChange={(e, option) => this.handleConfigProductDropdownChange(e, option)}
								options={this.state.communicationPlatformList}
								errorMessage={this.state.configProductFormInputFields?.communicationPlatform.isError ? IntlUtil.getText(this._intl_ns_oc_quote, this.state.configProductFormInputFields?.communicationPlatform?.errorMessage) : null}
							/>
						</Col> */}
                <Col xl={1} lg={2} md={2} xs={12} className="m-t-10 m-r-0">
                  <TextField
                    required
                    id="quantity"
                    name="quantity"
                    maxLength={7}
                    value={
                      this.state.configProductFormInputFields.quantity.value
                    }
                    onChange={this.handleFormFieldChange}
                    label={IntlUtil.getText(
                      this._intl_ns_oc_quote,
                      "content.quantity"
                    )}
                    errorMessage={
                      this.state.configProductFormInputFields?.quantity.isError
                        ? IntlUtil.getText(
                            this._intl_ns_oc_quote,
                            this.state.configProductFormInputFields?.quantity
                              ?.errorMessage
                          )
                        : null
                    }
                    className="page-form-textfield"
                  />
                </Col>
                <Col xl={1} lg={1} md={1} xs={12} className="m-t-10 m-r-10">
                  {this.state.editedServiceRecord ? (
                    <DefaultButton
                      className="quote-form-default-button page-frame-button"
                      onClick={this.handleEditServiceAndConnection}
                      disabled={
                        !this.state.isFormFilled || this.state.isServiceDisabled
                      }
                    >
                      {IntlUtil.getText(
                        this._intl_ns_oc_quote,
                        "content.update"
                      )}
                    </DefaultButton>
                  ) : (
                    <DefaultButton
                      className="quote-form-default-button page-frame-button"
                      disabled={
                        !this.state.isFormFilled || this.state.isServiceDisabled
                      }
                      onClick={this.handleAddServiceAndConnection}
                    >
                      {IntlUtil.getText(this._intl_ns_oc_quote, "content.add")}
                    </DefaultButton>
                  )}
                </Col>
                {this.state.quoteServiceSubmitStatus ===
                OperatorConnectConstants.FORM_SUBMIT_STATUS.FAILURE ? (
                  <Col xl={12} className="m-t-15 p-r-25">
                    <div className="m-t-10">
                      <MessageBar
                        messageBarType={MessageBarType.error}
                        className="p-l-10 p-r-10"
                      >
                        <span>
                          {IntlUtil.getSubstituteText(
                            this._intl_ns_oc_quote,
                            this.state.quoteServiceError?.error,
                            [
                              {
                                key: "<NEW_SERVICE>",
                                value:
                                  this.state.quoteServiceError
                                    ?.presentProductName,
                              },
                              {
                                key: "<OLD_SERVICE>",
                                value:
                                  this.state.quoteServiceError
                                    ?.previousProductName,
                              },
                              {
                                key: "<COUNTRY>",
                                value: this.state.quoteServiceError?.country,
                              },
                              {
                                key: "<CONNECTION>",
                                value: this.state.quoteServiceError?.connection,
                              },
                            ]
                          )}
                        </span>
                      </MessageBar>
                    </div>
                  </Col>
                ) : null}
              </>
            ) : null}
          </Row>
        </Grid>
      </>
    );
  };

  handlePreviewOpen = async () => {
    await this.setStateAsync({ isPreviewModalOpen: true });
    TelemetryUtil.trackPageView(
      IntlUtil.getText(this._intl_ns_oc_quote, "title.previewQuote")
    );
    await this.setStateAsync({ isPageDataFetched: false });
    await this.fetchDocuments();
    await this.setStateAsync({ isPageDataFetched: true });
  };
  render() {
    return (
      <>
        <div className="page-frame-content frame-content-quotes">
          <div>
            {this.renderSubscriberDetails()}
            <div className="page-content-separator"></div>
            {this.state.isProductFieldsEnabled === true ? (
              <>
                {this.renderProducts()}
                {/* <div className="page-content-separator"></div> */}
                {this.renderQuoterBuilderEstimator(
                  this._intl_ns_oc_quote,
                  this.props.quoteEstimatorInfo
                )}
                <div className="page-content-separator m-t-10"></div>
              </>
            ) : null}
            <div className="m-t-10 m-b-5">
              <DefaultButton
                onClick={() => this.handlePreviewOpen()}
                className="oc-quote-page-footer-actions page-frame-button"
                disabled={
                  this.props.quoteEstimatorInfo?.serviceAndConnectionRecords ===
                    null ||
                  this.props.quoteEstimatorInfo?.serviceAndConnectionRecords ===
                    undefined ||
                  this.props.quoteEstimatorInfo?.serviceAndConnectionRecords
                    .length === 0 ||
                  this.state.isUserFormFilled === false
                }
              >
                <PreviewIcon className="m-r-5 page-frame-icon" />
                {IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.previewQuote"
                )}
              </DefaultButton>
              <DefaultButton
                onClick={this.handleSavePDF}
                className="oc-quote-page-footer-actions page-frame-button"
                disabled={
                  this.props.quoteEstimatorInfo?.serviceAndConnectionRecords ===
                    null ||
                  this.props.quoteEstimatorInfo?.serviceAndConnectionRecords ===
                    undefined ||
                  this.props.quoteEstimatorInfo?.serviceAndConnectionRecords
                    .length === 0 ||
                  this.state.isUserFormFilled === false
                }
              >
                <DownloadIcon className="m-r-5 page-frame-icon" />
                {IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.downloadQuote"
                )}
              </DefaultButton>
              <PrimaryButton
                className="oc-quote-page-footer-actions page-frame-button"
                onClick={() => this.handleSaveQuoteDialog("quoteSave")}
                disabled={
                  this.props.quoteEstimatorInfo?.serviceAndConnectionRecords ===
                    null ||
                  this.props.quoteEstimatorInfo?.serviceAndConnectionRecords ===
                    undefined ||
                  this.props.quoteEstimatorInfo?.serviceAndConnectionRecords
                    .length === 0 ||
                  this.state.isUserFormFilled === false
                }
              >
                <TextDocumentIcon className="m-r-5 page-frame-icon" />
                {IntlUtil.getText(this._intl_ns_oc_quote, "content.saveQuote")}
              </PrimaryButton>
              <PrimaryButton
                className="oc-quote-page-footer-actions page-frame-button"
                onClick={() => this.handleSaveQuoteDialog("orderCreate")}
                disabled={
                  this.props.quoteEstimatorInfo?.serviceAndConnectionRecords ===
                    null ||
                  this.props.quoteEstimatorInfo?.serviceAndConnectionRecords ===
                    undefined ||
                  this.props.quoteEstimatorInfo?.serviceAndConnectionRecords
                    .length === 0 ||
                  this.state.isUserFormFilled === false
                }
              >
                <ActivateOrdersIcon className="m-r-5 page-frame-icon" />
                {IntlUtil.getText(
                  this._intl_ns_oc_quote,
                  "content.createOrder"
                )}
              </PrimaryButton>
            </div>
          </div>
          {this.renderPreviewQuoteModal()}
          {this.renderQuoteDeleteDialog()}
          {this.renderQuoteSaveDialog()}
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
              "title.selectProducts"
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
  setQuoteEstimatorInfoProductRecords,
  setQuoteEstimatorInfoServiceAndConnectionRecords,
  setQuoteEstimatorInfoServiceAndConnectionCost,
  setQuoteEstimatorInfoQuoteSubscriberDetails,
  setQuoteEstimatorInfoCommunicationPlatformDocumentRecords,
  setQuoteEstimatorInfoGeneralDocumentRecords,
  setQuoteEstimatorInfoOnboardServiceDocumentRecords,
  setQuoteEstimatorInfoServiceDocumentRecords,
  setQuoteEstimatorInfoSubscriberQuoteRecords,
  resetQuoteEstimatorInfo,
  setQuoteProgressPage,
};

export default connect(mapStateToProps, mapActionToProps)(QuoteCreate);
