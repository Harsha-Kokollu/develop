import { SearchBox } from "@fluentui/react";
import IntlUtil from "../../../core/helpers/intl-util";
import React, { useState, useEffect } from "react";
import { OperatorConnectURLProps } from "../settings/operator-connect-urls";
import { useNavigate, generatePath, useSearchParams } from "react-router-dom";

const useNavigateQueryStringParams = () => {
  const navigate = useNavigate();
  return (url, params) => {
    const path = generatePath(":url?:queryString", {
      url,
      queryString: params,
    });
    navigate(path);
  };
};
// welcome
const Welcome = (props) => {
  let _oc_common = "oc_common";
  const navigate = useNavigateQueryStringParams();
  let [searchParams] = useSearchParams();
  let searchkeyword = searchParams.get("search");
  let [searchValue, setSearch] = useState(searchkeyword);

  useEffect(() => {
    if (
      searchkeyword === null ||
      searchkeyword === "" ||
      searchkeyword === undefined
    ) {
      setSearch("");
    }
  }, []);

  const setquoteSearch = (e) => {
    if (e && e.target) {
      setSearch(e.target.value);
    }
  };

  const handleSearchSubmit = () => {
    navigate(
      OperatorConnectURLProps.orderManagement.quoteOrders,
      `search=${searchValue?.trim()}`
    );
  };

  const handleSearchCancel = () => {
    setSearch("");
  };
  return (
    <>
      <div className="oc-welcome-content">
        <span className="oc-welcome-title">
          {IntlUtil.getText(_oc_common, "content.welcomeText")}
        </span>
        <div className="oc-welcome-actions">
          <span className="m-r-20">
            {IntlUtil.getText(_oc_common, "content.Retrieve")}
          </span>
          <SearchBox
            id="quoteKeyword"
            name="quoteKeyword"
            value={searchValue}
            onChange={setquoteSearch}
            placeholder={IntlUtil.getText(
              _oc_common,
              "content.referenceNumber"
            )}
            disableAnimation={false}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearchSubmit();
              }
            }}
            onClear={() => handleSearchCancel()}
          />
        </div>
      </div>
    </>
  );
};

export default Welcome;
