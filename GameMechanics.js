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

const sessionType = {
  RANDOM: 'random',
  VOYAGE_OF_THE_MOONSTONE: 'moonstone'
}

function dice(diceType){
  return Math.floor(Math.random() * diceType) + 1
}

function processCheck(checkValue, rpgSessionId) {

  const response = {}
  response.instruction = ''

  const rpgSession = findSession(rpgSessionId)

  const currentScene = findScene(rpgSession.scene)

  const questScene = findQuestScene(currentScene.questSceneId, rpgSession.type, rpgSessionId)
  
  if (checkValue >= rpgSession.difficultyClass) {
    // AI Response
    const aiResponse = generateText(`You are in ${questScene.place} ${questScene.secret} ${currentScene.text} You successfully ${rpgSession.lastAction} and`, 
      '', rpgSession.scene, NUMBER_OF_SENTENCES_ACTION, messageType.ACTION, rpgSession.userId)
    response.textToCopy = `You roll a ${checkValue}.\n${aiResponse.trim}`
    response.messageId = aiResponse.messageId;
  } else {
    // AI Response
    const aiResponse = generateText(`You are in ${questScene.place} ${questScene.secret} ${currentScene.text} You fail to ${rpgSession.lastAction} and`, 
      '', rpgSession.scene, NUMBER_OF_SENTENCES_ACTION, messageType.ACTION, rpgSession.userId)
    response.textToCopy = `You roll a ${checkValue}.\n${aiResponse.trim}`
    response.messageId = aiResponse.messageId;
  }

  return response
}

function startGame(selectedClass, userId, currentSessionType) {

  const rpgSessionId = Date.now()

  saveCharacter(selectedClass, rpgSessionId)

  const questScene = newScene(rpgSessionId, FIRST_SCENE_ID, currentSessionType)

  const sceneId =  saveScene({
    rpgSessionId, userId, text: questScene.encounter, questSceneId: FIRST_SCENE_ID, description: questScene.description
  })

  session = {
    rpgSessionId, 
    startedOn: new Date().toLocaleString('pt-br'),
    quest: String(questScene.quest),
    difficultyClass: difficultyClass(),
    sceneId,
    userId,
    type: currentSessionType
  }

  // Saving the game
  saveSession(session)

  const gameSettings = `${questScene.description}`

  return {
    instruction: '',
    textToCopy: gameSettings.concat('\n\nWhat do you do?'),
    nextScene: questScene.nextSceneCondition,
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

  let currentScene = findScene(rpgSession.scene)

  const questScene = findQuestScene(currentScene.questSceneId, rpgSession.type, rpgSessionId)

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
      '', rpgSession.scene, NUMBER_OF_SENTENCES_COMBAT, messageType.ATTACK, rpgSession.userId)
    
      response.textToCopy = `You rolled a ${attackValue} in the attack rol. ${sucessDescription.trim} Damage done is ${combatAction.damage}.\n\n`
      response.messageId = sucessDescription.messageId;
      updateEnemy(enemy, rpgSessionId)

    } else {
      // AI Response
      const failureDescription = generateText(`You are in ${questScene.place} ${questScene.secret} ${currentScene.text} You fail to ${rpgSession.lastAction} and`, 
      '', rpgSession.scene, NUMBER_OF_SENTENCES_COMBAT, messageType.ATTACK, rpgSession.userId)
      response.textToCopy = `You rolled a ${attackValue} in the attack rol. ${failureDescription.trim}\n\n`
      response.messageId = failureDescription.messageId;
    }
    currentScene = findScene(rpgSession.scene)
  }

  // Check if the enemy died
  if ( enemy.hitPoints <= 0 ) {
    const enemyDeathDescription = generateText(`You are in ${questScene.place} ${questScene.secret} ${currentScene.text} He dies`, 
      '', rpgSession.scene, NUMBER_OF_SENTENCES_ACTION, messageType.ATTACK, rpgSession.userId)
    response.textToCopy = response.textToCopy.concat(enemyDeathDescription.trim)
    response.messageId = enemyDeathDescription.messageId;
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
      '', rpgSession.scene, NUMBER_OF_SENTENCES_COMBAT, messageType.ATTACK, rpgSession.userId)
    response.textToCopy = response.textToCopy.concat(enemyFailureDescription.trim)
    response.messageId = enemyFailureDescription.messageId;

    return response
  }

  playerCharacter.hitPoints = playerCharacter.hitPoints - enemyByDifficulty.EASY.combatActions[0].damage

   const enemySuccessDescription = generateText(`You are in ${questScene.place} ${questScene.secret} ${currentScene.text} He hits you`, 
      '', rpgSession.scene, NUMBER_OF_SENTENCES_COMBAT, messageType.ATTACK, rpgSession.userId)

  response.textToCopy = `${response.textToCopy} ${enemySuccessDescription.trim} Damage taken is ${enemyByDifficulty.EASY.combatActions[0].damage}.\n\n`
  response.messageId = enemySuccessDescription.messageId;

  if(playerCharacter.hitPoints <= 0) {
    response.textToCopy = response.textToCopy.concat('You die. GAME OVER')
    //response.combatActions = []
  } else {
    response.textToCopy = `${response.textToCopy} You remaing hit points are ${playerCharacter.hitPoints}.`
    response.hitPoints = playerCharacter.hitPoints;
  }

  updateCharacter(playerCharacter, rpgSessionId)
  return response
}

function continueGame(userId) {

  const user = findUser(userId)
  const scene = findScene(user.lastSceneId)
  const rpgSession = findSession(scene.rpgSessionId)

  return {
    textToCopy: scene.description.concat('\n\nWhat do you do?'),
    nextScene: findQuestScene(scene.questSceneId, rpgSession.type, scene.rpgSessionId).nextSceneCondition,
    rpgSessionId: scene.rpgSessionId,
    hitPoints: findCharacter(scene.rpgSessionId).hitPoints,
    armorClass: getCharacterClassByName(FIGTHER.name).armorClass
  }

}

function newScene(rpgSessionId, sceneNumber, currentSessionType) {

  let scene = {}

  if (currentSessionType === sessionType.RANDOM ) {
    
    // the quest is generated and completed by AI only in the first scene
    scene.quest = sceneNumber === FIRST_SCENE_ID ? completeText(randomGenerate(QUEST, '')) : ''
    
    // from the second scene from awards, the place is being completed with AI text
    scene.place = sceneNumber === FIRST_SCENE_ID ? toLowerCaseFirstLetter(randomGenerate(LOCATION, '')) : 
      completeText(toLowerCaseFirstLetter(randomGenerate(LOCATION, '')))

    scene.encounter = randomGenerate(ENCOUNTER, DUNGEON)
    scene.description = `${scene.quest} You are in ${scene.place} ${scene.encounter}`
    scene.rpgSessionId = rpgSessionId
    scene.sceneNumber = sceneNumber

    saveGeneratedScene(scene)

  } else {
    scene = findQuestScene(sceneNumber, currentSessionType)
  }

  return scene
}