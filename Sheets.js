function findRow(sheet, column, value) {
  const data = sheet.getDataRange().getValues()
  for(var i = 0; i<data.length;i++){
    if(data[i][column] == value){
      return i+1
    }
  }
  return null
}

function findRowTwoColumns(sheet, column1, value1, column2, value2) {
  const data = sheet.getDataRange().getValues()
  for(var i = 0; i<data.length;i++){
    if(data[i][column1] == value1 && data[i][column2] == value2){
      return i+1
    }
  }
  return null
}

function saveSession(session) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('rpg_session')
  sheet.appendRow([session.rpgSessionId, session.startedOn, session.selectedClass, session.quest, session.encounter, session.difficultyClass, '', '', session.sceneId, session.userId, session.type])
}

function findSession (rpgSessionId){
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('rpg_session')
  
  const row = findRow(sheet, 0, rpgSessionId)
  if(!row) {
    return null
  }

  const rpgSessionData = sheet.getSheetValues(row, 1, 1, sheet.getLastColumn()).reduce((a, b) => { return a.concat(b) })
  const rpgSession = {
    characterClass: rpgSessionData[2],
    quest: rpgSessionData[3],
    encounter: rpgSessionData[4],
    difficultyClass: rpgSessionData[5],
    lastAction: rpgSessionData[6],
    scene: rpgSessionData[8],
    userId: rpgSessionData[9],
    type: rpgSessionData[10]
  }

  return rpgSession
}

function updateSessionScene(scene, rpgSessionId) {

  const rpgSessionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('rpg_session')

  // Sheet row number corresponding to the session
  const row = findRow(rpgSessionSheet, 0, rpgSessionId)
  
  // Get Range in the sheet at row, column = 8, number of rows = 1, number of columns = 2 (update_at, scene)
  const range = rpgSessionSheet.getRange(row, 8, 1, 2)

  // Updating values in the sheet
  range.setValues([[String(Date.now()), scene]])
}

function updateLastAction(action, rpgSessionId) {
  const rpgSessionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('rpg_session')

  // Sheet row number corresponding to the session
  const row = findRow(rpgSessionSheet, 0, rpgSessionId)

  // Get Range in the sheet at row, column = 7, number of rows = 1, number of columns = 2 (last_action, update_at)
  const range = rpgSessionSheet.getRange(row, 7, 1, 2)

  // Updating values in the sheet
  range.setValues([[String(action), String(Date.now())]])
}

function updateScene(encounter, sceneId, description) {
  const rpgSessionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('scene')

  // Sheet row number corresponding to the session
  const row = findRow(rpgSessionSheet, 0, sceneId)

  // Get Range in the sheet at row, column = 4, number of rows = 1, number of columns = 1 (text)
  const range = rpgSessionSheet.getRange(row, 4, 1, 1)

  // Updating values in the sheet
  range.setValues([[String(encounter)]])

  const sceneDescription = rpgSessionSheet.getRange(row, 6, 1, 1)
  sceneDescription.setValues([[String(description)]])
}

