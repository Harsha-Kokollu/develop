import React, { useEffect, useState } from "react";
import IntlUtil from "../../../core/helpers/intl-util";
import PageUtil from "../../../core/helpers/page-util";
import {
  DetailsList,
  DetailsListLayoutMode,
  IconButton,
  SelectionMode,
  TooltipHost,
  TooltipOverflowMode,
} from "@fluentui/react";
import { getQuote, getQuotesOrdersSearch } from "../actions/quote-action";
import { AppConfigProps } from "../../../core/settings/app-config";
import { QuoteOrderTableColumns } from "../settings/quote-order-table-columns";
import { useSearchParams } from "react-router-dom";
import moment from "moment";
import PageOverlayLoader from "../../common/helpers/page-overlay-loader";
import _ from "lodash";
import { QuoteEstimatorTableColumns } from "../settings/quote-estimator-table-columns";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";
import { OperatorConnectConstants } from "../../common/settings/operator-connect-constants";
import axios from "axios";
import { AppPageTitle } from "../../../core/components/app-page-title";
import { manageError } from "../../../core/actions/common-actions";

const QuoteOrders = (props) => {
  const _intl_ns_common = "oc_common";
  const _intl_ns_oc_quote = "oc_quote";
  const _axiosSource = axios.CancelToken.source();
  const _cancelToken = { cancelToken: _axiosSource.token };
  let [searchParams] = useSearchParams();
  let tableHeaderColumns = QuoteOrderTableColumns(_intl_ns_oc_quote);
  let [isPageDataFetched, setPageDataFetched] = useState(false);
  let [isListDataFetched, setListDataStatus] = useState(true);
  let [quoteRecord, setquotelist] = useState([]);
  let keyword = searchParams.get("search");

  useEffect(() => {
    PageUtil.scrollToTop();
    const getData = async () => {
      setPageDataFetched(false);
      if (keyword?.trim() !== "") {
        await fetchQuotesOrdersList(keyword?.trim());
      } else {
        setquotelist([]);
      }
      setPageDataFetched(true);
    };
    getData();
  }, [keyword]);

  const handleSavePDF = async (quoteRecord) => {
    let tableHeaders = [];
    let tableRecords = [];
    let onboardServiceDocumentRecords = [];
    let generalDocumentRecords = [];
    let serviceDocumentRecords = [];
    let communicationPlatformDocumentRecords = [];
    let onboardCountries = [];
    let currencySymbol = "";
    let serviceMrcSubTotalCost = 0;
    let serviceNrcSubTotalCost = 0;
    let serviceTotalCost = 0;
    if (
      quoteRecord &&
      quoteRecord.documents &&
      quoteRecord.documents.length > 0
    ) {
      await quoteRecord.documents.forEach((country) => {
        if (country.categoryType === "Country") {
          onboardCountries.push(country.categoryName);
        }
      });

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
      await onboardCountries.forEach((country) => {
        let documentList = [];
        quoteRecord.documents.forEach((doc, index) => {
          if (doc.categoryType === "Country" && country === doc.categoryName) {
            documentList.push(doc);
          }
        });
      });
    }
    if (quoteRecord.products && quoteRecord.products.length > 0) {
      await quoteRecord.products.forEach((rec) => {
        let nrc = 0;
        let mrc = 0;

        rec.productDetails = `${rec.countryName} - ${rec.productName} - ${
          rec.planName
        }${
          rec?.communicationPlatform ? " - " + rec?.communicationPlatform : ""
        }`;
        rec.nrcWithSymbol = "";

        let mrcPlatformWithSymbol = "";
        let nrcPlatformWithSymbol = "";

        let mrcOtherWithSymbol = "";
        rec.pricing.forEach((price) => {
          if (
            price.chargeType?.toLowerCase().trim() ===
            OperatorConnectConstants.QUOTE.CHARGE_TYPE.ONE_TIME?.toLowerCase().trim()
          ) {
            nrc = parseFloat(rec.quantity * price.msrpAmount) + nrc;
            nrcPlatformWithSymbol =
              price.msrpAmount !== null
                ? rec.currencySymbol +
                  parseFloat(rec.quantity * price?.msrpAmount ?? 0).toFixed(2)
                : "";
          }
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
            mrc = parseFloat(rec.quantity * price.msrpAmount) + mrc;
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
        let newLine = mrcPlatformWithSymbol !== "" ? "\n" : "";
        rec.mrcAllWithSymbol =
          mrcPlatformWithSymbol + newLine + mrcOtherWithSymbol;
        rec.nrcAllWithSymbol = nrcPlatformWithSymbol;
        serviceMrcSubTotalCost = serviceMrcSubTotalCost + mrc;
        serviceNrcSubTotalCost = serviceNrcSubTotalCost + nrc;
        currencySymbol = rec.currencySymbol;
        tableRecords.push({ ...rec });
      });
    }
    serviceTotalCost =
      serviceTotalCost + serviceMrcSubTotalCost + serviceNrcSubTotalCost;

    QuoteEstimatorTableColumns(_intl_ns_oc_quote).forEach((res) => {
      if (res.fieldName === "productName") {
        res.fieldName = "productDetails";
        res.name = IntlUtil.getText(_intl_ns_oc_quote, res.name);
      }
      if (res.fieldName === "quantity") {
        res.name = IntlUtil.getText(_intl_ns_oc_quote, res.name);
      }
      if (res.fieldName === "termPlan") {
        res.name = IntlUtil.getText(_intl_ns_oc_quote, res.name);
      }
      if (res.fieldName === "nrc") {
        res.fieldName = "nrcAllWithSymbol";
        res.name = "NRC";
      }
      if (res.fieldName === "mrc") {
        res.fieldName = "mrcAllWithSymbol";
        res.name = "MRC";
      }
      tableHeaders.push({ header: res.name, dataKey: res.fieldName });
    });

    let pdfDoc = new jsPDF("p", "pt", "a4");
    let imageHeight = 0;
    pdfDoc.setFontSize(18);
    pdfDoc.setFont("helvetica", "bold");
    pdfDoc.setTextColor("#231f20");
    pdfDoc.line(0, imageHeight + 50, 0, 0);
    let titleText =
      quoteRecord?.processStatus?.toLowerCase().trim() === "paymentsubmit"
        ? IntlUtil.getText(_intl_ns_oc_quote, "content.order")
        : IntlUtil.getText(_intl_ns_oc_quote, "content.quote");
    pdfDoc.text(285, imageHeight + 55, titleText, { align: "center" });
    pdfDoc.text(285, imageHeight + 56, "_____", { align: "center" });

    pdfDoc.setFont("helvetica", "normal");
    pdfDoc.setFontSize(11);
    let height = imageHeight + 45;
    autoTable(pdfDoc, {
      startY: height + 40,
      body: [
        {
          numberTitle:
            IntlUtil.getText(_intl_ns_oc_quote, "content.reference") +
              ": " +
              quoteRecord?.quoteNumber ?? "",
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
            IntlUtil.getText(_intl_ns_oc_quote, "content.date") +
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
            IntlUtil.getText(_intl_ns_oc_quote, "content.name") +
            ": " +
            quoteRecord.customerName,
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
            IntlUtil.getText(_intl_ns_oc_quote, "content.email") +
            ": " +
            quoteRecord?.customerEmail,
          numKey: quoteRecord?.customerPhone
            ? IntlUtil.getText(_intl_ns_oc_quote, "content.phone") +
              ": " +
              quoteRecord?.customerPhone
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
          termPlan: IntlUtil.getText(_intl_ns_oc_quote, "content.subTotal"),
          nrcAllWithSymbol:
            currencySymbol + parseFloat(serviceNrcSubTotalCost).toFixed(2),
          mrcAllWithSymbol:
            currencySymbol + parseFloat(serviceMrcSubTotalCost).toFixed(2),
        },
        {
          termPlan: IntlUtil.getText(_intl_ns_oc_quote, "content.total"),
          mrcAllWithSymbol:
            currencySymbol + parseFloat(serviceTotalCost).toFixed(2),
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
              IntlUtil.getText(_intl_ns_oc_quote, "content.total") ||
            table.cell.raw ===
              IntlUtil.getText(_intl_ns_oc_quote, "content.subTotal")
          ) {
            table.cell.styles.fontStyle = "bold";
          }
          if (
            table.column.dataKey === "nrcAllWithSymbol" ||
            table.column.dataKey === "mrcAllWithSymbol"
          ) {
            table.cell.styles.valign = "top";
            table.cell.styles.fontStyle = "bold";
            table.cell.styles.textColor = "#0075C9";
          }
          if (
            table.cell.raw ===
            IntlUtil.getText(_intl_ns_oc_quote, "content.termsAndConditions")
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
          IntlUtil.getText(_intl_ns_oc_quote, "content.termsAndConditions")
        ) {
          pdfDoc.setTextColor(0, 81, 124);
        }
      },
    });
    let splitLines = "";
    let previousTextDimensions = pdfDoc.lastAutoTable.finalY + 10;

    pdfDoc.setFontSize(12);
    pdfDoc.setFont("helvetica", "bold");
    pdfDoc.setTextColor("#231f20");
    pdfDoc.text(
      40,
      previousTextDimensions + 15,
      IntlUtil.getText(_intl_ns_oc_quote, "content.attachments") + ": "
    );
    previousTextDimensions = previousTextDimensions + 25;

    if (serviceDocumentRecords && serviceDocumentRecords.length > 0) {
      let checkedServiceDocRecords = [];

      await serviceDocumentRecords.forEach((rec) => {
        checkedServiceDocRecords.push({
          documentTitle: rec.documentTitle,
          documentLink: rec?.documentLink,
        });
      });

      autoTable(pdfDoc, {
        margin: { left: 35 },
        startY: previousTextDimensions,
        body: [...checkedServiceDocRecords],
        columns: [
          {
            header: IntlUtil.getText(
              _intl_ns_oc_quote,
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
      communicationPlatformDocumentRecords &&
      communicationPlatformDocumentRecords.length > 0
    ) {
      let checkedPlatformDocRecords = [];

      await communicationPlatformDocumentRecords.forEach((rec) => {
        checkedPlatformDocRecords.push({
          documentTitle: rec?.documentTitle,
          documentLink: rec?.documentLink,
        });
      });
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

    if (generalDocumentRecords && generalDocumentRecords.length > 0) {
      let checkedGeneralDocRecords = [];
      await generalDocumentRecords.forEach((rec) => {
        checkedGeneralDocRecords.push({
          documentTitle: rec.documentTitle,
          documentLink: rec?.documentLink,
        });
      });
      autoTable(pdfDoc, {
        margin: { left: 35 },
        startY: previousTextDimensions,
        body: [...checkedGeneralDocRecords],
        columns: [
          {
            header: IntlUtil.getText(
              _intl_ns_oc_quote,
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

    if (onboardServiceDocumentRecords) {
      let filteredConnections = [];
      let filteredOnboardServiceDocumentRecords = [];
      let selectedDocuments = [];

      quoteRecord.products.forEach((rec) => {
        filteredConnections.push({ documentType: rec.planName });
        selectedDocuments.push({
          documentType: rec.planName,
          countryName: rec.countryName,
        });
      });

      _.forEach(quoteRecord.documents, (servDoc, key) => {
        _.forEach(selectedDocuments, (filteredCountry, key2) => {
          if (
            servDoc.documentType === filteredCountry.documentType &&
            servDoc.categoryName === filteredCountry.countryName
          ) {
            filteredOnboardServiceDocumentRecords.push(servDoc);
          }
        });
      });
      await quoteRecord.documents.forEach((doc) => {
        if (filteredConnections.includes(doc.documentType) === true) {
          filteredOnboardServiceDocumentRecords.push(doc);
        }
      });
      let sortedDocuments = _.chain(filteredOnboardServiceDocumentRecords)
        .groupBy("categoryName")
        .map((value, key) => ({ countryName: key, documents: value }))
        .value();

      let checkedOnboardDocRecords = [];
      let documents = [];
      await sortedDocuments.forEach((rec) => {
        if (rec && rec.documents && rec.documents.length > 0) {
          rec.documents.forEach((doc) => {
            documents.push(doc);
          });
        }
      });
      let selectedCountries = [];
      await sortedDocuments.forEach((rec) => {
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
      });
      autoTable(pdfDoc, {
        margin: { left: 35 },
        startY: previousTextDimensions,
        body: [...checkedOnboardDocRecords],

        columns: [
          {
            header: IntlUtil.getText(
              _intl_ns_oc_quote,
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
    if (quoteRecord) {
      if (quoteRecord?.subscriberAccount) {
        let businessName = quoteRecord?.subscriberAccount?.businessName ?? "";
        let billingAccountNumber =
          quoteRecord?.subscriberAccount?.billingAccountNumber ?? "";
        let customerDomains =
          quoteRecord?.subscriberAccount?.customerDomains ?? "";
        let streetAddress1 =
          quoteRecord?.subscriberAccount?.address?.addLine1 ?? "";
        let streetAddress2 =
          quoteRecord?.subscriberAccount?.address?.addLine2 ?? "";
        let city = quoteRecord?.subscriberAccount?.address?.city ?? "";
        let stateName = quoteRecord?.subscriberAccount?.address?.state ?? "";
        let postalCode =
          quoteRecord?.subscriberAccount?.address?.postalCode ?? "";
        let country = quoteRecord?.subscriberAccount?.address?.country ?? "";
        let firstName =
          quoteRecord?.subscriberAccount?.contact?.firstName ?? "";
        let lastName = quoteRecord?.subscriberAccount?.contact?.lastName ?? "";
        let email = quoteRecord?.subscriberAccount?.contact?.email ?? "";
        let phone = quoteRecord?.subscriberAccount?.contact?.phone ?? "";
        let paymentInfo = [
          {
            documentTitle:
              IntlUtil.getText(_intl_ns_oc_quote, "content.businessName") +
              ": " +
              businessName,
          },
          {
            documentTitle:
              IntlUtil.getText(
                _intl_ns_oc_quote,
                "content.billingAccountNumber"
              ) +
              ": " +
              billingAccountNumber,
          },
          {
            documentTitle:
              IntlUtil.getText(_intl_ns_oc_quote, "content.customerDomains") +
              ": " +
              customerDomains,
          },
          {
            documentTitle:
              IntlUtil.getText(_intl_ns_oc_quote, "content.streetAddress1") +
              ": " +
              streetAddress1,
          },
          {
            documentTitle:
              IntlUtil.getText(_intl_ns_oc_quote, "content.streetAddress2") +
              ": " +
              streetAddress2,
          },
          {
            documentTitle:
              IntlUtil.getText(_intl_ns_oc_quote, "content.city") + ": " + city,
          },
          {
            documentTitle:
              IntlUtil.getText(_intl_ns_oc_quote, "content.state") +
              ": " +
              stateName,
          },
          {
            documentTitle:
              IntlUtil.getText(_intl_ns_oc_quote, "content.zipCode") +
              ": " +
              postalCode,
          },
          {
            documentTitle:
              IntlUtil.getText(_intl_ns_oc_quote, "content.country") +
              ": " +
              country,
          },
          {
            documentTitle:
              IntlUtil.getText(_intl_ns_oc_quote, "content.firstName") +
              ": " +
              firstName,
          },
          {
            documentTitle:
              IntlUtil.getText(_intl_ns_oc_quote, "content.lastName") +
              ": " +
              lastName,
          },
          {
            documentTitle:
              IntlUtil.getText(_intl_ns_oc_quote, "content.email") +
              ": " +
              email,
          },
          {
            documentTitle:
              IntlUtil.getText(_intl_ns_oc_quote, "content.phone") +
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
                _intl_ns_oc_quote,
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
        quoteRecord?.paymentInfo?.paymentType ===
        OperatorConnectConstants.QUOTE.ORDER_CHECKOUT.ORDER_TYPE.PURCHASE_ORDER
      ) {
        let paymentType = quoteRecord?.paymentInfo?.paymentType ?? "";
        let poNumber =
          quoteRecord?.paymentInfo?.purchaseOrderData?.orderNumber ?? "";
        let name = quoteRecord?.paymentInfo?.purchaseOrderData?.name ?? "";
        let email = quoteRecord?.paymentInfo?.purchaseOrderData?.email ?? "";
        let phone = quoteRecord?.paymentInfo?.purchaseOrderData?.phone ?? "";
        let paymentInfo = [
          {
            documentTitle:
              IntlUtil.getText(_intl_ns_oc_quote, "content.paymentType") +
              ": " +
              paymentType,
          },
          {
            documentTitle:
              IntlUtil.getText(_intl_ns_oc_quote, "content.poNumber") +
              ": " +
              poNumber,
          },
          {
            documentTitle:
              IntlUtil.getText(_intl_ns_oc_quote, "content.name") + ": " + name,
          },
          {
            documentTitle:
              IntlUtil.getText(_intl_ns_oc_quote, "content.email") +
              ": " +
              email,
          },
          {
            documentTitle:
              IntlUtil.getText(_intl_ns_oc_quote, "content.phone") +
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
                _intl_ns_oc_quote,
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
    pdfDoc.save(`${titleText}_${quoteRecord?.quoteNumber}`);
  };

  const fetchQuotesOrdersList = async (Keyword) => {
    await getQuotesOrdersSearch(Keyword, _cancelToken)
      .then((res) => {
        if (
          res &&
          res.status === AppConfigProps.httpStatusCode.ok &&
          res.data &&
          res.data.records
        ) {
          const records = _.orderBy(
            res.data.records,
            ["createTimestamp"],
            "desc"
          );
          setquotelist(records);
          setPageDataFetched(true);
        }
      })
      .catch(async (err) => {
        setPageDataFetched(true);
        await manageError(err, this.props.location, this.props.navigate);
      });
  };

  const handleDownloadPdf = async (item) => {
    setListDataStatus(false);
    await getQuote(item.quoteId, _cancelToken)
      .then(async (res) => {
        if (
          res &&
          res.status === AppConfigProps.httpStatusCode.ok &&
          res.data &&
          res.data.result
        ) {
          await handleSavePDF(res.data.result);
          setListDataStatus(true);
        }
      })
      .catch(async (err) => {
        setListDataStatus(true);
        await manageError(err, props.location, props.navigate);
      });
  };

  const handleItemRender = (item, index, column) => {
    switch (column.key) {
      case "createTimestamp":
        return (
          <div>
            {moment.utc(item.createTimestamp).format("MMM D, YYYY HH:MM")}
          </div>
        );
      case "quoteNumber":
        return <span className="quote-link-text">{item.quoteNumber}</span>;
      case "download":
        return (
          <IconButton
            className="quote-page-frame-icon"
            onClick={() => handleDownloadPdf(item)}
            iconProps={{ iconName: "Download" }}
          />
        );

      default:
        return (
          <div>
            <TooltipHost
              overflowMode={TooltipOverflowMode.Self}
              hostClassName="invoice-description-text"
              content={item[column.fieldName]}
            >
              {item[column.fieldName]}
            </TooltipHost>
          </div>
        );
    }
  };

  return (
    <>
      <AppPageTitle
        pageTitle={IntlUtil.getText(_intl_ns_oc_quote, "title.quoteOrOrder")}
      />
      <div id="oc-page-container">
        <div className="page-main-header-wrapper">
          <div className="page-main-header-title">
            {IntlUtil.getText(_intl_ns_oc_quote, "content.quotes_Orders")}
          </div>
        </div>
        <div className="page-frame-content">
          {keyword !== null &&
          keyword !== undefined &&
          keyword?.trim() !== "" ? (
            <>
              {isPageDataFetched ? (
                <div className="page-frame-table">
                  {quoteRecord && quoteRecord.length > 0 ? (
                    <DetailsList
                      columns={tableHeaderColumns}
                      setKey="quoteRecord"
                      items={quoteRecord}
                      selectionMode={SelectionMode.none}
                      layoutMode={DetailsListLayoutMode.justified}
                      onRenderItemColumn={handleItemRender}
                    />
                  ) : null}
                  {isPageDataFetched && quoteRecord.length === 0 ? (
                    <div className="p-10">
                      {IntlUtil.getText(
                        _intl_ns_oc_quote,
                        "notification.info.noDatafound"
                      )}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
        <PageOverlayLoader
          hidden={isPageDataFetched}
          label={IntlUtil.getText(_intl_ns_common, "content.loadingInprogress")}
        />
        <PageOverlayLoader
          hidden={isListDataFetched}
          label={IntlUtil.getText(_intl_ns_common, "content.loadingInprogress")}
        />
      </div>
    </>
  );
};

export default QuoteOrders;
