const FIGTHER = {
  name:'Fighter',
  hitPoints: 30,
  armorClass: 18,
  combatActions: [
    {name: 'Two Handed Sword', attackBonus: 6, damage: 10}
  ],
  skills: [
    {name: 'athletics', modifier: 4}, 
    {name: 'intimidation', modifier: 4}
  ]
}

const WIZARD = {
  name:'Wizard',
  hitPoints: 12,
  armorClass: 10,
  magicArmor: 13,
  spellSlot1: 3,
  spellSlot2: 6,
  combatActions: [
    {name: 'Staff', attackBonus: 2, damage: 3}, {name: 'Firebolt', damage: 20}, {name: 'Magic Shield', attackBonus: 2, damage: 3}
  ],
  skills: [
    {name: 'arcana', modifier: 4}, 
    {name: 'history', modifier: 4},
    {name: 'investigation', modifier: 4},
    {name: 'nature', modifier: 4},
    {name: 'religion', modifier: 4}
  ]
}

const ROGUE = {
  name:'Rogue',
  hitPoints: 20,
  armorClass: 15,
  combatActions: [
    {name: 'Dagger', attackBonus: 4, damage: 8}
  ],
  skills: [
    {name: 'acrobatics', modifier: 4}, 
    {name: 'sleight of hand', modifier: 4},
    {name: 'stealth', modifier: 4}, 
    {name: 'perception', modifier: 4}, 
    {name: 'survival', modifier: 4}, 
    {name: 'deception', modifier: 4}
  ]
}

const BARD = {
  name:'Bard',
  hitPoints: 20,
  armorClass: 15,
  combatActions: [
    {name: 'Crossbow', attackBonus: 4, damage: 5}
  ],
  skills: [
    {name: 'sleight of hand', modifier: 4}, 
    {name: 'deception', modifier: 4},
    {name: 'intimidation', modifier: 4},
    {name: 'performance', modifier: 4},
    {name: 'persuasion', modifier: 4}
  ]
}

function getCharacterClass() {
  return [FIGTHER.name, WIZARD.name, ROGUE.name, BARD.name]
}

function skillModifier(characterClass, skillName) {
  let modifierValue = 0
  switch (characterClass) {
    case FIGTHER.name:
      FIGTHER.skills.forEach( skill => {
        if ( skill.name === skillName.toLowerCase()) {
           modifierValue = skill.modifier
        }
      })
      break
    case WIZARD.name:
      WIZARD.skills.forEach( skill => {
        if ( skill.name === skillName.toLowerCase()) {
           modifierValue = skill.modifier
        }
      })
      break
    case ROGUE.name:
      ROGUE.skills.forEach( skill => {
        if ( skill.name === skillName.toLowerCase()) {
           modifierValue = skill.modifier
        }
      })
      break
    case BARD.name:
      BARD.skills.forEach( skill => {
        if ( skill.name === skillName.toLowerCase()) {
           modifierValue = skill.modifier
        }
      })
      break
  }
  return modifierValue
}

function getCombatActions(characterClass, rpgSessionId) {
  let combatActions = []

  switch (characterClass) {
    case FIGTHER.name:
      combatActions = FIGTHER.combatActions
      break
    case WIZARD.name:
      const character = findCharacter(rpgSessionId)
      combatActions = WIZARD.combatActions
        .filter(action => 
          action.name === 'Staff' ||
          (action.name === 'Firebolt' && character.spellSlot1 > 0) ||
          (action.name === 'Magic Shield' && character.spellSlot2 > 0)
        )
        .map(action => {
          return {
            name: action.name === 'Firebolt' ? `Firebolt ${character.spellSlot1}/${WIZARD.spellSlot1}` :  
              action.name === 'Magic Shield' ? `Magic Shield ${character.spellSlot2}/${WIZARD.spellSlot2}` : action.name,
            slots: action.name === 'Firebolt' ? character.spellSlot1 : action.name === 'Magic Shield' ? character.spellSlot2 : undefined
          }
        })
      break
    case ROGUE.name:
      combatActions = ROGUE.combatActions
      break
    case BARD.name:
      combatActions = BARD.combatActions
      break
  }
  return combatActions
}

function getCharacterClassByName(characterClassName) {
   let characterClass = {}
  switch (characterClassName) {
    case FIGTHER.name:
      characterClass = FIGTHER
      break
    case WIZARD.name:
      characterClass = WIZARD
      break
    case ROGUE.name:
      characterClass = ROGUE
      break
    case BARD.name:
      characterClass = BARD
      break
  }
  return characterClass
}