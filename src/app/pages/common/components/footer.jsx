import { Image } from "@fluentui/react";
import React, {Component} from "react";
import LumenLogoFooter from "../../../../assets/images/Lumen-logo-footer.png";
import IntlUtil from "../../../core/helpers/intl-util";

const _intl_ns_oc_common="oc_common";

const Footer =()=>{
    const handleFooterLogoClick=()=>{
        window.open("https://lumen.com","_blank")
    }
        return(<>
        <div id="oc-footer-wrapper">
            <div className="oc-footer-content-wrapper">
                <div className="oc-footer-content-image-wrapper">
                <Image src={LumenLogoFooter} className="cursor-pointer" onClick={handleFooterLogoClick}/>
                </div>
                <div className="oc-footer-content-text">
                    <span>{IntlUtil.getText(_intl_ns_oc_common,"content.footer.copyRight")}</span>
                </div>
            </div>
        </div>
        </>)
    

}

export default Footer;