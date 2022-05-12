import IntlUtil from "./intl-util";

class PageUtil {
   
static scrollToTop(currProps = null, prevProps = null) {
    if (currProps && prevProps) {
      if (currProps.location.pathname !== prevProps.location.pathname) {
        window.scrollTo(0, 0);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }

  // Scroll page to top
  static scrollIntoView(objRef) {
    if (objRef && objRef.current) {
      objRef.current.scrollIntoView();
    }
  }
  static getHeadTitle(title = null) {
    if (title) {
      return `${IntlUtil.getText("oc_common", "title.appName")} | ${title}`;
    } else {
      return IntlUtil.getText("oc_common", "title.appName");
    }
  }
}

export default PageUtil