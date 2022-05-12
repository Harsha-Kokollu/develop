import {  PrimaryButton,TooltipHost,Text, Image} from "@fluentui/react";
import axios from "axios";
import React, {  useEffect, useReducer, useRef } from "react";
import { connect } from "react-redux";
import IntlUtil from "../../../core/helpers/intl-util";
import _ from "lodash";
import {Row,Col,Grid} from "react-flexbox-grid";
import { AddToShoppingListIcon, Link12Icon, PhoneIcon, TextDocumentIcon } from "@fluentui/react-icons";
import { OperatorConnectURLProps } from "../../common/settings/operator-connect-urls";
import PageUtil from "../../../core/helpers/page-util";
import {  useParams } from "react-router-dom";
import { AppPageTitle } from "../../../core/components/app-page-title";
import { getProduct } from "../actions/product-actions";
import { AppConfigProps } from "../../../core/settings/app-config";
import { manageError } from "../../../core/actions/common-actions";
import PageOverlayLoader from "../../common/helpers/page-overlay-loader";
import {getProducts,setProductRecords} from "../../common/actions/common-actions";
import {getTimeDifferenceSeconds} from "../../common/actions/general-actions";
import {OperatorConnectConstants} from "../../common/settings/operator-connect-constants";
const ProductView = (props) => {
    const _axiosSource = axios.CancelToken.source();
    const _cancelToken = { cancelToken: _axiosSource.token };
    const _intl_ns_common = "oc_common";
    const _intl_ns_oc_product = "oc_product";

    const [state, setState] = useReducer(
      (state, newState) => ({...state, ...newState}),
      {isPageDataFetched: true,
      productRecord:null}
    )
    
    const productViewRef=useRef();
    const productId = useParams().pid;


    useEffect(() => {
      PageUtil.scrollToTop();
           const getData=async()=>{
            setState({isPageDataFetched:false});
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
                   await fetchProduct(productId); 
           }
           getData();
    }, []);

    const fetchProducts = async () => {
      await getProducts(_cancelToken).then(res => {
          if (res &&
              res.status === AppConfigProps.httpStatusCode.ok &&
              res.data &&
              res.data.records) {
              props.setProductRecords(res.data.records);
          }

      }).catch(async err=>{
        setState({isPageDataFetched:true})
        await manageError(err, props.location, props.navigate);

      });
  }

  const setProductList=async()=>{

  }


    const fetchProduct=async(productId)=>{
      await getProduct(productId,_cancelToken).then(res=>{
        if(res&&res.status===AppConfigProps.httpStatusCode.ok&&res.data&&res.data.result){
          setState({productRecord:res.data.result});
          setState({isPageDataFetched:true})

        }
      }).catch(async err=>{
        setState({isPageDataFetched:true})
        await manageError(err, props.location, props.navigate);
      })
    }

    const renderProductIcon = (type) => {
        if (
          state?.productRecord?.productIcon &&
          state?.productRecord?.productIcon.length > 0
        ) {
          return (
            <div className={`product-icon-wrapper-${type}`}>
              <div className="product-icon-image">
                <Image
                  src={`data:image/png;base64,${state?.productRecord?.productIcon}`}
                  alt={state?.productRecord?.productName}
                />
              </div>
            </div>
          );
        } else {
          return (
            <div className="product-icon-wrapper product-icon-wrapper-hide"></div>
          );
        }
      };

    const renderProductDescription = () => {
        if (
          state?.productRecord?.productDescription &&
          state?.productRecord?.productDescription.length > 0
        ) {

          return (
            <Row>
              <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                <div className="product-desc-wrapper">
                  <div className="product-desc-title">
                    <Text className="text-bold text-fc-primary text-fs-medium-plus" >
                      {IntlUtil.getText(
                        _intl_ns_oc_product,
                        "content.description"
                      )}
                    </Text>
                  </div>
                  <div className="product-desc-content">
                    {state?.productRecord?.productDescription}
                  </div>
                </div>
              </Col>
            </Row>
          );
        } else return null;
      };
    
      const renderProductInformation = () => {
        if (
          state?.productRecord?.productInformation &&
          state?.productRecord?.productInformation.length > 0
        ) {
          return (
            <Row>
              <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                <div className="product-info-wrapper">
                  <div className="product-info-title">
                    <Text className="text-bold text-fc-primary text-fs-medium-plus">
                      {IntlUtil.getText(
                        _intl_ns_oc_product,
                        "content.marketingDescription"
                      )}
                    </Text>
                  </div>
                  <div className="product-info-content">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: state?.productRecord?.productInformation,
                      }}
                    />
                  </div>
                </div>
              </Col>
            </Row>
          );
        } else return null;
      };
    
      const renderProductCountries = (type) => {
        if (
          state?.productRecord?.availability &&
          state?.productRecord?.availability.length > 0
        ) {
          let displayRecords =[];
                    let displayCountries = [...state?.productRecord?.availability];
          return (
            <div
              className={`product-country-wrapper`}
            >
              <div className="product-country-title">
                <Text className="text-bold text-fc-primary">
                  {IntlUtil.getText(
                    _intl_ns_oc_product,
                    "content.availableCountries"
                  )}
                </Text>
              </div>
              <Row className="product-country-content m-l-0 p-l-0">
                {displayCountries.map((country, index) => {
                  return (
                    <Col xl={12} lg={12} md={12} xs={12} key={`key-product-country-${index}`} className="m-l-0 p-l-0 m-r-0 m-t-10 p-r-0">
                      <span >{country.countryName}</span>
                      {country && country.conditions ? (<TooltipHost content={country.conditions}>
                        {"  "}<span className="cursor-pointer">{"*"}</span>
                      </TooltipHost>) : null}
                    </Col>
                    
                  );
                })}
              </Row>
            </div>
          );
        } else return null;
      };
    
      const renderProductResources = (type) => {
        if (
          state?.productRecord?.resources &&
          state?.productRecord?.resources.length > 0
        ) {
          return (
            <div
              className={`product-resource-wrapper`}
            >
              <div className="product-resource-title p-b-5">
                <Text className="text-bold text-fc-primary p-b-5">
                  {IntlUtil.getText(_intl_ns_oc_product, "content.resources")}
                </Text>
              </div>
              <div className="product-resource-content">
                {state.productRecord?.resources.map((resource, index) => {
                  return resource && resource.title && resource.linkUrl ? (
                    <div key={`key-product-resource-${index}`} className="p-b-5">
                      <a href={resource.linkUrl} rel="noreferrer" target="_blank">
                        <TextDocumentIcon className="m-r-5"/>{resource.title}
                      </a>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          );
        } else return null;
      };
    
      const renderProductLinks = (type) => {
        if (
          state.productRecord?.links &&
          state.productRecord?.links.length > 0
        ) {
          return (
            <div className={`product-link-wrapper product-link-wrapper-${type} p-b-10`}>
              <div className="product-link-title p-b-5">
                <Text className="text-bold text-fc-primary ">
                  {IntlUtil.getText(
                    _intl_ns_oc_product,
                    "content.usefulLinks"
                  )}
                </Text>
              </div>
              <div className="product-link-content">
                {state.productRecord?.links.map((link, index) => {
                  return (
                    <div key={`key-product-link-${index}`} className="m-b-5">
                      <a href={link.url} rel="noreferrer" target="_blank" >
                        <Link12Icon className="m-r-5"/>{link.title}
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        } else return null;
      };
        
      const loadQuoteCreatePage =(product)=>{
        return props.navigate(OperatorConnectURLProps.orderManagement.quoteAdd);
      }

    return (<>
        <div ref={productViewRef}>
          <AppPageTitle pageTitle={IntlUtil.getText(_intl_ns_oc_product,"title.productDetails")}/>
            <div id="oc-page-container">
              {state.productRecord!==null?( <div className="page-main-header-wrapper">
                    <div className="page-main-header-title">
                        {state?.productRecord?.productName}
                        <div className="page-main-header-info">
                      <div className="m-l-20" >{IntlUtil.getText(_intl_ns_oc_product,"content.price")}</div>
                      <div className="m-l-20 text-fc-primary text-fs-large text-fw-semibold">
                        {state?.productRecord
                      &&state?.productRecord.msrpAmount!==null
                      &&state?.productRecord.msrpAmount!==undefined?(<>{state?.productRecord?.currencySymbol}{parseFloat(state?.productRecord?.msrpAmount??"0").toFixed(2)}</>):
                      <TooltipHost content={IntlUtil.getText(_intl_ns_oc_product,"content.support")}><PhoneIcon  className="text-fc-secondary m-t-5" /></TooltipHost>}</div>
                      </div>
                    </div>
                    <div className="page-main-header-actions">
                        <PrimaryButton onClick={()=>loadQuoteCreatePage(state?.productRecord)} className="oc-page-primary-button page-frame-button"><AddToShoppingListIcon className="m-r-5 page-frame-icon"/>{IntlUtil.getText(_intl_ns_oc_product,"content.createQuote")}</PrimaryButton>
                    </div>
                </div>):null}
               
                {state?.isPageDataFetched===true?(
  <div className="page-frame-content">

                  <Grid fluid className="p-0 m-0">
                      <Row>
                      <Col
                        xs={12}
                        sm={12}
                        md={12}
                        lg={12}
                        xl={12}
                        className="m-0 p-0 product-vertical-column"
                      >
                        {renderProductIcon("small")}
                      </Col>

                      </Row>
                  <Row className="p-0 m-0">
                  <Col
                        xs={12}
                        sm={12}
                        md={12}
                        lg={8}
                        xl={9}
                        className="m-0 p-0 m-b-50"
                      >
                        <div className="m-t-10 m-r-20">
                          {renderProductDescription()}
                          {renderProductInformation()}
                        </div>
                      </Col>

                      <Col
                        xs={12}
                        sm={12}
                        md={3}
                        lg={4}
                        xl={3}
                        className="m-0 p-0 product-horizontal-column"
                      >
                        {renderProductIcon("large")}
                      </Col>
                    </Row>
                    <Row className="p-0 m-0 product-content-wrapper">
                      <Col
                        xs={12}
                        sm={12}
                        md={6}
                        lg={8}
                        xl={9}
                        className="p-0 m-b-20 m-r-0"
                      >
                        {renderProductLinks()} 
                      {renderProductResources()}

                      </Col>
                      <Col xl={3} lg={4} md={5} className="p-0 m-0">
                      {renderProductCountries()}

                      </Col>
                    </Row>

                  </Grid>
                  {state.productRecord!==null?                  <PrimaryButton onClick={loadQuoteCreatePage} className="oc-page-primary-button page-frame-button m-t-20"><AddToShoppingListIcon className="m-r-5 page-frame-icon"/>{IntlUtil.getText(_intl_ns_oc_product,"content.createQuote")}</PrimaryButton>
:null}

                </div>):null}
                <PageOverlayLoader hidden={state.isPageDataFetched} label={IntlUtil.getText(_intl_ns_common,"content.loadingInprogress")}/>
            </div>
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

export default connect(mapStateToProps, mapActionToProps)(ProductView);
