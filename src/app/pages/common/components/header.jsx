import React, { useState } from "react";
import {
  Image,
  Dropdown,
  DefaultButton,
  Callout,
  FontIcon,
  IconButton,
  Text,
} from "@fluentui/react";
import LumenLogo from "../../../../assets/images/Lumen-logo.png";
import IntlUtil from "../../../core/helpers/intl-util";
import Welcome from "./welcome";
import i18n from "../../../../i18n";
import ReactCountryFlag from "react-country-flag";
import { useId } from "@fluentui/react-hooks";
import { Grid, Row, Col } from "react-flexbox-grid";
import { OperatorConnectConstants } from "../settings/operator-connect-constants";

const Header = (props) => {
  let _oc_common = "oc_common";
  const [langvalue, changeLang] = useState(localStorage.getItem("i18nextLng"));
  const [isCountryCalloutVisible, setIsCountryCalloutVisible] = useState(false);
  const [countryCode,setCountryCode]=useState("US");
  const countryButtonId = useId("country-callout-button");

  const handleDisplayCountries = () => {
    if (isCountryCalloutVisible) {
      setIsCountryCalloutVisible(false);
    } else {
      setIsCountryCalloutVisible(true);
    }
  };




  const renderCountryIcon = () => {
    return (
      <div className="country-icon-align">
        <div className="country-img">
          <ReactCountryFlag countryCode={countryCode} svg cdnSuffix="svg" title="US" />
        </div>
        <div className="country-img-chevron">
          <FontIcon
            aria-label="Compass"
            iconName={isCountryCalloutVisible ? "ChevronUp" : "ChevronDown"}
            className="country-icon-chevron"
          />
        </div>
      </div>
    );
  };
  const handleCountryCalloutVisible = () => {
    setIsCountryCalloutVisible(false);
  };

  return (
    <>
      <header id="oc-header-wrapper">
        <div className="oc-header">
          <div className="oc-header-brand-logo-wrapper">
            <Image
              onClick={() => props.navigate("/")}
              className="oc-header-brand-logo cursor-pointer"
              src={LumenLogo}
            />
          </div>
          <div className="oc-header-lang-wraper-align">

            <div className="oc-header-country-wraper">
              <DefaultButton
                id={countryButtonId}
                className="oc-country-btn"
                onClick={handleDisplayCountries}
                onRenderIcon={renderCountryIcon}
              />
              {isCountryCalloutVisible && (
                <Callout
                  gapSpace={0}
                  target={`#${countryButtonId}`}
                  onDismiss={handleCountryCalloutVisible}
                  setInitialFocus
                  className="oc-country-info p-r-30"
                >
                  <div className="quote-page-callout-wrapper p-10">
                  {OperatorConnectConstants.LANGUAGE_DATA.map(data=>{
                           return(<>
         <div className="oc-country-wraper-align cursor-pointer" onClick={()=>{
                          i18n.changeLanguage(data.key)
                          setCountryCode(data.countryCode)
                          setIsCountryCalloutVisible(false)}}>
                      <ReactCountryFlag
                        countryCode={data.countryCode}
                        className="country-icon-size p-5"
                        svg
                        aria-label={data.language}
                        
                      />

                      <Text className="align-country-text-info p-5 " block >
                      {data.language}
                      </Text>
                    </div>

                           </>) 
                        })}
                  </div>
                </Callout>
              )}
            </div>
          </div>
        </div>
        <Welcome />
      </header>
    </>
  );
};

export default Header;
