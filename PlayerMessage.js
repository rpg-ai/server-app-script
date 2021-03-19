const CHECK_API_URL = 'alpha-rpgai.herokuapp.com/predict'
const RESPONSE_PAGE_URL = 'https://rpg-ai.github.io/response-page/'

//
const CONFIDENCE_TO_ASK = 25.0

const MSG_ATTACK = 'Ask the player for an attack roll, if he has already done it apply the combat mechanics'
const MSG_GENERATE_TEXT = 'Generate text'

function test(){

  const locale = 'pt-br'
  const dateNow = Date.now()
  const newDate = new Date()
  
  //console.log(new Date().toLocaleString('pt-br'))
  /*const numero = Number('14.35%'.replace('%',''))
  if (numero < CONFIDENCE_TO_ASK) {
    console.log('passou aqui')
  }*/
}

function processMessage(message) {

  const response = {}
  response.instruction = ''
  response.textToCopy = ''

  if (message.toLowerCase().includes('rpgai attack')) {
    response.instruction =  MSG_ATTACK
    return response
  }
  
  const responseJson = skillPredict('APP_SCRIPT_UI', message)

  /* json array of checks where the object key is the skill's name predicted by the model and the value is the confidence
    ex: [{"Investigation": "18.52%"},{"Perception": "12.83%"},{"Stealth": "12.22%"}]
  */
  const predictions = responseJson.predictions_list

  const checksToAsk = []
  
  for (const check of predictions) {
    const confidence = Number(Object.values(check)[0].replace('%',''))
    if (confidence >= CONFIDENCE_TO_ASK) {
      checksToAsk.push(Object.keys(check)[0])
    }
  }

  if (checksToAsk.length === 0) {
    response.instruction = MSG_GENERATE_TEXT
    return response
  }

  // Formatting the message to ask for a check(s)
  const textToCopy = ':d20: **Roll a {skill} check**'
  let skills = ''
  checksToAsk.forEach((skillName, index) => {
    if (index === 0) {
      skills = skills.concat(skillName)
    } else {
      skills = skills.concat(' or ', skillName)
    }
  })
  response.textToCopy = textToCopy.replace('{skill}', skills)

  return response
}

function skillPredict(playerName, action){
  const options = {
    method: "post"
  }

  const url = `${CHECK_API_URL}?player=${playerName}&action=${action}`
  const urlEncoded  = encodeURI(url)
  const response = UrlFetchApp.fetch(urlEncoded, options)

  const responseJson = JSON.parse(response.getContentText())

  // Saving in the sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('dnd5e_checks')
  sheet.appendRow([Date.now(), new Date().toLocaleString('pt-br'), String(action), JSON.stringify(responseJson.predictions_list), responseJson.run_time, String(playerName)])

  return responseJson
}
