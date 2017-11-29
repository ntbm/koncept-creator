const vis = require("vis/dist/vis-network.min.js")
const {createNodesAndDataset} = require("./vis/parseJsonToVis")

class ConceptC {
  constructor (options, inputJson={}) {
    this.options = new Options(options)
    let data = createNodesAndDataset(inputJson)
    let container = document.getElementById(this.options.container_id);
    this.visNetwork = new vis.Network(container, data, this.options.visOptions)
  }
}
class Options {
  constructor (optionsObj) {
    let {
      container_id,
      visOptions={}
    } = optionsObj
    this.container_id = container_id
    this.visOptions = visOptions
  }
}
window.ConceptC = ConceptC