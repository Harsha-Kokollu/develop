/**
Project: Operator Connect (c)
Title: Intl Util 
Description: Helper class with functions for translation 
Copyrights: This file is subject to the terms and conditions defined in file 'LICENSE.txt', which is part of this source code package.
*/
import i18next from "i18next";
import { AppConfigProps } from "../settings/app-config";
class IntlUtil {
  // Get text based on namespace & key
  static getText(namespace, keyId) {
    if (namespace && keyId) {
      const t = i18next.getFixedT(null, namespace);
      return t(keyId);
    } else return null;
  }

  static setI18Language(language) {
    if (language) {
      localStorage.setItem(AppConfigProps.i18NextLanguageKey, language);
    }
  }

  // Get text based on namespace & key with substitute
  static getSubstituteText(namespace, keyId, substituteProps) {
    if (namespace && keyId) {
      const t = i18next.getFixedT(null, namespace);
      const text = t(keyId);
      if (text) {
        let newText = text;
        if (substituteProps && substituteProps.length > 0) {
          substituteProps.forEach((item) => {
            if (item.key && item.value) {
              newText = newText.replace(new RegExp(item.key, "g"), item.value);
            }
          });
          return newText;
        }
      } else return null;
    } else return null;
  }
}

export default IntlUtil;
