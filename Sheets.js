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
  sheet.appendRow([session.rpgSessionId, session.startedOn, session.selectedClass, session.quest, session.encounter, session.difficultyClass])
}

function findSession (rpgSessionId){
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('rpg_session')
  
  const row = findRow(sheet, 0, rpgSessionId)
  if(!row) {
    return null
  }

  const rpgSessionData = sheet.getSheetValues(row, 1, 1, sheet.getLastColumn()-1).reduce((a, b) => { return a.concat(b) })
  const rpgSession = {
    characterClass: rpgSessionData[2],
    encounter: rpgSessionData[4],
    difficultyClass: rpgSessionData[5],
    lastAction: rpgSessionData[6]
  }

  return rpgSession
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

function updateEncounter(encounter, rpgSessionId) {
  const rpgSessionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('rpg_session')

  // Sheet row number corresponding to the session
  const row = findRow(rpgSessionSheet, 0, rpgSessionId)

  // Get Range in the sheet at row, column = 5, number of rows = 1, number of columns = 1 (encounter)
  const range = rpgSessionSheet.getRange(row, 5, 1, 1)

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
  sheet.appendRow([rpgSessionId, hitPoints, spell_slot1, spell_slot2])

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
    spellSlot2: Number(characterData[3])
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

