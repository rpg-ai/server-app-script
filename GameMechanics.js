const D20 = 20

const taskDifficulty = {
  VERY_EASY: 10,
  EASY: 12,
  MEDIUM: 14,
  HARD: 16,
  VERY_HARD: 18,
  NEARLY_IMPOSSIBLE: 20
}

function dice(diceType){
  return Math.floor(Math.random() * diceType) + 1
}

function processCheck(checkValue, rpgSessionId) {

  const response = {}
  response.instruction = ''

  const sessionDifficulty = findSession(rpgSessionId).difficultyClass
  if (checkValue >= sessionDifficulty) {
    response.instruction = `${checkValue} is a success`
    //generateText(seed)
  } else {
    response.instruction = `${checkValue} is a failure`
  }

  return response
}

function isSucess(checkValue) {
  //TO DO change for the Sucess/Failure check mechanic 
  return checkValue > 10
}

function startGame(selectedClass) {
  const rpgSessionId = Date.now()
  
  const quest = randomGenerate('Quest', '')
  const gameSettings = `${randomGenerate('Location', 'World')}\n${quest}\nYou are in ${randomGenerate('Location', '')} ${randomGenerate('Encounter', 'Dungeon')}`

  // Saving the game
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('rpg_session')
  sheet.appendRow([rpgSessionId, new Date().toLocaleString('pt-br'), selectedClass, String(quest), difficultyClass()])

  return {
    instruction: '',
    textToCopy: gameSettings.concat('\n\nWhat do you do?'),
    rpgSessionId
  }
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
    difficultyClass: rpgSessionData[4]
  }

  return rpgSession
}

function updateLastAction(action, rpgSessionId) {
  const rpgSessionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('rpg_session')

  // Sheet row number corresponding to the session
  const row = findRow(rpgSessionSheet, 0, rpgSessionId)

  // Get Range in the sheet at row, column = 6, number of rows = 1, number of columns = 2 (last_action, update_at)
  const range = rpgSessionSheet.getRange(row, 6, 1, 2)

  // Updating values in the sheet
  range.setValues([[String(action), String(Date.now())]])
}

function difficultyClass() {

  const difficultyClassNumber = Math.floor(Math.random() * 1000) + 10
  
  if(difficultyClassNumber <= 475){
    return taskDifficulty.VERY_EASY
  }

  if(difficultyClassNumber <= 675){
    return taskDifficulty.EASY
  }

  if(difficultyClassNumber <= 825){
    return taskDifficulty.MEDIUM
  }

  if(difficultyClassNumber <= 925){
    return taskDifficulty.HARD
  }

  if(difficultyClassNumber <= 975){
    return taskDifficulty.VERY_HARD
  }

  // difficultyClassNumber <= 1000
  return taskDifficulty.NEARLY_IMPOSSIBLE
  
}
