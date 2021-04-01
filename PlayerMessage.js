const CHECK_API_URL = 'alpha-rpgai.herokuapp.com/predict'
const RESPONSE_PAGE_URL = 'https://rpg-ai.github.io/response-page/'

//
const CONFIDENCE_TO_ASK = 25.0

const MSG_ATTACK = 'Ask the player for an attack roll, if he has already done it apply the combat mechanics'
const MSG_GENERATE_TEXT = 'Generate text'
const MSG_OOC = 'Out Of Character'

const messageType = {
  ATTACK: 'attack',
  SPEAK: 'speak',
  STORY: 'story',
  ACTION: 'action'
}

function test() {
  processMessage('rpgai action I search the spiders body for something else it might hiding', '1617108053871')
}

function processMessage(message, rpgSessionId) {

  const rpgSession = findSession(rpgSessionId)

  const response = {}
  response.instruction = MSG_OOC
  response.textToCopy = ''

  let label = 'ooc'

  if(message.type === messageType.ATTACK) {
    label = 'attack'
    response.textToCopy = 'Combat not implemented'
  }

  if (message.type === messageType.SPEAK) {
    label = 'speak'
    const seedText = `${rpgSession.lastAction} You speak: -${message.content}`
    response.textToCopy = generateText(seedText)
  }

  if (message.type === messageType.STORY) {
    label = 'history'
    response.textToCopy = newEncounter(rpgSessionId)
  }

  if (message.type !== messageType.ACTION) {
    // Saving in the player messages sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('player_messages')
    sheet.appendRow([Date.now(), new Date().toLocaleString('pt-br'), String(message.content), String('APP_SCRIPT_UI'), label])

    updateLastAction(message.content, rpgSessionId)

    return response
  }

  updateLastAction(message.content, rpgSessionId)

  // rpgai action/check
  const responseJson = skillPredict('APP_SCRIPT_UI', message.content)

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
    const seedText = `${rpgSession.encounter} You ${rpgSession.lastAction} and`
    response.textToCopy = generateText(seedText)
    return response
  }
  
  response.predictions = new Array(checksToAsk.length)
  
  // Formatting the message to ask for a check(s)
  const textToCopy = 'Roll a {skill} check'
  let skills = '' 

  checksToAsk.forEach((skillName, index) => {
    
    const modifier = skillModifier(rpgSession.characterClass, skillName)
    
    response.predictions[index] = {
      label: `${skillName} d20 + ${modifier}`,
      value: dice(D20) + modifier
    }

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

  // Saving in the checks sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('dnd5e_checks')
  sheet.appendRow([Date.now(), new Date().toLocaleString('pt-br'), String(action), JSON.stringify(responseJson.predictions_list), responseJson.run_time, String(playerName)])

  return responseJson
}
