const NUMBER_OF_SENTENCES = 3

function test(){
  console.log(generateText('The story starts in an abandoned room on the 3rd level of the Secret Temple of Souls. A group of demonic faces have been carved into the walls. You fail to search in the room for something valuable that he can sells later. Like precious jewels, items or weapons.'))
}

function generateTextWrap(seed){
  return {
    instruction: 'text generation by gpt2 API deepai.org',
    textToCopy: generateText(seed)
  }
}

function generateText(seed) {

  const apikey = 'quickstart-QUdJIGlzIGNvbWluZy4uLi4K'
  const url = 'https://api.deepai.org/api/text-generator'

  const options = {
    method: "post",
    headers: {
      "api-key": apikey
    },
    payload: {
      text: seed
    }
  }

  const deepaiResponse = UrlFetchApp.fetch(
    url, options
  );

  // See it in the Executions menu
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
