import './App.css';
import React, { Component } from "react";
import { Provider } from "react-redux";
import MainRoute from "./app/routes/main-route"
import { configureStore } from './app/store/store';
import { initializeIcons } from "@fluentui/react";
import ErrorBoundary from './app/core/views/error-boundary';

class App extends Component {
  render() {
    initializeIcons();
    return (
      <ErrorBoundary>
      <Provider store={configureStore()}>
        <MainRoute />
      </Provider>
      </ErrorBoundary>
    )
  }
}

export default App;
