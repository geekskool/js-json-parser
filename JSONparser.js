var inpStr = require('fs').readFileSync('example.txt').toString()
let output = jsonParser(inpStr)
output ? console.log(JSON.stringify(output[0], null, 2)) : console.log("Invalid JSON")
function jsonParser (input) {
  let parsedString
  input = spaceParser(input)[1]
  parsedString = nullParser(input)
  if (parsedString) return parsedString
  parsedString = boolParser(input)
  if (parsedString) return parsedString
  parsedString = numberParser(input)
  if (parsedString) return parsedString
  parsedString = stringParser(input)
  if (parsedString) return parsedString
  parsedString = objectParser(input)
  if (parsedString) return parsedString
  parsedString = arrayParser(input)
  if (parsedString) return parsedString
  return null
}
function commaParser (input) {
  return (input[0] === ',') ? [null, input.slice(1)] : null
}
function arrayParser (input) {
  if (!input.startsWith('[')) return null
  input = spaceParser(input.slice(1))[1]
  var arr = []
  while (true) {
    var temp = jsonParser(input)
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
function objectParser (input) {
  if (!input.startsWith('{')) return null
  let obj = {}
  input = spaceParser(input.slice(1))[1]
  while (true) {
    var temp = stringParser(input)
    if (!temp) return null
    var [key, value] = temp
    value = spaceParser(value)[1]
    if (value.startsWith(':')) value = value.slice(1)
    value = jsonParser(value)
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
function spaceParser (input) {
  return (input.match(/\S/)) ? [null,input.slice(input.indexOf(input.match(/\S/)))] : null
}
function nullParser (input) {
  return (input.startsWith(null) && !input[4].match(/[a-zA-Z0-9]+/gi)) ? [null, input.slice(4)] : null
}
function boolParser (input) {
  if (input.startsWith(true) && !input[4].match(/[a-zA-Z0-9]+/gi)) return [true, input.slice(4)]
  return (input.startsWith(false) && !input[5].match(/[a-zA-Z0-9]+/gi)) ? [false, input.slice(5)] : null
}
function numberParser (input) {
  var num = /^[-+]?(\d+(\.\d*)?|\.\d+)([e][+-]?\d+)?/i
  return (input.match(num)) ? [parseFloat(input.match(num)[0]), input.slice(input.match(num)[0].length)] : null
}
function stringParser (input) {
  if (!input.startsWith('"')) return null
  let i = 1
  while (input[i] !== '"') (input[i] === '\\') ? i = i + 2 : i++
  return [input.substring(1, i), input.slice(i + 1)]
}
