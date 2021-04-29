function findRow(sheet, column, value) {
  const data = sheet.getDataRange().getValues()
  for(var i = 0; i<data.length;i++){
    if(data[i][column] == value){
      return i+1
    }
  }
  return null
}

function saveSession(session) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('rpg_session')
  sheet.appendRow([session.rpgSessionId, session.startedOn, session.selectedClass, session.quest, session.encounter, session.difficultyClass, '', '', session.sceneId, session.userId])
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
    userId: rpgSessionData[9]
  }

  return rpgSession
}

function updateSessionScene(scene, rpgSessionId) {

  const rpgSessionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('rpg_session')

  // Sheet row number corresponding to the session
  const row = findRow(rpgSessionSheet, 0, rpgSessionId)
  // acho que esse 7 aqui ta errado
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

function updateEncounter(encounter, sceneId) {
  const rpgSessionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('scene')

  // Sheet row number corresponding to the session
  const row = findRow(rpgSessionSheet, 0, sceneId)

  // Get Range in the sheet at row, column = 4, number of rows = 1, number of columns = 1 (text)
  const range = rpgSessionSheet.getRange(row, 4, 1, 1)

  // Updating values in the sheet
  range.setValues([[String(encounter)]])
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
  sheet.appendRow([sceneId, scene.rpgSessionId, scene.userId, scene.text, scene.questSceneId])
  return sceneId
}

function findQuestScene(sceneNumber) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('quest')
  const sceneData = sheet.getSheetValues(sceneNumber, 1, 1, sheet.getLastColumn()).reduce((a, b) => { return a.concat(b) })
  const scene = {
    place: sceneData[0],
    secret: sceneData[1],
    encounter: sceneData[2],
    nextSceneCondition: sceneData[3],
    description: sceneData[4] 
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
    questSceneId: sceneData[4]
  }
}

function saveGeneratedText(objToSave){
   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('generated_text')
  sheet.appendRow([objToSave.id, objToSave.createdAt, objToSave.model, objToSave.inputText, objToSave.outputText, objToSave.sceneId])
}