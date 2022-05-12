import {
    TooltipOverflowMode,
    TooltipHost,
    IconButton,
    DetailsRow,
    DetailsList,
    Sticky,
    StickyPositionType,
    ConstrainMode,
    SelectionMode,
    DetailsListLayoutMode
} from "@fluentui/react";
import React, { memo } from "react";
import { connect } from "react-redux";
import { QuoteEstimatorTableColumns } from "../settings/quote-estimator-table-columns";
import { css } from '@fluentui/react/lib/Utilities';
import IntlUtil from "../../../core/helpers/intl-util";
import { OperatorConnectConstants } from "../../common/settings/operator-connect-constants";
import { modalStyles } from "../../common/helpers/styles";
import { InfoIcon } from "@fluentui/react-icons";
import { withTranslation } from "react-i18next";



/**
Project: Operator Connect (c)
Title: Quote Builder Estimator  
Description: Building the Quote 
Copyrights: This file is subject to the terms and conditions defined in file 'LICENSE.txt', which is part of this source code package.
*/

//import { InfoIcon } from "@fluentui/react-icons";


const QuoteBuilderEstimator = ({ intlNamespace, quoteEstimatorInfo, showTitle }) => {

    const handleQuoteHeaderColumns = () => {
        let tableHeaders = [];
        QuoteEstimatorTableColumns(intlNamespace).map(header => {
            if (header.fieldName === "nrc") {
                header.name = <TooltipHost content={IntlUtil.getText(intlNamespace, "content.tooltip.nrc")}>
                    <span>{IntlUtil.getText(intlNamespace, header.name)}<InfoIcon className="m-l-5" /></span>
                </TooltipHost>
            }
            else if (header.fieldName === "mrc") {
                header.name = <TooltipHost content={IntlUtil.getText(intlNamespace, "content.tooltip.mrc")}>
                    <span>{IntlUtil.getText(intlNamespace, header.name)} <InfoIcon className="m-l-5" /></span>
                </TooltipHost>
            } else {
                header.name = IntlUtil.getText(intlNamespace, header.name)
            }

            tableHeaders.push({ ...header })
        })
        return tableHeaders
    }
    const handleQuoterBuilderItemRender = (item, index, column) => {
        switch (column.key) {
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
            case "nrc": return (<>
                {item && item.pricing && item.pricing.map((price, index) => {
                    if (price?.chargeType?.toLowerCase().trim() === OperatorConnectConstants.QUOTE.CHARGE_TYPE.ONE_TIME?.toLowerCase().trim()) {
                        if (price?.chargeName?.toLowerCase().trim() === OperatorConnectConstants.QUOTE.CHARGE_NAME.ACTIVATION_FEE?.toLowerCase().trim() || price?.chargeName?.toLowerCase().trim() === OperatorConnectConstants.QUOTE.CHARGE_NAME.PORTING_FEE?.toLowerCase().trim()) {
                            let pricing = price.msrpAmount !== null && price.msrpAmount !== undefined ? item?.currencySymbol + parseFloat((parseFloat(item?.quantity ?? "0") * parseFloat(price.msrpAmount))).toFixed(2) : "";
                            return (<>
                                <span className="text-fc-primary text-ff-semibold">                                                        <TooltipHost hostClassName={css("m-0 p-0")} key={`q-${index}`} content={price?.chargeName}>
                                    {pricing} </TooltipHost></span>
                            </>)
                        }
                    } else {
                        return (<></>)
                    }
                    return (<></>)
                })}
                {item && item.pricing && item.pricing.map((price, index) => {
                    if (price?.chargeType?.toLowerCase().trim() === OperatorConnectConstants.QUOTE.CHARGE_TYPE.ONE_TIME?.toLowerCase().trim()) {
                        if (price?.chargeName?.toLowerCase().trim() !== OperatorConnectConstants.QUOTE.CHARGE_NAME.ACTIVATION_FEE?.toLowerCase().trim() && price?.chargeName?.toLowerCase().trim() !== OperatorConnectConstants.QUOTE.CHARGE_NAME.PORTING_FEE?.toLowerCase().trim()) {
                            let pricing = price.msrpAmount !== null && price.msrpAmount !== undefined ? item?.currencySymbol + parseFloat((parseFloat(item?.quantity ?? "0") * parseFloat(price.msrpAmount))).toFixed(2) : "";


                            return (<>
                                {oneTimeList.length > 1 ? " + " : ""} <span className="text-fc-primary text-ff-semibold" >                                                        <TooltipHost hostClassName={css("m-0 p-0")} key={`q-${index}`} content={price?.chargeName}>
                                    {pricing}</TooltipHost></span>
                            </>)
                        }
                    } else {
                        return (<></>)
                    }
                    return (<></>)

                })}
            </>)
            case "mrc": return (<>{item && item.pricing && item.pricing.map((price, index) => {
                if (price?.chargeType?.toLowerCase().trim() === OperatorConnectConstants.QUOTE.CHARGE_TYPE.RECURRING?.toLowerCase().trim()) {
                    if (price?.chargeName?.toLowerCase().trim() === OperatorConnectConstants.QUOTE.CHARGE_NAME.PLATFORM_CHARGES?.toLowerCase().trim()) {
                        let pricing = price.msrpAmount !== null && price.msrpAmount !== undefined ? item?.currencySymbol + parseFloat((parseFloat(item?.quantity ?? "0") * parseFloat(price.msrpAmount))).toFixed(2) : "";
                        return (<>
                            <div className="text-fc-primary text-ff-semibold" >                                                        <TooltipHost hostClassName={css("m-0 p-0")} key={`q-${index}`} content={price?.chargeName}>
                                {pricing} </TooltipHost></div>
                        </>)
                    } else {
                        return (<></>)
                    }
                } else {
                    return (<></>)

                }
            })}
                {item && item.pricing && item.pricing.map((price, index) => {
                    if (price?.chargeType?.toLowerCase().trim() === OperatorConnectConstants.QUOTE.CHARGE_TYPE.RECURRING?.toLowerCase().trim()) {
                        if (price?.chargeName?.toLowerCase().trim() !== OperatorConnectConstants.QUOTE.CHARGE_NAME.PLATFORM_CHARGES?.toLowerCase().trim()) {
                            let pricing = price.msrpAmount !== null && price.msrpAmount !== undefined ? item?.currencySymbol + parseFloat((parseFloat(item?.quantity ?? "0") * parseFloat(price.msrpAmount))).toFixed(2) : "";


                            return (<>
                                <span className="text-fc-primary text-ff-semibold">                                                        <TooltipHost hostClassName={css("m-0 p-0")} key={`q-${index}`} content={price?.chargeName}>
                                    {pricing}</TooltipHost></span>
                            </>)
                        }
                    } else {
                        return (<></>)
                    }
                    return (<></>)
                })}</>)
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
    const renderTotalDetailsFooterItemColumn = (item, index, column) => {
        switch (column.key) {

            case "termPlan":
                return (
                    <div >
                        <div>
                            <b>{IntlUtil.getText(intlNamespace, "content.total")}</b>
                        </div>
                    </div>
                );

            case "mrc":
                return (
                    <div className="text-fc-primary text-ff-semibold">
                        <div>
                            {quoteEstimatorInfo?.serviceTotalCost &&
                                quoteEstimatorInfo.serviceAndConnectionRecords &&
                                quoteEstimatorInfo.serviceAndConnectionRecords.length > 0
                                ? quoteEstimatorInfo.serviceAndConnectionRecords[0]
                                    ?.currencySymbol +
                                parseFloat(quoteEstimatorInfo?.serviceTotalCost).toFixed(
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
    const renderSubTotalDetailsFooterItemColumn = (item, index, column) => {
        switch (column.key) {
            case "termPlan":
                return (
                    <div className="">
                        <div>
                            <b>
                                {IntlUtil.getText(intlNamespace, "content.subTotal")}
                            </b>
                        </div>
                    </div>
                );
            case "nrc":
                return (
                    <div >
                        <div className="text-fc-primary text-ff-semibold">
                            {quoteEstimatorInfo?.serviceNrcSubTotalCost &&
                                quoteEstimatorInfo?.serviceAndConnectionRecords &&
                                quoteEstimatorInfo?.serviceAndConnectionRecords.length > 0
                                ? quoteEstimatorInfo?.serviceAndConnectionRecords[0]
                                    ?.currencySymbol +
                                parseFloat(
                                    quoteEstimatorInfo?.serviceNrcSubTotalCost
                                ).toFixed(2)
                                : null}
                        </div>
                    </div>
                );
            case "mrc":
                return (
                    <div >
                        <div className="text-fc-primary text-ff-semibold">
                            {!isNaN(quoteEstimatorInfo?.serviceMrcSubTotalCost) &&
                                quoteEstimatorInfo?.serviceAndConnectionRecords &&
                                quoteEstimatorInfo?.serviceAndConnectionRecords.length > 0
                                ? quoteEstimatorInfo?.serviceAndConnectionRecords[0]
                                    ?.currencySymbol +
                                parseFloat(
                                    quoteEstimatorInfo?.serviceMrcSubTotalCost
                                ).toFixed(2)
                                : "-"}
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
    const onRenderQuoterBuilderDetailsFooter = (detailsFooterProps) => {
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
                    onRenderItemColumn={renderSubTotalDetailsFooterItemColumn}
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
                    onRenderItemColumn={renderTotalDetailsFooterItemColumn}
                />
            </div>
        );
    };
    // render detail list
    const renderQuoterBuilderEstimatorList = () => {
        return (
            <>
                <DetailsList
                    className="page-frame-table"
                    columns={handleQuoteHeaderColumns()}
                    items={quoteEstimatorInfo?.serviceAndConnectionRecords}
                    compact={false}
                    layoutMode={DetailsListLayoutMode.justified}
                    isHeaderVisible={true}
                    onRenderItemColumn={handleQuoterBuilderItemRender}
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
                    onRenderDetailsFooter={onRenderQuoterBuilderDetailsFooter}
                />
            </>
        );
    };




    return (<>
        <div className="quote-estimator-page-content">
            <div className="quote-page-table-wrapper">
                {renderQuoterBuilderEstimatorList()}				
                <div className="quote-page-table-footer-text">
                    <span>
                        {IntlUtil.getText(intlNamespace, "content.taxesApplicable")}
                    </span>
                </div>
            </div>
        </div>
    </>)
}
const mapStateToProps = (state) => ({
    quoteEstimatorInfo:
        state.quoteStore.quoteEstimatorInfo,

});

const mapActionToProps = {
};


export default withTranslation()(connect(mapStateToProps, mapActionToProps)(memo(QuoteBuilderEstimator)));

