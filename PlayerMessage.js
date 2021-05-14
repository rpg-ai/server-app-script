const CHECK_API_URL = 'alpha-rpgai.herokuapp.com/predict'
const RESPONSE_PAGE_URL = 'https://rpg-ai.github.io/response-page/'

//
const CONFIDENCE_TO_ASK = 25.0
const NO_CHECK = 'NoCheck'

const MSG_ATTACK = 'How would you like to attack?'
const MSG_GENERATE_TEXT = 'Generate text'
const MSG_OOC = 'Out Of Character'

const messageType = {
  ATTACK: 'attack',
  SPEAK: 'speak',
  STORY: 'story',
  ACTION: 'action'
}

function processMessage(message, rpgSessionId) {

  const rpgSession = findSession(rpgSessionId)

  const currentScene = findScene(rpgSession.scene)

  const questScene = findQuestScene(currentScene.questSceneId)

  let questSceneId = currentScene.questSceneId

  let response = {}
  response.instruction = MSG_OOC
  response.textToCopy = ''

  let label = message.type

  if(message.type === messageType.ATTACK) {

    // Remove the pronoum I
    message.content =  message.content.replace('I ', '')
    // uptading last action to send to use the last action to generate text
    updateLastAction(message.content, rpgSessionId)

    response.textToCopy = MSG_ATTACK
    response.combatActions = getCombatActions(findCharacter(rpgSessionId).characterClass, rpgSessionId)

    // GameMechanics.gs
    response =  combat('Two Handed Sword', rpgSessionId)
  }

  if (message.type === messageType.SPEAK) {

    // AI Response
    const aiResponse = generateText(`${rpgSession.quest} You are in ${questScene.place} ${questScene.secret} ${currentScene.text}`, 
      `'${message.content}' you say.`,
      rpgSession.scene, NUMBER_OF_SENTENCES_SPEAK, messageType.SPEAK, rpgSession.userId)
    response.textToCopy = aiResponse.trim;
    response.messageId = aiResponse.messageId;
  }

  if (message.type === messageType.STORY) {

    questSceneId = currentScene.questSceneId + 1
    const newScene = findQuestScene(questSceneId)
    const sceneId =  saveScene({
      rpgSessionId, userId: rpgSession.userId, text: newScene.encounter, questSceneId, description: newScene.description
    })

    updateSessionScene(sceneId, rpgSessionId)
    response.textToCopy = newScene.description
    response.nextScene = newScene.nextSceneCondition
  }

    // Saving in the player messages sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('player_messages')
    sheet.appendRow([Date.now(), new Date().toLocaleString('en-us'), String(message.content),  rpgSession.userId, label, rpgSessionId, questSceneId])

  if (message.type !== messageType.ACTION) {
    Logger.log(`not action: ${response}`)
    return response
  }

  // rpgai action/check
  const responseJson = skillPredict(rpgSession.userId, message.content)

  /* json array of checks where the object key is the skill's name predicted by the model and the value is the confidence
    ex: [{"Investigation": "18.52%"},{"Perception": "12.83%"},{"Stealth": "12.22%"}]
  */
  const predictions = responseJson.predictions_list

  const checksToAsk = []
  
  for (const check of predictions) {
    const confidence = Number(Object.values(check)[0].replace('%',''))
    if (confidence >= CONFIDENCE_TO_ASK && Object.keys(check)[0]  !== NO_CHECK) {
      checksToAsk.push(Object.keys(check)[0])
    }
  }

    // Remove the pronoum I
    message.content =  message.content.replace('I ', '')

  if (checksToAsk.length === 0) {

    // AI Response
    const aiResponse = generateText(`${rpgSession.quest} You are in ${questScene.place} ${questScene.secret} ${currentScene.text} You ${message.content} and`, 
    '', rpgSession.scene, NUMBER_OF_SENTENCES_ACTION, messageType.ACTION, rpgSession.userId);
    response.textToCopy = aiResponse.trim;
    response.messageId = aiResponse.messageId;
    return response
  }

  // uptading last action to send to use the last action to generate text
  updateLastAction(message.content, rpgSessionId)
  
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

function convertDate() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('player_messages')
  const data = sheet.getDataRange().getValues()
  for (var i = 1;i < data.length; i++ ) {
    sheet.getRange(i+1, 2, 1, 1).setValues([[String(new Date(data[i][0]).toLocaleString('en-us'))]])
  }
}
