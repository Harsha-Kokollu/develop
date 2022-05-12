import { DefaultButton,  Image, Label, PrimaryButton, Text, TooltipHost } from "@fluentui/react";
import React, { useEffect, useState } from "react";
import IntlUtil from "../../../core/helpers/intl-util";
import axios from "axios";
import { AddToShoppingListIcon, ChevronLeftMedIcon, ChevronRightMedIcon, InfoIcon, PhoneIcon, ShoppingCartIcon } from "@fluentui/react-icons";
import Carousel from 'react-elastic-carousel';
import LumenMap from "../../../../assets/images/Lumen-image.png";
import { OperatorConnectURLProps } from "../settings/operator-connect-urls";
import PageUtil from "../../../core/helpers/page-util";
import { AppPageTitle } from "../../../core/components/app-page-title";
import { getProducts,setProductRecords } from "../actions/common-actions";
import { AppConfigProps } from "../../../core/settings/app-config";
import PageOverlayLoader from "../helpers/page-overlay-loader";
import { connect } from "react-redux";
import { getTimeDifferenceSeconds } from "../actions/general-actions";
import { OperatorConnectConstants } from "../settings/operator-connect-constants";
import { manageError } from "../../../core/actions/common-actions";

const _intl_ns_oc_home = "oc_home";
const _intl_ns_common = "oc_common";
const _axiosSource = axios.CancelToken.source();
const _cancelToken = { cancelToken: _axiosSource.token };


const Home = (props) => {
    const [isPageDataFetched, setPageDataFetched] = useState(false);
    const [products, setProducts] = useState([]);

    useEffect(async () => {
        PageUtil.scrollToTop();
        setPageDataFetched(false);
        if (props.isProductRecordsDataFetched === false) {
            await fetchProducts();
          } else {
            const durationSeconds = getTimeDifferenceSeconds(
              props.productRecordsDataFetchTimestamp,
              new Date()
            );
            if (
              durationSeconds &&
              durationSeconds <=
              OperatorConnectConstants.GENERAL.LIST_DATA_REFRESH_INTERVAL_SECONDS
            ) {
              await setProductList();
            } else {
              await fetchProducts();
            }
          }
      setPageDataFetched(true);

    }, []);

    const setProductList=async()=>{
        let productRecords=[];
        if(props?.productRecords&&props?.productRecords?.length>0){
            productRecords=[...props?.productRecords];
            setProducts(productRecords);
        }
    }

    const breakPoints = [
        { width: 1, itemsToShow: 1, pagination: false },
        { width: 496, itemsToShow: 2, pagination: false },
        { width: 960, itemsToShow: 3, pagination: false },
        { width: 850, itemsToShow: 3, pagination: false },
        { width: 1024, itemsToShow: 3, pagination: false },
        { width: 1150, itemsToShow: 4, pagination: false },
        { width: 1450, itemsToShow: 4, pagination: false },
        { width: 1750, itemsToShow: 4, pagination: false },
    ]
    const handleProductView = (product) => {
        props.navigate(OperatorConnectURLProps.productManagement.productView.replace(":pid", product.productId))
    }

    const fetchProducts = async () => {
        await getProducts(_cancelToken).then(res => {
            if (res &&
                res.status === AppConfigProps.httpStatusCode.ok &&
                res.data &&
                res.data.records) {
                setProducts(res.data.records);
                props.setProductRecords(res.data.records);
            }

        }).catch(async err=>{
            await manageError(err, props.location, props.navigate);
        });
    }

    const renderCustomArrow = (props) => {
        if (props.type?.toLowerCase() === "next") {
            return (<><ChevronRightMedIcon className="product-custom-arrow-right" onClick={() => props.onClick()} /></>)
        } else {
            return (<><ChevronLeftMedIcon className="product-custom-arrow-left" onClick={() => props.onClick()} /></>)
        }
    }
    const loadQuoteCreatePage = (product) => {
        return props.navigate(OperatorConnectURLProps.orderManagement.quoteAdd);
    }
    return (<>
        <AppPageTitle pageTitle={IntlUtil.getText(_intl_ns_oc_home, "title.home")} />
        <div id="oc-page-container" >
            {isPageDataFetched === true ? (<>
                <div className="p-b-20 oc-product-main-image-wrapper">
                    <Image src={LumenMap} />
                </div>
                <div className="oc-main-title-wrapper">
                    <Label className="text-fc-primary text-fs-large-xx" >
                        {IntlUtil.getText(_intl_ns_oc_home, "content.ProductsAndServices")}
                    </Label>
                    <Text>
                        {IntlUtil.getText(_intl_ns_oc_home, "content.ProductsDescription")}
                    </Text>
                </div>
                <div className="oc-main-content-wrapper" >
                    <Carousel
                        className="product-carousel-container"
                        breakPoints={breakPoints}
                        renderArrow={renderCustomArrow}

                    >
                        {products.map((product, index) => {
                            let decimalValue = (parseFloat(parseFloat(product.partnerCost).toFixed(2) - parseInt(product.partnerCost)).toFixed(2)).toString().split(".")[1]
                            return (<>
                                <div key={index} className="product-card-wrapper">
                                    <div className="product-card-title-wrapper">
                                        <span>{product.productName}</span>
                                    </div>
                                    <div className="product-card-content-wrapper">
                                        <div className="product-card-image-wrapper" >
                                            <Image src={`data:image/png;base64, ${product.productIcon}`} />
                                            <div className="text-fw-semibold p-10" >
                                                {product && product.msrpAmount !== null && product.msrpAmount !== undefined ? (<>
                                                    <span className="text-fs-large-xxx text-fc-secondary" >
                                                        {product.currencySymbol}{parseInt(product?.msrpAmount ?? "0")}</span><span className="m-l-0 m-t-5 text-fc-secondary"><div className="text-fc-secondary">
                                                            <span className="text-fc-secondary">{decimalValue ?? "00"}</span></div><div  className="m-t-0 text-fc-secondary"><span className="text-fc-secondary">/mo</span></div>
                                                    </span> </>) : <TooltipHost content={IntlUtil.getText(_intl_ns_oc_home,"content.support")}><PhoneIcon className="product-card-icon text-fc-secondary" /></TooltipHost>}
                                            </div>
                                        </div>
                                        <div className="m-t-40 home-carousel-button">
                                            <DefaultButton className="page-frame-button" onClick={() => handleProductView(product)}><InfoIcon className="m-r-5 m-b-0 page-frame-icon" />{IntlUtil.getText(_intl_ns_oc_home, "content.moreInfo")}</DefaultButton>
                                        </div>
                                        <div className="m-t-15 home-carousel-button">
                                            <PrimaryButton className="page-frame-button" onClick={()=>loadQuoteCreatePage(product)}><AddToShoppingListIcon className="m-r-5 page-frame-icon" />{IntlUtil.getText(_intl_ns_oc_home, "content.createQuote")}</PrimaryButton>
                                        </div>

                                    </div>
                                </div>
                            </>)
                        })}
                    </Carousel>
                </div></>) : null}
            <PageOverlayLoader hidden={isPageDataFetched} label={IntlUtil.getText(_intl_ns_common, "content.loadingInprogress")} />
        </div>
    </>)

}

const mapStateToProps = (state) => ({
    isProductRecordsDataFetched:state.productStore.isProductRecordsDataFetched,
    productRecordsDataFetchTimestamp:state.productStore.productRecordsDataFetchTimestamp,
    productRecords:state.productStore.productRecords

});
const mapActionToProps = {
    setProductRecords
};

export default connect(mapStateToProps, mapActionToProps)(Home);