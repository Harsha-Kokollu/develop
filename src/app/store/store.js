/**
Project: Operator Connect (c)
Title: Store
Description: Redux store for maintaining the state
Copyrights: This file is subject to the terms and conditions defined in file 'LICENSE.txt', which is part of this source code package.
*/
import { createStore, applyMiddleware } from "redux";
import { createLogger } from "redux-logger";
import thunk from "redux-thunk";
import reducers from "./reducers";

const logger = createLogger();

export function configureStore(initialState) {
  const middlewares = [logger, thunk];
  //const middlewares = [thunk];
  const store = createStore(
    reducers,
    initialState,
    applyMiddleware(...middlewares)
  );

  return store;
}
