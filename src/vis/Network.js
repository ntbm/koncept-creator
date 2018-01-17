const vis = require("vis/dist/vis-network.min")

class Network extends vis.Network {
  constructor (container, data, visOptions) {
    super(container, data, visOptions)
    this.getAllNodesAndEdges = getAllNodesAndEdges.bind(this)
  }

}
function getAllNodesAndEdges () {
  let {nodes, edges} = this.body.data
  return {nodes, edges}
}

module.exports = Network