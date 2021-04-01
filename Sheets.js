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

function findRow(sheet, column, value) {
  const data = sheet.getDataRange().getValues()
  for(var i = 0; i<data.length;i++){
    if(data[i][column] == value){
      return i+1
    }
  }
  return null
}
