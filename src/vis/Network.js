const vis = require("vis/dist/vis-network.min")

class Network extends vis.Network {
  constructor (container, data, visOptions) {
    super(container, data, visOptions)
  }
  getAllNodesAndEdges () {
    let {nodes, edges} = this.body.data
    return {nodes, edges}
  }
}

module.exports = Network