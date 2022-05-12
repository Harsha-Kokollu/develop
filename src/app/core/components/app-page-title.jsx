import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageUtil from "../helpers/page-util";

const AppPageTitle = ({ pageTitle }) => {
    return (
        <Helmet>
            <title>{PageUtil.getHeadTitle(pageTitle)}</title>
        </Helmet>
    );
};

export { AppPageTitle };