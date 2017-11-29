const Network = require("src/vis/Network")
const {parseJsonToVis} = require("src/vis/parseJsonToVis")
const {parseVisToJson} = require("src/vis/parseVisToJson")
const Options = require("src/util/Options")

class ConceptC {
  constructor (options, inputJson={}) {
    this.options = new Options(options)
    let data = parseJsonToVis(inputJson)
    let container = document.getElementById(this.options.container_id);

    this.network = new Network(container, data, this.options.visOptions)
  }
  exportJSON(){
    return parseVisToJson(this.network)
  }
}


window.ConceptC = ConceptC
module.exports = ConceptC
