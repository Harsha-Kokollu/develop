import IntlUtil from "../../../core/helpers/intl-util";

const _oc_common="oc_common"

export const OperatorConnectConstants={
  SEARCH_TYPE: {
    BEGIN_WITH: "BeginWith",
    CONTAINS: "Contains",
  },
  PARTNER_SUPPORT_COUNTRIES:["AR","PE"],
  LANGUAGE_DATA:[{key:"en",countryCode:"US",language:IntlUtil.getText(_oc_common,"languageCode.en")},
  {key:"es",countryCode:"AR",language:IntlUtil.getText(_oc_common,"languageCode.es")},
  {key:"es",countryCode:"PE",language:IntlUtil.getText(_oc_common,"languageCode.es")}],
  FORM_SUBMIT_STATUS: {
    SUCCESS: "S",
    FAILURE: "F",
    INFO: "I",
  },
    GENERAL:{    
      LIST_DATA_REFRESH_INTERVAL_SECONDS: 3600, // 60 Mins
  },
    QUOTE:{
        PROGRESS:{
        SELECT_PRODUCTS:0,
        CREATE_ACCOUNT:1,
        CHECKOUT:2,
        ORDER_CONFIRMATION:3
    },
    ORDER_CHECKOUT:{
      ATTACHMENT_FILE_MAX_SIZE: 1000, // in KB
      ATTACHMENT_FILE_TYPES: [
        ".doc",
        ".docx"      ],
    SERVICE_ORDER_FORM_URL:"https://7361942.fs1.hubspotusercontent-na1.net/hubfs/7361942/Lumen%20LATAM%20Docs/Spanish/Service%20Order%20Form%20Spanish.docx",
    PAYMENT_TABS:[
      {tabName:"Company PO",tabValue:"companyPo"},
      {tabName:"Credit Card",tabValue:"creditCard"}
    ],
    ORDER_TYPE:{
PURCHASE_ORDER:"Purchase Order",
CREDIT_CARD:"Credit Card"
    }
    
    },
    CHARGE_TYPE:{
      ONE_TIME:"Onetime",
      RECURRING:"Recurring"
        },
        CHARGE_NAME:{
          PLATFORM_CHARGES:"Platform Charges",
          ACTIVATION_FEE:"Activation Fee",
          PORTING_FEE:"Porting Fee",
          DID_CHARGES:"DID Charges",
          MOVE_FEE:"Move Fee"
          
            },
      

        },
        AZURE_APPLICATION_INSIGHTS_LOG_MESSAGE: {
          QUOTE_CUSTOMER_DATA_SUBMITTED: "Quote - Customer data is submitted",
          QUOTE_PRODUCT_DATA_ADDED: "Quote - Product data is added",
          QUOTE_PRODUCT_DATA_UPDATED: "Quote - Product data is updated",
          QUOTE_PRODUCT_DATA_DELETED: "Quote - Product data is deleted",
        },
      
}