import { COUNTRY_STATES_DATA } from "../../../store/constants";
import { OperatorConnectConstants } from "../settings/operator-connect-constants";


export function getTimeDifferenceSeconds(startTimestamp, endTimestamp) {
    let durationSeconds = null;
    if (startTimestamp && endTimestamp) {
      durationSeconds = parseInt(
        (endTimestamp.getTime() - startTimestamp.getTime()) / 1000
      );
    }
    return durationSeconds;
  }

  export function setCountryStatesData(countryStatesData) {
    return async function (dispatch) {
      try {
        dispatch({
          type: COUNTRY_STATES_DATA,
          payload: countryStatesData,
        });
      } catch (err) {
        throw Error(err);
      }
    };
  }

  export function getCountryQuoteStatesList(countryStatesData){
let countryStatesList=[{key:"",text:""}];
if(countryStatesData&&countryStatesData.length>0){
  let partnerSupportedCountries=OperatorConnectConstants.PARTNER_SUPPORT_COUNTRIES;
  countryStatesData.forEach(country=>{
    if(partnerSupportedCountries.includes(country.countryCode)===true){
      countryStatesList.push({key:country?.countryName,text:country.countryName})
    }
  })
}
return countryStatesList;
  }

  export function getCountryStatesList(countryStatesData){
    let countryStatesList=[{key:"",text:""}];
    if(countryStatesData&&countryStatesData.length>0){
      countryStatesData.forEach(country=>{
          countryStatesList.push({key:country?.countryName,text:country.countryName})
      })
    }
    return countryStatesList;
      }
    
  