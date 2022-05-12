import { Text, DefaultButton } from "@fluentui/react";
import { DownloadIcon } from "@fluentui/react-icons";
import axios from "axios";
import React, { Component } from "react";
import { connect } from "react-redux";
import IntlUtil from "../../../core/helpers/intl-util";
import PageUtil from "../../../core/helpers/page-util";
import { OperatorConnectConstants } from "../../common/settings/operator-connect-constants";
import { QuoteEstimatorTableColumns } from "../settings/quote-estimator-table-columns";
import { QuotePOFormFields } from "../settings/quote-user-form-fields";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";
import moment from "moment";
import { AppPageTitle } from "../../../core/components/app-page-title";
import QuoteBuilderEstimator from "../helper/quote-builder-estimator";
import TelemetryUtil from "../../../core/helpers/telemetry-util";

class OrderConfirmation extends Component {
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
      tableHeaderColumns: this.initQuoteEstimatorheaderColumns(),
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
      IntlUtil.getText(this._intl_ns_oc_quote, "title.orderConfirmation")
    );
    await this.setStateAsync({ isPageDataFetched: true });
    //await this.loadPageData();
  }

  // loadPageData=async()=>{
  //     if(this.props.quoteEstimatorInfo&&this.props.quoteEstimatorInfo.subscriberDetails){
  //         await this.setFormFieldValues(this.props.quoteEstimatorInfo.subscriberDetails);
  //     }
  // }
  initQuoteEstimatorheaderColumns = () => {
    let tableHeaderColumns = [];
    tableHeaderColumns = [
      ...tableHeaderColumns,
      ...QuoteEstimatorTableColumns(this._intl_ns_oc_quote),
    ];
    return tableHeaderColumns;
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

  handleSavePDF = async () => {
    let tableHeaders = [];
    let tableRecords = [];
    let currencySymbol = "";

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
      IntlUtil.getText(this._intl_ns_oc_quote, "content.order"),
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
          numberTitle:
            IntlUtil.getText(this._intl_ns_oc_quote, "content.reference") +
            ": " +
            this.props.quoteEstimatorInfo?.subscriberQuoteRecords?.quoteNumber,
          dateValue: "",
        },
      ],
      columns: [{ header: "", dataKey: "numberTitle" }],
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
            table.cell.styles.valign = "top";
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
      previousTextDimensions = pdfDoc.lastAutoTable.finalY + 10;
    }
    if (
      this.props.quoteEstimatorInfo &&
      this.props.quoteEstimatorInfo?.subscriberQuoteRecords
    ) {
      if (
        this.props.quoteEstimatorInfo?.subscriberQuoteRecords?.subscriberAccount
      ) {
        let businessName =
          this.props.quoteEstimatorInfo?.subscriberQuoteRecords
            ?.subscriberAccount?.businessName ?? "";
        let billingAccountNumber =
          this.props.quoteEstimatorInfo?.subscriberQuoteRecords
            ?.subscriberAccount?.billingAccountNumber ?? "";
        let customerDomains =
          this.props.quoteEstimatorInfo?.subscriberQuoteRecords
            ?.subscriberAccount?.customerDomains ?? "";
        let streetAddress1 =
          this.props.quoteEstimatorInfo?.subscriberQuoteRecords
            ?.subscriberAccount?.address?.addLine1 ?? "";
        let streetAddress2 =
          this.props.quoteEstimatorInfo?.subscriberQuoteRecords
            ?.subscriberAccount?.address?.addLine2 ?? "";
        let city =
          this.props.quoteEstimatorInfo?.subscriberQuoteRecords
            ?.subscriberAccount?.address?.city ?? "";
        let stateName =
          this.props.quoteEstimatorInfo?.subscriberQuoteRecords
            ?.subscriberAccount?.address?.state ?? "";
        let postalCode =
          this.props.quoteEstimatorInfo?.subscriberQuoteRecords
            ?.subscriberAccount?.address?.postalCode ?? "";
        let country =
          this.props.quoteEstimatorInfo?.subscriberQuoteRecords
            ?.subscriberAccount?.address?.country ?? "";
        let firstName =
          this.props.quoteEstimatorInfo?.subscriberQuoteRecords
            ?.subscriberAccount?.contact?.firstName ?? "";
        let lastName =
          this.props.quoteEstimatorInfo?.subscriberQuoteRecords
            ?.subscriberAccount?.contact?.lastName ?? "";
        let email =
          this.props.quoteEstimatorInfo?.subscriberQuoteRecords
            ?.subscriberAccount?.contact?.email ?? "";
        let phone =
          this.props.quoteEstimatorInfo?.subscriberQuoteRecords
            ?.subscriberAccount?.contact?.phone ?? "";

        let paymentInfo = [
          {
            documentTitle:
              IntlUtil.getText(this._intl_ns_oc_quote, "content.businessName") +
              ": " +
              businessName,
          },
          {
            documentTitle:
              IntlUtil.getText(
                this._intl_ns_oc_quote,
                "content.billingAccountNumber"
              ) +
              ": " +
              billingAccountNumber,
          },
          {
            documentTitle:
              IntlUtil.getText(
                this._intl_ns_oc_quote,
                "content.customerDomains"
              ) +
              ": " +
              customerDomains,
          },
          {
            documentTitle:
              IntlUtil.getText(
                this._intl_ns_oc_quote,
                "content.streetAddress1"
              ) +
              ": " +
              streetAddress1,
          },
          {
            documentTitle:
              IntlUtil.getText(
                this._intl_ns_oc_quote,
                "content.streetAddress2"
              ) +
              ": " +
              streetAddress2,
          },
          {
            documentTitle:
              IntlUtil.getText(this._intl_ns_oc_quote, "content.city") +
              ": " +
              city,
          },
          {
            documentTitle:
              IntlUtil.getText(this._intl_ns_oc_quote, "content.state") +
              ": " +
              stateName,
          },
          {
            documentTitle:
              IntlUtil.getText(this._intl_ns_oc_quote, "content.zipCode") +
              ": " +
              postalCode,
          },
          {
            documentTitle:
              IntlUtil.getText(this._intl_ns_oc_quote, "content.country") +
              ": " +
              country,
          },
          {
            documentTitle:
              IntlUtil.getText(this._intl_ns_oc_quote, "content.firstName") +
              ": " +
              firstName,
          },
          {
            documentTitle:
              IntlUtil.getText(this._intl_ns_oc_quote, "content.lastName") +
              ": " +
              lastName,
          },
          {
            documentTitle:
              IntlUtil.getText(this._intl_ns_oc_quote, "content.email") +
              ": " +
              email,
          },
          {
            documentTitle:
              IntlUtil.getText(this._intl_ns_oc_quote, "content.phone") +
              ": " +
              phone,
          },
        ];
        autoTable(pdfDoc, {
          margin: { left: 35 },
          startY: previousTextDimensions + 15,
          body: [...paymentInfo],
          columns: [
            {
              header: IntlUtil.getText(
                this._intl_ns_oc_quote,
                "content.customerAccountDetails"
              ),
              dataKey: "documentTitle",
            },
          ],
          didParseCell: (table) => {
            if (table.section === "head") {
              table.cell.styles.fillColor = "#ffffff";
              table.cell.styles.textColor = "#231f20";
              table.cell.styles.fontSize = 11;
              table.cell.styles.cellPadding = { bottom: 10, left: 4 };
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
          },
        });
        previousTextDimensions = pdfDoc.lastAutoTable.finalY + 10;
      }
      if (
        this.props.quoteEstimatorInfo?.subscriberQuoteRecords?.paymentInfo
          ?.paymentType ===
        OperatorConnectConstants.QUOTE.ORDER_CHECKOUT.ORDER_TYPE.PURCHASE_ORDER
      ) {
        let paymentType =
          this.props.quoteEstimatorInfo?.subscriberQuoteRecords?.paymentInfo
            ?.paymentType ?? "";
        let poNumber =
          this.props.quoteEstimatorInfo?.subscriberQuoteRecords?.paymentInfo
            ?.purchaseOrderData?.orderNumber ?? "";
        let name =
          this.props.quoteEstimatorInfo?.subscriberQuoteRecords?.paymentInfo
            ?.purchaseOrderData?.name ?? "";
        let email =
          this.props.quoteEstimatorInfo?.subscriberQuoteRecords?.paymentInfo
            ?.purchaseOrderData?.email ?? "";
        let phone =
          this.props.quoteEstimatorInfo?.subscriberQuoteRecords?.paymentInfo
            ?.purchaseOrderData?.phone ?? "";

        let paymentInfo = [
          {
            documentTitle:
              IntlUtil.getText(this._intl_ns_oc_quote, "content.paymentType") +
              ": " +
              paymentType,
          },
          {
            documentTitle:
              IntlUtil.getText(this._intl_ns_oc_quote, "content.poNumber") +
              ": " +
              poNumber,
          },
          {
            documentTitle:
              IntlUtil.getText(this._intl_ns_oc_quote, "content.name") +
              ": " +
              name,
          },
          {
            documentTitle:
              IntlUtil.getText(this._intl_ns_oc_quote, "content.email") +
              ": " +
              email,
          },
          {
            documentTitle:
              IntlUtil.getText(this._intl_ns_oc_quote, "content.phone") +
              ": " +
              phone,
          },
        ];
        autoTable(pdfDoc, {
          margin: { left: 35 },
          startY: previousTextDimensions + 15,
          body: [...paymentInfo],
          columns: [
            {
              header: IntlUtil.getText(
                this._intl_ns_oc_quote,
                "content.paymentDetails"
              ),
              dataKey: "documentTitle",
            },
          ],
          didParseCell: (table) => {
            if (table.section === "head") {
              table.cell.styles.fillColor = "#ffffff";
              table.cell.styles.textColor = "#231f20";
              table.cell.styles.fontSize = 11;
              table.cell.styles.cellPadding = { bottom: 10, left: 4 };
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
          },
        });
      }
    }
    pdfDoc.save(
      `Order_${this.props.quoteEstimatorInfo?.subscriberQuoteRecords?.quoteNumber}`
    );
  };

  renderQuoterBuilderEstimator = (intlNamespace, quoteEstimatorInfo) => {
    return (
      <>
        <div className="page-frame-content">
          <QuoteBuilderEstimator
            intlNamespace={this._intl_ns_oc_quote}
            quoteEstimatorInfo={this.props.quoteEstimatorInfo}
          />
        </div>
      </>
    );
  };

  render() {
    return (
      <>
        <div
          className="page-frame-content frame-content-quotes"
          ref={this.orderCheckoutRef}
        >
          <div>
            <span className="m-l-10 quote-page-text-wrapper">
              {IntlUtil.getText(
                this._intl_ns_oc_quote,
                "notification.info.thankyouForOrdering"
              )}
            </span>
          </div>
          <div className="m-t-10 quote-page-text-wrapper">
            <span className="text-fc-primary text-fw-semibold text-fs-large m-l-10">
              {IntlUtil.getSubstituteText(
                this._intl_ns_oc_quote,
                "content.orderReferenceNumber",
                [
                  {
                    key: "<QUOTE_NUMBER>",
                    value:
                      this.props?.quoteEstimatorInfo?.subscriberQuoteRecords
                        ?.quoteNumber ?? " ",
                  },
                ]
              )}
            </span>
          </div>
        </div>
        <div className="m-t-10 m-l-10 quote-page-text-wrapper">
          <Text>
            {IntlUtil.getSubstituteText(
              this._intl_ns_oc_quote,
              "content.orderText",
              [
                {
                  key: "<EMAIL>",
                  value:
                    this.props?.quoteEstimatorInfo?.subscriberQuoteRecords
                      ?.customerEmail ?? " ",
                },
              ]
            )}
          </Text>
        </div>
        <div className="page-content-separator"></div>
        {this.renderQuoterBuilderEstimator(
          this._intl_ns_oc_quote,
          this.props.quoteEstimatorInfo
        )}
        <div>
          <div className="page-content-separator"></div>
          <div style={{ paddingLeft: "2px" }}>
            <DefaultButton
              onClick={this.handleSavePDF}
              className="m-l-5 m-t-20 page-frame-button"
            >
              <DownloadIcon className="m-r-5 page-frame-icon" />
              {IntlUtil.getText(
                this._intl_ns_oc_quote,
                "content.downloadOrder"
              )}
            </DefaultButton>
          </div>
        </div>
        <AppPageTitle
          pageTitle={IntlUtil.getText(
            this._intl_ns_oc_quote,
            "title.orderConfirmation"
          )}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  quoteEstimatorInfo: state.quoteStore.quoteEstimatorInfo,
  // countryStatesData:state.generalStore.countryStatesData
});
const mapActionToProps = {
  // setQuoteProgressPage
};

export default connect(mapStateToProps, mapActionToProps)(OrderConfirmation);
