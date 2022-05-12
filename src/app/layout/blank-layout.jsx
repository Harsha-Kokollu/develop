
import React, { Component } from "react";
import { Navigate, Route, Routes, Switch } from "react-router-dom";
import FullLayout from "./full-layout";
import PageNotFound from "../core/views/error-page-not-found";
import ErrorPage from "../core/views/error-page";
import SessionExpired from "../core/views/error-session-expired";
import Error404 from "../core/views/error-404";
import ErrorPageNotFound from "../core/views/error-page-not-found";


class BlankLayout extends Component {
    render() {
      return (
        <Routes>
          <Route path="/"  element={<FullLayout/>} />          <Route path="/page-not-found" element={<ErrorPageNotFound/>} />
          <Route path="*" element={<Navigate replace to="/page-not-found" />} />

        </Routes>
      );
    }
  }
  
  export default BlankLayout;
  