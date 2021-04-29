function doGet(e) {
  const userId = e.parameter.u
  
  const rpgSessionId = Date.now()

  const quest = `The last of the Kai Lords assigns you the mission to take the legendary Moonstone to Elzian—the principal city of the jungle realm of Dessi. There you are to seek out Lord Rimoah at the Tower of Truth.`

  const sceneId =  saveScene({
    rpgSessionId, userId, text: findQuestScene(2).encounter, questSceneId: 2
  })

  session = {
    rpgSessionId, 
    startedOn: new Date().toLocaleString('pt-br'),
    quest: String(quest),
    //encounter: findScene(2).encounter,
    difficultyClass: difficultyClass(),
    sceneId,
    userId
  }

  // Saving the game
  saveSession(session)

  const htmlOutput = HtmlService.createTemplateFromFile('index')
  htmlOutput.rpgSessionId = rpgSessionId
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

function checkController(checkValue, rpgSessionId) {
  // GameMechanics.gs
  return processCheck(checkValue, rpgSessionId)
}

function rpgSessionController(selectedClass, rpgSessionId) {
  // GameMechanics.gs
  return startGame(selectedClass, rpgSessionId)
}

function characterClassController() {
  // Dnd5eCharacterClass.gs
  return getCharacterClass()
}

function attackController(actionName, rpgSessionId) {
  // GameMechanics.gs
  return combat(actionName, rpgSessionId)
}