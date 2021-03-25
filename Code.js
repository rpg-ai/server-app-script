function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}

function messageController(form) {
  const message = form.playerAction
  return processMessage(message)
}

function generatorController(generationType, subtype) {
  return randomGenerate(generationType, subtype)
}

function textGenerateController(form) {
  return generateTextWrap(form.textSeed)
}