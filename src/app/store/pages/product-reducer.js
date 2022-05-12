import { PRODUCT_LIST } from "../constants";

const INIT_STATE = {
  productRecords: [],
  isProductRecordsDataFetched: false,
  productRecordsDataFetchTimestamp: null,

};

const productReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case PRODUCT_LIST:
      return {
        ...state,
        isProductRecordsDataFetched:true,
        productRecordsDataFetchTimestamp:new Date(),
        productRecords: action.payload,
      };
    default:
      return state;
  }
};

export default productReducer;
