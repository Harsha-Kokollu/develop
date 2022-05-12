/**
Project: Operator Connect (c)
Title: Main Route  
Description: Component for hadling the routes of the application
Copyrights: This file is subject to the terms and conditions defined in file 'LICENSE.txt', which is part of this source code package.
*/
import React, { useEffect } from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import FullLayout from "../layout/full-layout";
import { HelmetProvider } from "react-helmet-async";
import { createTheme, initializeIcons, loadTheme } from "@fluentui/react";
import RequestUtil from "../core/helpers/request-util";
import withAITracking from "../core/settings/app-insights";



const MainRoute = (props) => {
    const appTheme = createTheme({
        palette: {
            themePrimary: '#0075c9',
            themeLighterAlt: '#f3f9fd',
            themeLighter: '#cfe6f6',
            themeLight: '#a7d1ef',
            themeTertiary: '#59a7df',
            themeSecondary: '#1984d0',
            themeDarkAlt: '#006ab5',
            themeDark: '#005999',
            themeDarker: '#004271',
            neutralLighterAlt: '#F5F5F5',
            neutralLighter: '#f5f5f5',
            neutralLight: '#F5F5F5',
            neutralQuaternaryAlt: '#ADADAD',
            neutralQuaternary: '#d0d0d0',
            neutralTertiaryAlt: '#c8c6c4',
            neutralTertiary: '#c2c2c2',
            neutralSecondary: '#858585',
            neutralPrimaryAlt: '#4b4b4b',
            neutralPrimary: '#333333',
            neutralDark: '#272727',
            black: '#1d1d1d',
            white: '#ffffff',
        }, semanticColors: {
            buttonBorder: "#0075c9",
            buttonText: "#0075c9",
            buttonBackgroundHovered: "#ebf1ff",
            bodySubtext: "#E77528",
            buttonBackgroundDisabled: "#f9f9fa",
            buttonTextDisabled: "#858585",
            primaryButtonTextDisabled: "#858585",
            primaryButtonBackgroundDisabled: "#f9f9fa",


        }
    });
    loadTheme(appTheme);
    initializeIcons();
    RequestUtil.setRequestHeaders();
    return (
        <BrowserRouter basename="/">
            <HelmetProvider>
                <Routes>
                     {/* <Route path="/error" element={<BlankLayout/>} />
              <Route path="/404" element={<BlankLayout/>} />
              <Route path="/session-expired" component={<BlankLayout/>} /> */}
                    <Route path="*" element={<FullLayout {...props} />} />
                </Routes>
            </HelmetProvider>
        </BrowserRouter>
    );
}

export default withAITracking(MainRoute);
