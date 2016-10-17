let commaParser = (input) => (input[0] === ',') ? [null, input.slice(1)] : null
let spaceParser = (input) => (input.match(/\S/)) ? [null,input.slice(input.indexOf(input.match(/\S/)))] : null
let nullParser = (input) => (input.startsWith(null) && (input[4] === undefined || !input[4].match(/[a-zA-Z0-9]+/gi))) ? [null, input.slice(4)] : null

let boolParser = (input) => {
  if (input.startsWith(true) && (input[4] === undefined || !input[4].match(/[a-zA-Z0-9]+/gi))) return [true, input.slice(4)]
  return (input.startsWith(false) && (input[5] === undefined || !input[5].match(/[a-zA-Z0-9]+/gi))) ? [false, input.slice(5)] : null
}

let numberParser = (input) => {
  var num = /^[-+]?(\d+(\.\d*)?|\.\d+)([e][+-]?\d+)?/i
  return (input.match(num)) ? [parseFloat(input.match(num)[0]), input.slice(input.match(num)[0].length)] : null
}

let stringParser = (input) => {
  if (!input.startsWith('"')) return null
  let i = 1
  while (input[i] !== '"') (input[i] === '\\') ? i = i + 2 : i++
  return [input.substring(1, i), input.slice(i + 1)]
}

let arrayParser = (input) => {
  if (!input.startsWith('[')) return null
  input = spaceParser(input.slice(1))[1]
  var arr = []
  while (true) {
    var temp = anyOneParser(input)
    if (!temp) return null
    arr.push(temp[0])
    input = spaceParser(temp[1])[1]
    if (input.startsWith(']')) break
    input = commaParser(input)
    if (!input) break
    input = input[1]
  }
  return (input) ? [arr, input.slice(1)] : [arr,input]
}

let objectParser = (input) => {
  if (!input.startsWith('{')) return null
  let obj = {}
  input = spaceParser(input.slice(1))[1]
  while (true) {
    var temp = stringParser(input)
    if (!temp) return null
    var [key, value] = temp
    value = spaceParser(value)[1]
    if (value.startsWith(':')) value = value.slice(1)
    value = anyOneParser(value)
    if (!value) return null
    obj[key] = value[0]
    input = spaceParser(value[1])[1]
    if (input.startsWith('}')) break
    let temp2 = commaParser(input)
    if (!temp2) break
    input = spaceParser(temp2[1])[1]
  }
  return (input) ? [obj, input.slice(1)] : [obj, input]
}

let jsonParser = (parsers) => {
  return function(input) {
      for (let i = 0; i < parsers.length; i++){
      input = spaceParser(input)[1]
      let res = parsers[i](input)
      if (res) return res
    }
    return null
  }
}

var inpStr = require('fs').readFileSync('example.txt').toString()
var anyOneParser = jsonParser([nullParser, boolParser, numberParser, stringParser, objectParser, arrayParser])
let output = anyOneParser(inpStr)
output ? console.log(JSON.stringify(output[0], null, 2)) : console.log("Invalid JSON")
