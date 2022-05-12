import { appInsights } from "../settings/app-insights";
import PageUtil from "./page-util";

class TelemetryUtil {
  static trackTrace(message, severityLevel, properties) {
    appInsights.trackTrace({
      message: message,
      severityLevel: severityLevel,
      properties: properties,
    });
  }

  static trackPageView(pageViewTitle) {
    let headerTitle=PageUtil.getHeadTitle();
    if(headerTitle!==""&&headerTitle!==null&&pageViewTitle!==null&&pageViewTitle!==undefined){
      appInsights.trackPageView({name:headerTitle+" | "+pageViewTitle});
    }
  }
}

export default TelemetryUtil;
