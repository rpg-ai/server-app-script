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

  let response = {}
  response.instruction = MSG_OOC
  response.textToCopy = ''

  let label = 'ooc'

  if(message.type === messageType.ATTACK) {

    // Remove the pronoum I
    message.content =  message.content.replace('I ', '')
    // uptading last action to send to use the last action to generate text
    updateLastAction(message.content, rpgSessionId)

    label = 'attack'
    response.textToCopy = MSG_ATTACK
    response.combatActions = getCombatActions(findCharacter(rpgSessionId).characterClass, rpgSessionId)

    // GameMechanics.gs
    response =  combat('Two Handed Sword', rpgSessionId)
  }

  if (message.type === messageType.SPEAK) {
    label = 'speak'

    // AI Response
    response.textToCopy = generateText(`${rpgSession.quest} You are in ${questScene.place} ${questScene.secret} ${currentScene.text}`, 
      `'${message.content}' you say.`,
      rpgSession.scene, NUMBER_OF_SENTENCES_SPEAK)
  }

  if (message.type === messageType.STORY) {
    label = 'history'

    const questSceneId = currentScene.questSceneId + 1
    const newScene = findQuestScene(questSceneId)
    const sceneId =  saveScene({
      rpgSessionId, userId: rpgSession.userId, text: newScene.encounter, questSceneId
    })

    updateSessionScene(sceneId, rpgSessionId)
    response.textToCopy = newScene.description
    response.nextScene = newScene.nextScene
  }

  if (message.type !== messageType.ACTION) {
    // Saving in the player messages sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('player_messages')
    sheet.appendRow([Date.now(), new Date().toLocaleString('pt-br'), String(message.content),  rpgSession.userId, label])

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
    response.textToCopy = generateText(`${rpgSession.quest} You are in ${questScene.place} ${questScene.secret} ${currentScene.text} You ${message.content} and`, 
      '', rpgSession.scene, NUMBER_OF_SENTENCES_ACTION)
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
