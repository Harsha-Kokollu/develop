/**
Project: Operator Connect (c)
Title: Pricate Route  
Description: Component for hadling the routes of the application which are secure 
Copyrights: This file is subject to the terms and conditions defined in file 'LICENSE.txt', which is part of this source code package.
*/
import React from "react";
import { Route } from "react-router-dom";
export const PrivateRoute = ({ component: Component, ...rest }) => {
  //access log 
  return (
    < Route
      {...rest}
      element={<Component/>}
    />)
}

export default PrivateRoute;
