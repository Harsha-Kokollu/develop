/**
Project: Voice Panel (c)
Title: Page Exit Guard
Description: Component for displaying the dialog box for unsaved data
Copyrights: This file is subject to the terms and conditions defined in file 'LICENSE.txt', which is part of this source code package.
*/
import React, { useEffect, useState, memo } from "react";
import { useLocation,useNavigate,use } from "react-router-dom";
import {
    Text, Dialog,
    DialogType,
    DialogFooter,
    PrimaryButton, DefaultButton
} from "@fluentui/react";
import IntlUtil from "../../../core/helpers/intl-util";

const PageExitGuard = ({ when, title, navigate, shouldBlockNavigation }) => {
    const _intl_ns_oc_common = "oc_common";
    const [dialogHidden, setDialogStatus] = useState(when||true);
    const [lastLocation, setLastLocation] = useState(null);
    const [confirmedNavigation, setConfirmedNavigation] = useState(false);
    const history = useNavigate();
    const location = useLocation();

    const closeModal = () => {
        setDialogStatus(true);
    };
    const handleBlockedNavigation = (nextLocation) => {
        if (!confirmedNavigation && shouldBlockNavigation(nextLocation)) {
            setDialogStatus(false);
            setLastLocation(nextLocation);
            return false;
        }
        return true;
    };
    const handleConfirmNavigationClick = () => {
        setDialogStatus(false);
        setConfirmedNavigation(true);
        if (location.pathname === lastLocation.pathname) {
            window.location.reload();
        }
    };
    useEffect(() => {
        handleBlockedNavigation(location.pathname);
        if (confirmedNavigation && lastLocation) {
            // Navigate to the previous blocked location with your navigate function
            navigate(lastLocation.pathname);
        }
    }, [confirmedNavigation, lastLocation]);
    return (
        <>
        {/* <prompt >{}</prompt> */}
            {/* Your own alert/dialog/modal component */}
            <Dialog
                hidden={dialogHidden}
                dialogContentProps={{
                    type: DialogType.normal,
                    showCloseButton: false,
                    title: title,
                    subText: (
                        <>
                            <Text>
                                {IntlUtil.getText(
                                    _intl_ns_oc_common,
                                    "notification.warning.promptUnsavedPageExit"
                                )}
                            </Text>
                        </>
                    ),
                }}
            >
                <DialogFooter>
                    <PrimaryButton onClick={handleConfirmNavigationClick}>
                        {IntlUtil.getText(_intl_ns_oc_common, "content.yes")}
                    </PrimaryButton>
                    <DefaultButton
                        onClick={closeModal}
                    >
                        {IntlUtil.getText(_intl_ns_oc_common, "content.no")}
                    </DefaultButton>
                </DialogFooter>
            </Dialog>
        </>
    );
};
export default memo(PageExitGuard);
