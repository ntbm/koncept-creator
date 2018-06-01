const vis = require("vis/dist/vis-network.min")

class Network extends vis.Network {
  constructor (container, data, visOptions) {
    super(container, data, visOptions)
    this.getAllNodesAndEdges = getAllNodesAndEdges.bind(this)
    this.clear = clear.bind(this)
    this.getNodeById = getNodeById.bind(this)
  }
}
function getAllNodesAndEdges () {
  let nodes = this.body.data.nodes.getDataSet()
  let edges = this.body.data.edges.getDataSet()
  return {nodes, edges}
}
function clear () {
  this.setData({
    nodes: new vis.DataSet([]),
    edges: new vis.DataSet([])
  })
}
function getNodeById (_id) {
  if (!_id) return null
  return this.body.data.nodes
    .getDataSet()
    .map(node => node)
    .find(({id}) => id === _id)
}

module.exports = Network