import IntlUtil from "../../../core/helpers/intl-util";

export const ConfigProductFormFields = (intlNamespace, refCollection) => {
  return {
    service: {
      value: "",
      isRequired: true,
      validate: (val) => {
        if (val && val.trim().length > 0) return true;
        else return false;
      },
      refObject: refCollection["service"],
      isError: false,
      errorMessage:"notification.error.serviceRequired",
    },
    connection: {
      value: "",
      isRequired: true,
      validate: (val) => {
        if (val && val.trim().length > 0) return true;
        else return false;
      },
      refObject: refCollection["connection"],
      isError: false,
      errorMessage: 
        "notification.error.emailNotValid",
    },
    communicationPlatform: {
      value: "",
      isRequired: true,
      validate: (val) => {
        if (val && val !== "") return true;
        else return false;
      },
      isError: false,
      refObject: refCollection["communicationPlatform"],
      errorMessage: 
        "notification.error.communicationPlatformRequired",
    },
    quantity: {
      value: "",
      isRequired: true,
      validate: (val) => {
        if (val && val.trim().length > 0) return true;
        else return false;
      },
      isError: false,
      refObject: refCollection["quantity"],
      errorMessage: 
        "notification.error.quantityRequired",
    },
  }  
};