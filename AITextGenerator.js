const DEEPAI_API_URL = 'https://api.deepai.org/api/text-generator'
const DEEPAI_API_KEY = 'e3bb9547-1d82-4ab9-9b96-031bef9f08d9'

const NUMBER_OF_SENTENCES = 1

function generateTextWrap(seed){
  return {
    instruction: 'text generation by gpt2 API deepai.org',
    textToCopy: generateText(seed)
  }
}

function generateText(seed) {

  const options = {
    method: "post",
    headers: {
      "api-key": DEEPAI_API_KEY
    },
    payload: {
      text: seed
    }
  }

  // See it in the Executions menu
  Logger.log('seed text: ' + seed)

  const deepaiResponse = UrlFetchApp.fetch(
    DEEPAI_API_URL, options
  );

  Logger.log(deepaiResponse)
  
  const responseJson = JSON.parse(deepaiResponse.getContentText())
  
  // RegExp for splitting text into sentences and keeping the delimiter
  const seedSentences = seed.match( /[^\.!\?]+[\.!\?]+/g )
  const outputSentences = responseJson.output.match( /[^\.!\?]+[\.!\?]+/g )
  
  let myResponse = ''

  /* The deepai API returns a lof of text that contains the seed text. So we separate the text in sentences to get 
    the NUMBER OF SENTENCES after the seed sentences
   */
  outputSentences
    .filter((sentence, index) => index >= seedSentences.length && index < (seedSentences.length + NUMBER_OF_SENTENCES))
    .forEach(sentence => myResponse = myResponse.concat(sentence))
  
  return myResponse.trim()
}

function test(){
  generateText('Linarv fails to jump the open pit trap.')
}
