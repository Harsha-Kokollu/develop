export const AppConfigProps={

operatorConnectAPIPrefix: "/operator-connect",
i18NextLanguageKey:"i18NextLanguage",
identitySession: {
  operatorConnectTokenKey: "operator-connect-token",
  expiryCheckRemainingSeconds: 3600, // 60 mins
},

httpStatusCode: {
    ok: 200,
    badRequest: 400,
    unauthorized: 401,
    forbidden: 403,
    notFound: 404,
    methodNotAllowed: 405,
    unprocessable: 422,
    requestTimeout: 408,
    clientClosedRequest: 499,
    internalServerError: 500,
  },
  log: {
    messages: true,
    severityLevel: {
      info: "INFO",
      warning: "WARANING",
      error: "ERROR",
      fatal: "FATAL",
    },
  },
  SeverityLevel: {
    Verbose: 0,
    Information: 1,
    Warning: 2,
    Error: 3,
    Critical: 4,
  },
}
