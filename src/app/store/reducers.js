import { combineReducers } from "redux";
import appReducer from "./app-reducer";
import generalReducer from "./pages/general-reducer";
import productReducer from "./pages/product-reducer";
import quoteReducer from "./pages/quote-reducer";



const reducers = combineReducers({
    appSettings: appReducer,
    quoteStore:quoteReducer,
    productStore:productReducer,
    generalStore:generalReducer
  });
  
  export default reducers;
  