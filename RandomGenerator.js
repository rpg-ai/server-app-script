const DONJON_URL = 'https://donjon.bin.sh/fantasy/random/rpc-fantasy.fcgi'

const LOCATION = 'Location'
const ENCOUNTER = 'Encounter'
const DEFAULT_QUANTITY = '10'

function randomGenerate(generationType, subtype) {

  let url = `${DONJON_URL}?type=${generationType}`

  switch(generationType) {
    case LOCATION:
      url = url.concat(`&loc_type=${subtype}`)
      break
    case ENCOUNTER:
      url = url.concat(`&enc_type=${subtype}`)
      break
    default:
      break
  }

  url = url.concat(`&n=${DEFAULT_QUANTITY}`)

  const urlEncoded  = encodeURI(url)
  const donjonResponse = UrlFetchApp.fetch(urlEncoded)

  // array of 10 elements of kind requested
  const generated = JSON.parse(donjonResponse.getContentText())

  // Saving the generated content
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('randomly_generated')
  sheet.appendRow([Date.now(), new Date().toLocaleString('pt-br'), String(generationType), String(subtype), JSON.stringify(generated)])

  const response = {}
  response.instruction = ''
  response.textToCopy = generated[Math.floor(Math.random() * 10)]

  return response
}
