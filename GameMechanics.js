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

  const rpgSession = findSession(rpgSessionId)
  if (checkValue >= rpgSession.difficultyClass) {
    const seedText = `${rpgSession.encounter} You successfully ${rpgSession.lastAction} and`
    response.textToCopy = `You roll a ${checkValue}.\n${generateText(seedText)}`
  } else {
    const seedText = `${rpgSession.encounter} You fail to ${rpgSession.lastAction} and`
    response.textToCopy = `You roll a ${checkValue}.\n${generateText(seedText)}`
  }

  return response
}

function startGame(selectedClass) {
  const rpgSessionId = Date.now()
  
  const quest = randomGenerate('Quest', '')
  const encounter = randomGenerate('Encounter', 'Dungeon')
  const gameSettings = `${randomGenerate('Location', 'World')}\n${quest}\nYou are in ${randomGenerate('Location', '')} ${encounter}`

  session = {
    rpgSessionId, 
    startedOn: new Date().toLocaleString('pt-br'),
    selectedClass,
    quest: String(quest),
    encounter: String(encounter),
    difficultyClass: difficultyClass()
  }

  // Saving the game
  saveSession(session)

  return {
    instruction: '',
    textToCopy: gameSettings.concat('\n\nWhat do you do?'),
    rpgSessionId
  }
}

function newEncounter(rpgSessionId) {
  const encounter = randomGenerate('Encounter', 'Dungeon')
  updateEncounter(encounter, rpgSessionId)
  return encounter
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
