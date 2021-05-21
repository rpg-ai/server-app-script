function doGet(e) {
  const userId = e.parameter.u
  
  const user = findUser(userId)

  const htmlOutput = HtmlService.createTemplateFromFile('index')
  htmlOutput.userId = userId
  
  if (user.lastSceneId) {
    const scene = findScene(user.lastSceneId)

    htmlOutput.continueGame = true
    htmlOutput.rpgSessionId = scene.rpgSessionId

    return htmlOutput.evaluate()
  }

  htmlOutput.continueGame = false
  
  return htmlOutput.evaluate()
}

/**
 * Endpoint to process the player message. Is called when the player clicks in the send message button's
 */
function messageController(playerAction, rpgSessionId) {
  // PlayerMessage.gs
  return processMessage(playerAction, rpgSessionId)
}

function generatorController(generationType, subtype) {
  // RamdomGenerator.gs
  return randomGenerateWrap(generationType, subtype)
}

function textGenerateController(form) {
  // AITextGenerator.gs
  return generateTextWrap(form.textSeed)
}

function generatedTextController(message, feedback) {
  // Sheets.gs
  return saveFeedback(message, feedback)
}

function checkController(checkValue, rpgSessionId) {
  // GameMechanics.gs
  return processCheck(checkValue, rpgSessionId)
}

function rpgSessionController(selectedClass, userId) {
  // GameMechanics.gs
  return startGame(selectedClass, userId)
}

function characterClassController() {
  // Dnd5eCharacterClass.gs
  return getCharacterClass()
}

function attackController(actionName, rpgSessionId) {
  // GameMechanics.gs
  return combat(actionName, rpgSessionId)
}

function gameController(userId) {
  // GameMechanics.gs
  return continueGame(userId)
}

function restartGameController(userId) {
  // GameMechanics.gs
  return saveLastScene(userId, '')
}