import axios from "axios";
import { logMessage } from "../../../core/actions/common-actions";
import { AppConfigProps } from "../../../core/settings/app-config";
import { QUOTE_ESTIMATOR, QUOTE_PROGRESS_PAGE } from "../../../store/constants";

const actionFileName="quote-actions.js"

export function getDocuments(categoryType, categoryName, cancelToken) {
  return new Promise(function (resolve, reject) {
      axios
        .get(
          AppConfigProps.operatorConnectAPIPrefix +
            "/catalog-products/services/documents?categoryType=" +
            categoryType +
            "&categoryName=" +
            categoryName,
          cancelToken
        )
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          if (axios.isCancel(err)) {
            logMessage(
              AppConfigProps.log.severityLevel.warning,
              actionFileName + ">getDocuments()",
              AppConfigProps.httpStatusCode.clientClosedRequest,
              err.message
            );
          } else {
            reject(err.response);
          }
        });
  });
}

export function setQuoteProgressPage(page) {
    return async function (dispatch) {
      try {
        dispatch({
          type: QUOTE_PROGRESS_PAGE,
          payload: page,
        });
      } catch (err) {
        throw Error(err);
      }
    };
  }

  export function setQuoteEstimatorInfoProductRecords(
    quoteEstimatorInfo,
    productRecords
  ) {
    return async function (dispatch) {
      try {
        dispatch({
          type: QUOTE_ESTIMATOR,
          payload: {
            ...quoteEstimatorInfo,
            productRecords: productRecords,
          },
        });
      } catch (err) {
        throw Error(err);
      }
    };
  } 

  export function setQuoteEstimatorInfoQuoteSubscriberDetails(quoteEstimatorInfo,
    subscriberDetails){
    return async function (dispatch) {
      try {
        dispatch({
          type: QUOTE_ESTIMATOR,
          payload: {
            ...quoteEstimatorInfo,
            subscriberDetails: subscriberDetails,
          },
        });
      } catch (err) {
        throw Error(err);
      }
    };

  }

  export function setQuoteEstimatorInfoServiceAndConnectionRecords(
    quoteEstimatorInfo,
    serviceAndConnectionRecords
  ) {
    return async function (dispatch) {
      try {
        dispatch({
          type: QUOTE_ESTIMATOR,
          payload: {
            ...quoteEstimatorInfo,
            serviceAndConnectionRecords: serviceAndConnectionRecords,
          },
        });
      } catch (err) {
        throw Error(err);
      }
    };
  }

  export function setQuoteEstimatorInfoServiceAndConnectionCost(
    quoteEstimatorInfo,
    serviceNrcSubTotalCost,
    serviceMrcSubTotalCost,
    serviceTotalCost
  ) {
    return async function (dispatch) {
      try {
        dispatch({
          type: QUOTE_ESTIMATOR,
          payload: {
            ...quoteEstimatorInfo,
            serviceNrcSubTotalCost: serviceNrcSubTotalCost,
            serviceMrcSubTotalCost: serviceMrcSubTotalCost,
            serviceTotalCost: serviceTotalCost,
          },
        });
      } catch (err) {
        throw Error(err);
      }
    };
  }

  export function getQuoteProductList(productRecords){
let products=[{key:"",text:""}];
if(productRecords&&productRecords.length>0){
productRecords.forEach(product=>{
products.push({key:product.productId,text:product.productName});
})
}
return products;
  }

  export function setQuoteEstimatorInfoServiceDocumentRecords(
    quoteEstimatorInfo,
    serviceDocumentRecords
  ) {
    return async function (dispatch) {
      try {
        dispatch({
          type: QUOTE_ESTIMATOR,
          payload: {
            ...quoteEstimatorInfo,
            serviceDocumentRecords: serviceDocumentRecords,
          },
        });
      } catch (err) {
        throw Error(err);
      }
    };
  }
  export function setQuoteEstimatorInfoGeneralDocumentRecords(
    quoteEstimatorInfo,
    generalDocumentRecords
  ) {
    return async function (dispatch) {
      try {
        dispatch({
          type: QUOTE_ESTIMATOR,
          payload: {
            ...quoteEstimatorInfo,
            generalDocumentRecords: generalDocumentRecords,
          },
        });
      } catch (err) {
        throw Error(err);
      }
    };
  }

  export function resetQuoteEstimatorInfo(quoteEstimatorInfo) {
    return async function (dispatch) {
      try {
        dispatch({
          type: QUOTE_ESTIMATOR,
          payload: {
            ...quoteEstimatorInfo,
            serviceNrcSubTotalCost: null,
            serviceMrcSubTotalCost: null,
            serviceTotalCost: null,
            serviceDocumentRecords: [],
            generalDocumentRecords: [],
            onboardServiceDocumentRecords: [],
            communicationPlatformDocumentRecords: [],
            productRecords: [],
            serviceAndConnectionRecords: [],
          },
        });
      } catch (err) {
        throw Error(err);
      }
    };
  }

  

  export function setQuoteEstimatorInfoSubscriberQuoteRecords(
    quoteEstimatorInfo,
    subscriberQuoteRecords
  ) {
    return async function (dispatch) {
      try {
        dispatch({
          type: QUOTE_ESTIMATOR,
          payload: {
            ...quoteEstimatorInfo,
            subscriberQuoteRecords: subscriberQuoteRecords,
          },
        });
      } catch (err) {
        throw Error(err);
      }
    };
  }
  
  export function setQuoteEstimatorInfoOnboardServiceDocumentRecords(
    quoteEstimatorInfo,
    onboardServiceDocumentRecords
  ) {
    return async function (dispatch) {
      try {
        dispatch({
          type: QUOTE_ESTIMATOR,
          payload: {
            ...quoteEstimatorInfo,
            onboardServiceDocumentRecords: onboardServiceDocumentRecords,
          },
        });
      } catch (err) {
        throw Error(err);
      }
    };
  }
  export function setQuoteEstimatorInfoCommunicationPlatformDocumentRecords(
    quoteEstimatorInfo,
    communicationPlatformDocumentRecords
  ) {
    return async function (dispatch) {
      try {
        dispatch({
          type: QUOTE_ESTIMATOR,
          payload: {
            ...quoteEstimatorInfo,
            communicationPlatformDocumentRecords:
              communicationPlatformDocumentRecords,
          },
        });
      } catch (err) {
        throw Error(err);
      }
    };
  }
  
  export function getProductsAvailable(country, cancelToken) {
    return new Promise(function (resolve, reject) {
        axios
          .get(
            AppConfigProps.operatorConnectAPIPrefix +
              "/catalog-products/services/available?country=" +
              country,
            cancelToken
          )
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            if (axios.isCancel(err)) {
              logMessage(
                AppConfigProps.log.severityLevel.warning,
                actionFileName + ">getProductsAvailable()",
                AppConfigProps.httpStatusCode.clientClosedRequest,
                err.message
              );
            } else {
              reject(err.response);
            }
          });
    });
  }

  export function saveQuote(products, cancelToken) {
    return new Promise(function (resolve, reject) {
        axios
          .post(
            AppConfigProps.operatorConnectAPIPrefix +
              "/product-quotes",
              products,
            cancelToken
          )
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            if (axios.isCancel(err)) {
              logMessage(
                AppConfigProps.log.severityLevel.warning,
                actionFileName + ">saveQuote()",
                AppConfigProps.httpStatusCode.clientClosedRequest,
                err.message
              );
            } else {
              reject(err.response);
            }
          });
    });
  }

  export function addSubscriber(quoteId,subscriberDetails, cancelToken) {
    return new Promise(function (resolve, reject) {
        axios
          .post(
            AppConfigProps.operatorConnectAPIPrefix +
              "/product-quotes/"+quoteId+"/subscribers",
              subscriberDetails,
            cancelToken
          )
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            if (axios.isCancel(err)) {
              logMessage(
                AppConfigProps.log.severityLevel.warning,
                actionFileName + ">saveQuote()",
                AppConfigProps.httpStatusCode.clientClosedRequest,
                err.message
              );
            } else {
              reject(err.response);
            }
          });
    });
  }

  export function savePayment(quoteId,paymentDetails, cancelToken) {
    return new Promise(function (resolve, reject) {
        axios
          .post(
            AppConfigProps.operatorConnectAPIPrefix +
              "/product-quotes/"+quoteId+"/payments",
              paymentDetails,
            cancelToken
          )
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            if (axios.isCancel(err)) {
              logMessage(
                AppConfigProps.log.severityLevel.warning,
                actionFileName + ">saveQuote()",
                AppConfigProps.httpStatusCode.clientClosedRequest,
                err.message
              );
            } else {
              reject(err.response);
            }
          });
    });
  }

  export function getQuotesOrdersSearch(keyword, cancelToken) {
    return new Promise(function (resolve, reject) {
      axios
        .get(
          AppConfigProps.operatorConnectAPIPrefix +
            `/product-quotes?keyword=${keyword}`,
          cancelToken
        )
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          if (axios.isCancel(err)) {
            logMessage(
              AppConfigProps.log.severityLevel.warning,
              actionFileName + ">getQuotesOrdersSearch()",
              AppConfigProps.httpStatusCode.clientClosedRequest,
              err.message
            );
          } else {
            reject(err.response);
          }
        });
    });
  }

  export function getQuote(quoteId, cancelToken) {
    return new Promise(function (resolve, reject) {
      axios
        .get(
          AppConfigProps.operatorConnectAPIPrefix +
            `/product-quotes/${quoteId}`,
          cancelToken
        )
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          if (axios.isCancel(err)) {
            logMessage(
              AppConfigProps.log.severityLevel.warning,
              actionFileName + ">getQuote()",
              AppConfigProps.httpStatusCode.clientClosedRequest,
              err.message
            );
          } else {
            reject(err.response);
          }
        });
    });
  }

  
  
  
  
  