function saveCharacter(characterClass, rpgSessionId){
  let hitPoints = 0
  let spell_slot1 = ''
  let spell_slot2 = ''
  switch (characterClass) {
    case FIGTHER.name:
      hitPoints = FIGTHER.hitPoints
      break
    case WIZARD.name:
      hitPoints = WIZARD.hitPoints
      spell_slot1 = WIZARD.spellSlot1
      spell_slot2 =  WIZARD.spellSlot2
      break
    case ROGUE.name:
      hitPoints = ROGUE.hitPoints
      break
    case BARD.name:
      hitPoints = BARD.hitPoints
      break
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('character')
  sheet.appendRow([rpgSessionId, hitPoints, spell_slot1, spell_slot2, characterClass])

}

function findCharacter(rpgSessionId){
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('character')
  
  const row = findRow(sheet, 0, rpgSessionId)
  if(!row) {
    return null
  }

  const characterData = sheet.getSheetValues(row, 1, 1, sheet.getLastColumn()).reduce((a, b) => { return a.concat(b) })
  const character = {
    hitPoints: characterData[1],
    spellSlot1: Number(characterData[2]),
    spellSlot2: Number(characterData[3]),
    characterClass: characterData[4]
  }

  return character
}

function updateCharacter(playerCharacter, rpgSessionId) {
  const rpgSessionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('character')

  // Sheet row number corresponding to the session
  const row = findRow(rpgSessionSheet, 0, rpgSessionId)

  // Get Range in the sheet at row, column = 2, number of rows = 1, number of columns = 3 (hit_points, spell_slot1, spell_slot2)
  const range = rpgSessionSheet.getRange(row, 2, 1, 3)

  // Updating values in the sheet
  range.setValues([[playerCharacter.hitPoints, playerCharacter.spellSlot1, playerCharacter.spellSlot2]])
}

function saveLastScene(userId, lastSceneId) {
  const userSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('user')
  const row = findRow(userSheet, 0, userId)
  const range = userSheet.getRange(row, 3, 1, 1)
  range.setValues([[lastSceneId]])
}

function findEnemy (rpgSessionId){
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('enemy')
  
  const row = findRow(sheet, 0, rpgSessionId)
  if(!row) {
    return null
  }

  const enemyData = sheet.getSheetValues(row, 1, 1, sheet.getLastColumn()).reduce((a, b) => { return a.concat(b) })
  const enemy = {
    name: enemyData[1],
    hitPoints: enemyData[2],
    inCombat: enemyData[3]
  }

  return enemy
}

function newEnemy(rpgSessionId) {
  const enemy = enemyByDifficulty.EASY
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('enemy')
  sheet.appendRow([rpgSessionId, enemy.name, enemy.hitPoints, true])
  
  return {
    name: enemy.name,
    hitPoints: enemy.hitPoints,
    inCombat: true
  }
}

function updateEnemy(enemy, rpgSessionId) {
  const rpgSessionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('enemy')

  // Sheet row number corresponding to the session
  const row = findRow(rpgSessionSheet, 0, rpgSessionId)

  // Get Range in the sheet at row, column = 3, number of rows = 1, number of columns = 2 (hit_points, in_combat)
  const range = rpgSessionSheet.getRange(row, 3, 1, 2)

  // Updating values in the sheet
  range.setValues([[enemy.hitPoints, enemy.inCombat]])
}

function saveScene(scene) {
  const sceneId = Date.now()
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('scene')
  sheet.appendRow([sceneId, scene.rpgSessionId, scene.userId, scene.text, scene.questSceneId, scene.description])
  saveLastScene(scene.userId, sceneId)
  return sceneId
}

function findQuestScene(sceneNumber, currentSessionType, rpgSessionId) {

  let sheet = ''
  const scene = {}

  if (currentSessionType === sessionType.RANDOM ) {

    sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('generated_scene')
    // Sheet row number corresponding to the session
    const row = findRowTwoColumns(sheet, 0, rpgSessionId,1, sceneNumber)

    const sceneData = sheet.getSheetValues(row, 1, 1, sheet.getLastColumn()).reduce((a, b) => { return a.concat(b) })

    scene.place = sceneData[2]
    scene.secret = ''
    scene.encounter = sceneData[3]
    scene.description = sceneData[4]
    scene.quest = sceneData[5]

  } else {
    sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('quest')
    const sceneData = sheet.getSheetValues(sceneNumber, 1, 1, sheet.getLastColumn()).reduce((a, b) => { return a.concat(b) })
    scene.place = sceneData[0]
    scene.secret = sceneData[1]
    scene.encounter = sceneData[2]
    scene.nextSceneCondition = sceneData[3]
    scene.description = sceneData[4]
    scene.quest = `The last of the Kai Lords assigns you the mission to take the legendary Moonstone to Elzian—the principal city of the jungle realm of Dessi. There you are to seek out Lord Rimoah at the Tower of Truth.`
  }

  return scene
}

function findScene(sceneId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('scene')

  const row = findRow(sheet, 0, sceneId)
  if(!row) {
    return null
  }

  const sceneData = sheet.getSheetValues(row, 1, 1, sheet.getLastColumn() +1).reduce((a, b) => { return a.concat(b) })

  return {
    rpgSessionId: sceneData[1],
    userId: sceneData[2],
    text: sceneData[3],
    questSceneId: sceneData[4],
    description: sceneData[5]
  }
}

function saveGeneratedScene(scene) {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('generated_scene').appendRow([scene.rpgSessionId, scene.sceneNumber, scene.place, scene.encounter, scene.description, scene.quest])
}

function saveGeneratedText(objToSave){
   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('generated_text')
  sheet.appendRow([objToSave.id, objToSave.createdAt, objToSave.model, objToSave.inputText, objToSave.outputText, objToSave.sceneId, objToSave.feedback, objToSave.label, objToSave.userId])
}

function findUser(userId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('user')

  const row = findRow(sheet, 0, userId)
  if(!row) {
    return null
  }

  const userData = sheet.getSheetValues(row, 1, 1, sheet.getLastColumn() +1).reduce((a, b) => { return a.concat(b) })

  return {
    name: userData[1],
    lastSceneId: userData[2],
  }
}

function saveFeedback(message, feedback) {
  let sheet = null;
  Logger.log(message.type)
  if (message.type == 'story') {
    Logger.log(message.id)
    sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('generated_text');
    const row = findRow(sheet, 0, message.id);
    if (!row) {
      return null
    }
    sheet.getRange(row, 7).setValue(feedback);
  }
  else if (message.type == 'check request') {
    sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('dnd5e_checks');
    const row = findRow(sheet, 0, message.predictId);
    if (!row) {
      return null
    }
    sheet.getRange(row, 7).setValue(feedback)
  }
}