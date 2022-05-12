import { COUNTRY_STATES_DATA } from "../constants";

const INIT_STATE = {
  countryStatesData: [],
};

const generalReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case COUNTRY_STATES_DATA:
      return {
        ...state,
        countryStatesData: action.payload,
      };
    default:
      return state;
  }
};

export default generalReducer;
