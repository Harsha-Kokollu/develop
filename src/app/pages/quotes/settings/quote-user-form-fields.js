import IntlUtil from "../../../core/helpers/intl-util";

export const QuoteUserFormFields = (intlNamespace, refCollection) => {
  return {
    quoteName: {
      value: "",
      isRequired: true,
      validate: (val) => {
        if (val && val.trim().length > 0) return true;
        else return false;
      },
      refObject: refCollection["quoteName"],
      isError: false,
      errorMessage: "notification.error.quoteNameRequired",
    },
    email: {
      value: "",
      isRequired: true,
      validate: (val) => {
        const reg =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return reg.test(String(val).toLowerCase());
      },
      refObject: refCollection["email"],
      isError: false,
      errorMessage: "notification.error.emailRequired",
    },
    phone: {
      value: "",
      isRequired: true,
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
      refObject: refCollection["phone"],
      isError: false,
      errorMessage: "notification.error.phoneNumberNotValid",
    },
    country: {
      value: "",
      isRequired: false,
      validate: (val) => {
        if (val && val.trim().length > 0) return true;
        else return false;
      },
      refObject: refCollection["country"],
      isError: false,
      errorMessage: "notification.error.countryRequired",
    },
  };
};

export const QuotePOFormFields = (refCollection) => {
  return {
    companyPO: {
      value: "",
      isRequired: true,
      validate: (val) => {
        if (val && val.trim().length > 0) return true;
        else return false;
      },
      refObject: refCollection["comapnyPO"],
      isError: false,
      errorMessage: "notification.error.companyPORequired",
    },
    quoteName: {
      value: "",
      isRequired: true,
      validate: (val) => {
        if (val && val.trim().length > 0) return true;
        else return false;
      },
      refObject: refCollection["quoteName"],
      isError: false,
      errorMessage: "notification.error.quoteNameRequired",
    },
    email: {
      value: "",
      isRequired: true,
      validate: (val) => {
        const reg =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return reg.test(String(val).toLowerCase());
      },
      refObject: refCollection["email"],
      isError: false,
      errorMessage: "notification.error.emailRequired",
    },
    phone: {
      value: "",
      isRequired: true,
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
      refObject: refCollection["phone"],
      isError: false,
      errorMessage: "notification.error.phoneNumberNotValid",
    },
  }
};

