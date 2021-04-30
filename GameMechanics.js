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

  const currentScene = findScene(rpgSession.scene)

  const questScene = findQuestScene(currentScene.questSceneId)
  
  if (checkValue >= rpgSession.difficultyClass) {
    // AI Response
    response.textToCopy = `You roll a ${checkValue}.\n${generateText(`You are in ${questScene.place} ${questScene.secret} ${currentScene.text} You successfully ${rpgSession.lastAction} and`, 
      '', rpgSession.scene, NUMBER_OF_SENTENCES_ACTION)}`
  } else {
    // AI Response
    response.textToCopy = `You roll a ${checkValue}.\n${generateText(`You are in ${questScene.place} ${questScene.secret} ${currentScene.text} You fail to ${rpgSession.lastAction} and`, 
      '', rpgSession.scene, NUMBER_OF_SENTENCES_ACTION)}`
  }

  return response
}

function startGame(selectedClass, rpgSessionId) {

  saveCharacter(selectedClass, rpgSessionId)

  // 2 is always the first scene number
  const scene = findQuestScene(2)

  const quest = `The last of the Kai Lords assigns you the mission to take the legendary Moonstone to Elzian—the principal city of the jungle realm of Dessi. There you are to seek out Lord Rimoah at the Tower of Truth.`

  const gameSettings = `${quest}\nYou are in ${scene.place} ${scene.description}`

  return {
    instruction: '',
    textToCopy: gameSettings.concat('\n\nWhat do you do?'),
    nextScene: scene.nextSceneCondition,
    rpgSessionId,
    hitPoints: findCharacter(rpgSessionId).hitPoints,
    armorClass: getCharacterClassByName(selectedClass).armorClass
  }
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

  const playerCharacter = findCharacter(rpgSessionId)

  const charactherClass = getCharacterClassByName(playerCharacter.characterClass)

  // hardecoded figther attack action
  const combatAction = FIGTHER.combatActions.filter( action => actionName.includes(action.name))[0]

  const response = {} 

  const rpgSession = findSession(rpgSessionId)

  const currentScene = findScene(rpgSession.scene)

  const questScene = findQuestScene(currentScene.questSceneId)

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
      // AI Response
      const sucessDescription = generateText(`You are in ${questScene.place} ${questScene.secret} ${currentScene.text} You ${rpgSession.lastAction} and`, 
      '', rpgSession.scene, NUMBER_OF_SENTENCES_COMBAT)
    
      response.textToCopy = `You rolled a ${attackValue} in the attack rol. ${sucessDescription} Damage done is ${combatAction.damage}.\n\n`
      updateEnemy(enemy, rpgSessionId)

    } else {
      // AI Response
      const failureDescription = generateText(`You are in ${questScene.place} ${questScene.secret} ${currentScene.text} You fail to ${rpgSession.lastAction} and`, 
      '', rpgSession.scene, NUMBER_OF_SENTENCES_COMBAT)
      response.textToCopy = `You rolled a ${attackValue} in the attack rol. ${failureDescription}\n\n`
    }
  }

  // Check if the enemy died
  if ( enemy.hitPoints <= 0 ) {
    const enemyDeathDescription = generateText(`You are in ${questScene.place} ${questScene.secret} ${currentScene.text} He dies`, 
      '', rpgSession.scene, NUMBER_OF_SENTENCES_ACTION)
    response.textToCopy = response.textToCopy.concat(enemyDeathDescription)
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

  //response.combatActions = getCombatActions(charactherClass.name, rpgSessionId)

  if(enemyAttackValue < charactherClass.armorClass) {
    const enemyFailureDescription = generateText(`You are in ${questScene.place} ${questScene.secret} ${currentScene.text} He fails to hit you`, 
      '', rpgSession.scene, NUMBER_OF_SENTENCES_COMBAT)
    response.textToCopy = response.textToCopy.concat(enemyFailureDescription)

    return response
  }

  playerCharacter.hitPoints = playerCharacter.hitPoints - enemyByDifficulty.EASY.combatActions[0].damage

   const enemySuccessDescription = generateText(`You are in ${questScene.place} ${questScene.secret} ${currentScene.text} He hits you`, 
      '', rpgSession.scene, NUMBER_OF_SENTENCES_COMBAT)

  response.textToCopy = `${response.textToCopy} ${enemySuccessDescription} Damage taken is ${enemyByDifficulty.EASY.combatActions[0].damage}.\n\n`
  
  if(playerCharacter.hitPoints <= 0) {
    response.textToCopy = response.textToCopy.concat('You die. GAME OVER')
    //response.combatActions = []
  } else {
    response.textToCopy = `${response.textToCopy} You remaing hit points are ${playerCharacter.hitPoints}.`
  }

  updateCharacter(playerCharacter, rpgSessionId)
  return response
}