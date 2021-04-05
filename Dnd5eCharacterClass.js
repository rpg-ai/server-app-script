const FIGTHER = {
  name:'Figther',
  skills: [
    {name: 'athletics', modifier: 4}, 
    {name: 'intimidation', modifier: 4}
  ]
}

const WIZARD = {
  name:'Wizard',
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