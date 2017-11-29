const Network = require("./vis/Network")
const {parseJsonToVis} = require("./vis/parseJsonToVis")
const {parseVisToJson} = require("./vis/parseVisToJson")
const Options = require("./util/Options")

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
