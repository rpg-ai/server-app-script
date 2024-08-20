const DEEPAI_API_URL = 'https://api.deepai.org/api/text-generator'
const DEEPAI_API_KEY = ''

const OPENAI_API_URL = 'https://api.openai.com/v1/engines/davinci/completions'
const OPENAI_API_KEY = ''
const OPENAI_API_KEY_2 = ''

const NUMBER_OF_SENTENCES_SPEAK = 3
const NUMBER_OF_SENTENCES_ACTION = 3
const NUMBER_OF_SENTENCES_COMBAT = 1


function generateTextWrap(seed){
  return {
    instruction: 'text generation by gpt2 API deepai.org',
    textToCopy: generateText(seed)
  }
}

// Used to complete new location
function completeText(seed) {

  payloadJson = JSON.stringify({
    prompt: seed,
    max_tokens: 100, // which are the chunks of text that the API generates one at a time
    echo: true //  concatenate the prompt and the completion text
  })

  const options = {
    method: "post",
    headers: {
      "Authorization": "Bearer " + OPENAI_API_KEY_2,
      "Content-Type": "application/json"
    },
    payload: payloadJson
  }

  const openaiResponse = UrlFetchApp.fetch(
    OPENAI_API_URL, options
  );

  Logger.log(openaiResponse)

  const responseJson = JSON.parse(openaiResponse.getContentText())
  
  // RegExp for splitting text into sentences and keeping the delimiter
  const seedSentences = seed.match( /[^\.!\?]+[\.!\?]+/g )
  const outputSentences = responseJson.choices[0].text.match( /[^\.!\?]+[\.!\?]+/g )
  
  let myResponse = ''

  /* The deepai API returns a lof of text that contains the seed text. So we separate the text in sentences to get 
    the NUMBER OF SENTENCES after the seed sentences
   */
  outputSentences
    .filter((sentence, index) => index < (seedSentences.length + NUMBER_OF_SENTENCES_ACTION))
    .forEach(sentence => myResponse = myResponse.concat(sentence))
  
  return myResponse.trim()
}

function generateText(seed, playerMessage, sceneId, numberOfSetences, label, userId) {

  seed = `${seed} ${playerMessage}`.trim()

  payloadJson = JSON.stringify({
    prompt: seed,
    max_tokens: 100, // which are the chunks of text that the API generates one at a time
    echo: true //  concatenate the prompt and the completion text
  })

  const options = {
    method: "post",
    headers: {
      "Authorization": "Bearer " + OPENAI_API_KEY_2,
      "Content-Type": "application/json"
    },
    payload: payloadJson
  }

  const openaiResponse = UrlFetchApp.fetch(
    OPENAI_API_URL, options
  );

  const responseJson = JSON.parse(openaiResponse.getContentText())

  saveGeneratedText({
    id: responseJson.id,
    createdAt: responseJson.created,
    model: responseJson.model,
    inputText: seed,
    outputText: responseJson.choices[0].text,
    sceneId,
    label,
    userId
  })
  
  // RegExp for splitting text into sentences and keeping the delimiter
  const seedSentences = seed.match( /[^\.!\?]+[\.!\?]+/g )
  //const outputSentences = responseJson.output.match( /[^\.!\?]+[\.!\?]+/g )
  const outputSentences = responseJson.choices[0].text.match( /[^\.!\?]+[\.!\?]+/g )


  let myResponse = ''

  /* The API returns a lof of text that contains the seed text. So we separate the text in sentences to get 
    the NUMBER OF SENTENCES after the seed sentences
   */
  outputSentences
    .filter((sentence, index) => index >= seedSentences.length && index < (seedSentences.length + numberOfSetences))
    .forEach(sentence => myResponse = myResponse.concat(sentence))

  const scene = findScene(sceneId)

  updateScene(`${scene.text} ${playerMessage} ${myResponse.trim()}`, sceneId, `${scene.description} ${playerMessage} ${myResponse.trim()}`)
  
  return {
    messageId: responseJson.id,
    trim: myResponse.trim()
  }
}
