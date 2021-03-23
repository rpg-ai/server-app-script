function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}

function messageController(form) {
  const message = form.playerAction
  return processMessage(message)
}

function generatorController(generationType, subtype) {
  return randomGenerate(generationType, subtype)
}

function textGenerateController(form) {
  return generateTextWrap(form.textSeed)
}

function doPost(e) {

  //jotform ID
  const WITCHS_GOAT = '210642363521042'
  const PLAYER_MESSAGE = '210733936428055'
  
  const formID  = e.parameters.formID[0]

  switch(formID) {
    case PLAYER_MESSAGE:
      const message = e.parameters['action']
      return processMessage(String(message))
    case WITCHS_GOAT:
      const name = e.parameters['name']
      const action = e.parameters['action']

      const options = {
        method: "post"
      }

      const url = `${CHECK_API_URL}?player=${name}&action=${action}`
      const urlEncoded  = encodeURI(url)
      
      const response = UrlFetchApp.fetch(urlEncoded, options)

      const responseJson = JSON.parse(response.getContentText())
      const predictions_list = responseJson.predictions_list
      const first_predicted = Object.keys(predictions_list[0])[0]
      const skill_predicted = responseJson.prediction ? responseJson.prediction : first_predicted
      const runTime = responseJson.run_time


      const urlToRedirect = `${RESPONSE_PAGE_URL}?skill=${skill_predicted}&predicts=${Object.keys(predictions_list[0])[0]}: ${Object.values(predictions_list[0])[0]} ${Object.keys(predictions_list[1])[0]}: ${Object.values(predictions_list[1])[0]} ${Object.keys(predictions_list[2])[0]}: ${Object.values(predictions_list[2])[0]}`
      
      Logger.log(urlToRedirect)

      return HtmlService.createHtmlOutput("<script>window.top.location.href=\"" + urlToRedirect +  "\";</script>")
      break
    default:
      return ContentService.createTextOutput(JSON.stringify('We warned Arnold not to drink while working.')).setMimeType(ContentService.MimeType.JAVASCRIPT)
      break
  }
}
