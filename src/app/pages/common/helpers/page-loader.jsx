/**
Project: Operator Connect (c)
Title: Page Loader
Description: Component for displaying page loading spinner
Copyrights: This file is subject to the terms and conditions defined in file 'LICENSE.txt', which is part of this source code package.
*/
import React, { Component } from "react";
import { Spinner, SpinnerSize } from "@fluentui/react";

const PageLoader =(props)=>  {
    if (props.status) {
      // data load status is true
      return props.children;
    } else {
      // data load status is false
      let size = "medium";
      let spinnerSize = SpinnerSize.medium;
      if (props.size) {
        size = props.size;
        switch (size) {
          case "tiny":
            spinnerSize = SpinnerSize.xSmall;
            break;
          case "small":
            spinnerSize = SpinnerSize.small;
            break;
          case "medium":
            spinnerSize = SpinnerSize.medium;
            break;
          case "large":
            spinnerSize = SpinnerSize.large;
            break;
          default:
            spinnerSize = SpinnerSize.medium;
            break;
        }
      }
      let label = null;
      if (props.label) {
        label = props.label;
      }
      let labelPosition = null;
      if (props.label) {
        labelPosition = props.labelPosition; // top, bottom, left, right
      }
      let type = "inline";
      if (props.type) {
        type = props.type;
      }
      let typeClassName = "";
      if (type === "inline") {
        typeClassName = "page-loader-wrapper-inline";
      } else if (type === "full") {
        typeClassName = "page-loader-wrapper-full";
      } else if (type === "center") {
        typeClassName = "page-loader-wrapper-center";
      } else if (type === "frame") {
        typeClassName = "page-loader-wrapper-frame";
      } else if (type === "middle") {
        typeClassName = "page-loader-wrapper-middle";
      }

      return (
        <div className={typeClassName}>
          <div className="page-loader-spinner-box">
            <Spinner
              size={spinnerSize}
              label={label}
              labelPosition={labelPosition}
              ariaLive="assertive"
              className={`page-loader-spinner-${size}`}
            />
          </div>
        </div>
      );
    }
}

export default PageLoader;
