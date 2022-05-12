import { QUOTE_PROGRESS_PAGE, QUOTE_ESTIMATOR } from "../constants";

const INIT_STATE = {
  quoteProgressPage: 0,
  quoteEstimatorInfo: null,
};

const quoteReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case QUOTE_PROGRESS_PAGE:
      return {
        ...state,
        quoteProgressPage: action.payload,
      };
    case QUOTE_ESTIMATOR:
      return {
        ...state,
        quoteEstimatorInfo: action.payload,
      };

    default:
      return state;
  }
};

export default quoteReducer;
