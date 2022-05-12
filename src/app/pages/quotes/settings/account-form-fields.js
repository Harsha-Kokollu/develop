/**
Project: Operator Connect (c)
Title: Customer Add Form Fields  
Description: Fields used in Customer Add form with validation settings
Copyrights: This file is subject to the terms and conditions defined in file 'LICENSE.txt', which is part of this source code package.
*/
import IntlUtil from "../../../core/helpers/intl-util";

export const CreateAccountFormFields = (intlNamespace, refCollection) => {
  return {
    businessName: {
      value: "",
      isRequired: true,
      validate: (val) => {
        if (val && val.trim().length > 0) return true;
        else return false;
      },
      isError: false,
      refObject: refCollection["businessName"],
      errorMessage:"notification.error.businessNameRequired",
    },
    billingAccountNumber: {
      value: "",
      isRequired: true,
      validate: (val) => {
        if (val && val.trim().length > 0) return true;
        else return false;
      },
      isError: false,
      refObject: refCollection["billingAccountNumber"],
      errorMessage:"notification.error.billingAccountNumberRequired",
    },
    customerDomains: {
      value: "",
      isRequired: true,
      validate: (val) => {
        if (val && val.trim().length > 0) return true;
        else return false;
      },
      isError: false,
      refObject: refCollection["customerDomains"],
      errorMessage:"notification.error.customerDomainsRequired",
    },
    addLine1: {
      value: "",
      isRequired: true,
      validate: (val) => {
        if (val && val.trim().length > 0) return true;
        else return false;
      },
      isError: false,
      refObject: refCollection["addLine1"],
      errorMessage:"notification.error.StreetAddress1Required",
    },
    addLine2: {
      value: "",
    },
    city: {
      value: "",
      isRequired: true,
      refObject: refCollection["city"],
      validate: (val) => {
        if (val && val.trim().length > 0) return true;
        else return false;
      },
      isError: false,
      errorMessage: 
        "notification.error.CityRequired",
    },
    state: {
      value: "",
      isRequired: true,
      refObject: refCollection["state"],
      validate: (val) => {
        if (val && val.trim().length > 0) return true;
        else return false;
      },
      isError: false,
      errorMessage: 
        "notification.error.StateRequired",
    },
    country: {
      value: "",
      isRequired: true,
      refObject: refCollection["country"],
      validate: (val) => {
        if (val && val.trim().length > 0) return true;
        else return false;
      },
      isError: false,
      errorMessage:"notification.error.countryRequired",
    },
    postalCode: {
      value: "",
      isRequired: true,
      refObject: refCollection["postalCode"],
      validate: (val) => {
        if (val && val.trim().length > 0) return true;
        else return false;
      },
      isError: false,
      errorMessage:"notification.error.postalCodeRequired"
      ,
    },
    firstName: {
      value: "",
      isRequired: true,
      refObject: refCollection["firstName"],
      validate: (val) => {
        if (val && val.trim().length > 0) return true;
        else return false;
      },
      isError: false,
      errorMessage: "notification.error.firstNameRequired",
    },
    lastName: {
      value: "",
      isRequired: true,
      refObject: refCollection["lastName"],
      validate: (val) => {
        if (val && val.trim().length > 0) return true;
        else return false;
      },
      isError: false,
      errorMessage: "notification.error.lastNameRequired",
    },
    email: {
      value: "",
      isRequired: true,
      refObject: refCollection["email"],
      validate: (val) => {
        //const reg = /^[a-z0-9]+[._]?[a-z0-9]+[@]\w+[.]\w{2,3}$/;
        const reg =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return reg.test(String(val).toLowerCase());
      },
      isError: false,
      errorMessage: 
        "notification.error.emailNotValid",
    },
    phone: {
      value: "",
      isRequired: true,
      refObject: refCollection["phone"],
      validate: (val) => {
        if (val && val.trim().length > 0) {
          let regex = new RegExp("^[0-9]+$");
          let isValid = regex.test(val);
          if(isValid===true){
            return true;
          }else{
            return false;
          }
        }
      },
            isError: false,
      errorMessage: 
        "notification.error.phoneNumberNotValid",
    },
  };
};
