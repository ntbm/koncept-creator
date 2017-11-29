const Network = require("src/vis/Network")

module.exports = {
  parseVisToJson
}

function parseVisToJson(network) {
  if (!network.isPrototypeOf(Network)){
    console.error("Invalid input")
    return
  }
  return []
}