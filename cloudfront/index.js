var redirects = {
  "/datenschutzerklaerung.html": "/datenschutzerklaerung",
  "/download-hr3928m189.html": "/download-hr3928m189",
  "/formal-letter-template.html": "/formal-letter-template",
  "/geschaeftsbrief-vorlage-fuer-unternehmen.html":
    "/geschaeftsbrief-vorlage-fuer-unternehmen",
  "/herunterladen-rwhjj4h4.html": "/herunterladen-rwhjj4h4",
  "/herunterladen-unternehmen-ej2h3k12j3.html":
    "/herunterladen-unternehmen-ej2h3k12j3",
  "/impressum.html": "/impressum",
  "/imprint.html": "/imprint",
  "/kostenlos-testen.html": "/kostenlos-testen",
  "/privacy-policy.html": "/privacy-policy",
}

function handler(event) {
  var request = event.request

  var redirectUri = redirects[request.uri]
  if (redirectUri) {
    var response = {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: { location: { value: redirectUri } },
    }

    return response
  } else {
    return request
  }
}
