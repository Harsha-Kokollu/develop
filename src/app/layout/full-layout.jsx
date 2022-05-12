import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { connect } from "react-redux";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Footer from "../../app/pages/common/components/footer";
import Header from "../../app/pages/common/components/header";
import {
  authenticateToken,
  checkIdentitySession,
} from "../core/actions/identity-actions";
import { AppPageTitle } from "../core/components/app-page-title";
import IntlUtil from "../core/helpers/intl-util";
import RequestUtil from "../core/helpers/request-util";
import TokenUtil from "../core/helpers/token-util";
import { AppConfigProps } from "../core/settings/app-config";
import { getCountryStates } from "../pages/common/actions/common-actions";
import { setCountryStatesData } from "../pages/common/actions/general-actions";
import PageOverlayLoader from "../pages/common/helpers/page-overlay-loader";
import OperatorConnectRoutes from "../routes/operator-connect-routes";
import { withTranslation } from "react-i18next";
import { manageError } from "../core/actions/common-actions";
import ErrorPage from "../core/views/error-page";
import ErrorPageNotFound from "../core/views/error-page-not-found";

const FullLayout = (props) => {
  const [isAppDataFetched, setAppDataFetched] = useState(false);
  const _intl_ns_common = "oc_common";
  const _axiosSource = axios.CancelToken.source();
  const _cancelToken = { cancelToken: _axiosSource.token };
  const navigate = useNavigate();
  const location = useLocation();
  let isSessionValid = checkIdentitySession();
  let tokenData = TokenUtil.getIdentitySippioAccessTokenData();
  let _isMounted = true;
  const [isLoading, setLoadingStatus] = useState(true);

  useEffect(() => {
    const getData = async () => {
      setAppDataFetched(false);
      if (isSessionValid === false) {
        await fetchToken();
      }
      await checkTokenAuthentication();
      await fetchCountries();
      setAppDataFetched(true);
      setLoadingStatus(false);
    };
    if (_isMounted) {
      getData();
    }
    return async () => {
      _isMounted = false;
      await cleanUp();
    };
  }, [location.pathname]);

  const cleanUp = async () => {
    _axiosSource.cancel(
      IntlUtil.getText(_intl_ns_common, "notification.warning.requestCancelled")
    );
  };

  const fetchToken = async () => {
    await authenticateToken(_cancelToken)
      .then(async (res) => {
        if (res && res.data && res.data.result) {
          TokenUtil.setIdentityToken(res.data.result.accessToken);
          RequestUtil.setRequestHeaders();
          setAppDataFetched(true);
        }
      })
      .catch(async (err) => {
        setAppDataFetched(true);
        await manageError(err, location, navigate);
      });
  };

  const checkTokenAuthentication = async () => {
    if (isSessionValid === true) {
      if (
        tokenData.expiry - parseInt(Date.now() / 1000) <=
        AppConfigProps.identitySession.expiryCheckRemainingSeconds
      ) {
        await fetchToken();
      }
    }
  };

  const fetchCountries = async () => {
    if (
      props.countryStatesData === null ||
      props.countryStatesData.length === 0
    ) {
      await getCountryStates(_cancelToken)
        .then(async (res) => {
          if (
            res &&
            res.status === AppConfigProps.httpStatusCode.ok &&
            res.data &&
            res.data.records
          ) {
            await props.setCountryStatesData(res.data.records);
          }
        })
        .catch(async (err) => {
          await manageError(err, location, navigate);
        });
    }
  };

  return (
    <>
      <div id="oc-layout-wrapper">
        <AppPageTitle pageTitle={""} />
        {isLoading === false ? (
          <>
            <Header navigate={navigate} />
            <Routes>
              {OperatorConnectRoutes && OperatorConnectRoutes.length > 0 ? (
                <>
                  {OperatorConnectRoutes.map((route, index) => {
                    return (
                      <Route
                        key={`router-key-${index}`}
                        path={route.url}
                        element={
                          <route.component
                            {...props}
                            navigate={navigate}
                            location={location}
                          />
                        }
                      />
                    );
                  })}
                </>
              ) : null}
              <Route
                path="/error"
                element={
                  <ErrorPage
                    navigate={navigate}
                    {...props}
                    location={location}
                  />
                }
              />
              <Route
                path="/page-not-found"
                element={
                  <ErrorPageNotFound
                    navigate={navigate}
                    {...props}
                    location={location}
                  />
                }
              />
              <Route
                path="*"
                element={<Navigate to="/page-not-found" replace />}
              />
            </Routes>
            <Footer />
          </>
        ) : null}
      </div>
      <PageOverlayLoader
        hidden={isAppDataFetched}
        label={IntlUtil.getText(_intl_ns_common, "content.loadingInprogress")}
      />
    </>
  );
};
const mapStateToProps = (state) => ({
  countryStatesData: state.generalStore.countryStatesData,
});
const mapActionToProps = {
  setCountryStatesData,
};

export default withTranslation()(
  connect(mapStateToProps, mapActionToProps)(FullLayout)
);
