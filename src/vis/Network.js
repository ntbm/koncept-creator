const vis = require("vis/dist/vis-network.min")

class Network extends vis.Network {
  constructor (container, data, visOptions) {
    super(container, data, visOptions)
    this.getAllNodesAndEdges = getAllNodesAndEdges.bind(this)
    this.clear = clear.bind(this)
  }
}
function getAllNodesAndEdges () {
  let {nodes, edges} = this.body.data
  return {nodes, edges}
}
function clear () {
  this.setData({
    nodes: new vis.DataSet([]),
    edges: new vis.DataSet([])
  })
}
module.exports = Network