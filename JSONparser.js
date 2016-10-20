let commaParser = (input) => (input[0] === ',') ? [null, input.slice(1)] : null
let spaceParser = (input) => input.match(/\S/) ? [null,input.slice(input.match(/\S/).index)] : null
let nullParser = (input) => input.startsWith('null')  ? [null, input.slice(4)] : null
let colonParser = (input) => input.match(/:/) ? [null, input.slice(input.match(/:/).index+1)] : null
let boolParser = (input) => input.startsWith('true') ? [true, input.slice(4)] :(input.startsWith('false') ? [false, input.slice(5)] : null)
let numberParser = (input, num = /^[-+]?(\d+(\.\d*)?|\.\d+)([e][+-]?\d+)?/i) => (input.match(num)) ? [parseFloat(input.match(num)[0]), input.slice(input.match(num)[0].length)] : null

let stringParser = (input, i = 1) => {
  if (!input.startsWith('"')) return null
  while (input[i] !== '"') (input[i] === '\\') ? i = i + 2 : i++
  return [input.substring(1, i), input.slice(i + 1)]
}

let arrayParser = (input) => {
  if (!input.startsWith('[')) return null
  input = input.slice(1)
  let arr = []
  while (true) {
    input = valueParser(spaceParser(input)[1])
    if (!input) return null
    arr.push(input[0])
    input = spaceParser(input[1])[1]
    let temp = commaParser(input)
    if (!temp) { break } input = temp[1]
  }
  return (input) ? [arr, input.slice(1)] : [arr,input]
}

let objectParser = (input) => {
  if (!input.startsWith('{')) return null
  let obj = {}
  input = input.slice(1)
  while (true) {
    input = stringParser(spaceParser(input)[1])
    if (!input) return null
    let [key, value] = input
    value = spaceParser(colonParser(value)[1])[1]
    value = valueParser(value)
    if (!value) return null
    obj[key] = value[0]
    input = spaceParser(value[1])[1]
    let temp = commaParser(input)
    if (!temp) { break } input = temp[1]
  }
  return (input) ? [obj, input.slice(1)] : [obj, input]
}

let anyOneParserFactory = (...parsers) =>  (input) => parsers.reduce((accum, parser) => accum ? accum : parser(input), null)
let inpStr = require('fs').readFileSync('example.json').toString()
let valueParser = anyOneParserFactory(nullParser, boolParser, numberParser, stringParser, objectParser, arrayParser)
let output = valueParser(inpStr)
output ? console.log(JSON.stringify(output[0], null, 2)) : console.log("Invalid JSON")
