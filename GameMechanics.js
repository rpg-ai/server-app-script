const D20 = 20

const taskDifficulty = {
  VERY_EASY: 10,
  EASY: 12,
  MEDIUM: 14,
  HARD: 16,
  VERY_HARD: 18,
  NEARLY_IMPOSSIBLE: 20
}

const enemyByDifficulty = {
  EASY: {
    name:'Creature',
    hitPoints: 10,
    armorClass: 11,
    combatActions: [
      {name: 'Basic attack', attackBonus: 2, damage: 3}
    ],
  },
  MEDIUM: {
    name:'Creature',
    hitPoints: 20,
    armorClass: 13,
    combatActions: [
      {name: 'Basic attack', attackBonus: 3, damage: 5}
    ],
  },
  HARD: {
    name:'Creature',
    hitPoints: 40,
    armorClass: 15,
    combatActions: [
      {name: 'Basic attack', attackBonus: 5, damage: 8}
    ],
  },
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
  const nextScene = 'Go to quarters and rest. Return to the vault at midnight to begin the mission.'

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
  saveCharacter(selectedClass, rpgSessionId)

  return {
    rpgSessionId,
    nextScene,
    instruction: '',
    textToCopy: gameSettings.concat('\n\nWhat do you do?'),
    hitPoints: findCharacter(rpgSessionId).hitPoints,
    armorClass: getCharacterClassByName(selectedClass).armorClass,
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

function combat(actionName, rpgSessionId) {

  let enemy = findEnemy(rpgSessionId)

  if(!enemy || !enemy.inCombat) {
    enemy = newEnemy(rpgSessionId)
  }

  const charactherClass = getCharacterClassByName(findSession(rpgSessionId).characterClass)

  const combatAction = charactherClass.combatActions.filter( action => actionName.includes(action.name))[0]

  const response = {}

  const playerCharacter = findCharacter(rpgSessionId)

  // Firebolt automatically hits
  if(combatAction.name === WIZARD.combatActions[1].name) {
    enemy.hitPoints = enemy.hitPoints - combatAction.damage
    response.textToCopy = `You hit the enemy. Damage done is ${combatAction.damage}.\n\n`
    updateEnemy(enemy, rpgSessionId)

    playerCharacter.spellSlot1 = playerCharacter.spellSlot1 - 1
    updateCharacter(playerCharacter, rpgSessionId)

  } else {
    const attackValue = dice(D20) + combatAction.attackBonus

    if( attackValue >= enemyByDifficulty.EASY.armorClass ) {
      enemy.hitPoints = enemy.hitPoints - combatAction.damage
      response.textToCopy = `You rolled a ${attackValue} in the attack rol. You hit the enemy. Damage done is ${combatAction.damage}.\n\n`
      updateEnemy(enemy, rpgSessionId)

    } else {
      response.textToCopy = `You rolled a ${attackValue} in the attack rol. You fail to hit the enemy.\n\n`
    }
  }

  // Check if the enemy died
  if ( enemy.hitPoints <= 0 ) {
    response.textToCopy = response.textToCopy.concat('The enemy died.')
    enemy.inCombat = false
    updateEnemy(enemy, rpgSessionId)

    return response
  }

  const enemyAttackValue = dice(D20) + enemyByDifficulty.EASY.combatActions[0].attackBonus

  // Magic Shield adds 3 to player's AC
  if(combatAction.name === WIZARD.combatActions[2].name) {
    charactherClass.armorClass = charactherClass.magicArmor

    playerCharacter.spellSlot2 = playerCharacter.spellSlot2 - 1
    updateCharacter(playerCharacter, rpgSessionId)

  }

  response.combatActions = getCombatActions(charactherClass.name,rpgSessionId)

  if(enemyAttackValue < charactherClass.armorClass) {
    response.textToCopy = response.textToCopy.concat('The enemy fails to hit you.\n\n', MSG_ATTACK)

    return response
  }

  playerCharacter.hitPoints = playerCharacter.hitPoints - enemyByDifficulty.EASY.combatActions[0].damage

  response.textToCopy = `${response.textToCopy} The enemy hits you. Damage taken is ${enemyByDifficulty.EASY.combatActions[0].damage}.\n\n`

  if(playerCharacter.hitPoints <= 0) {
    response.textToCopy = response.textToCopy.concat('You die. GAME OVER')
    response.combatActions = []
  } else {
    response.textToCopy = `${response.textToCopy} You remaing hit points are ${playerCharacter.hitPoints}. \n\n ${MSG_ATTACK}`
  }

  updateCharacter(playerCharacter, rpgSessionId)
  return response
}

function mytest() {
  combat('Staff + Magic Shield 6/6', '1617824851693')
}
