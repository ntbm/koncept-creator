const Network = require("./Network")

module.exports = {
  parseVisToJson
}
// TODO clean JSON from vis data or add it for all
function parseVisToJson(network=this.network, clean=true) {
  if (!network instanceof Network){
    throw "input should be of type Network"
  }
  let {nodes, edges} = network.getAllNodesAndEdges()
  let childIds = edges.getDataSet().map(({to}) => to)
  let rootNodes = []
  nodes.getDataSet().forEach((node) => {
    if(!childIds.find((item) => item === node.id)){
      // TODO
      // Does not Work because the output is parsed by id, the
      // user has no interest in getting an id for this so think about it some more
      // if(clean) {
      //   delete node.color
      //   delete node.shape
      //   delete node.positionId
      //   delete node.id
      // }
      rootNodes.push(node)
    }
  })
  for(let rootNode of rootNodes){
    parseVisNode(rootNode, nodes, edges)
  }
  return rootNodes
}
function parseVisNode (rootNode, nodes, edges){
  let childIds = []
  edges.getDataSet().forEach(({from, to}) =>{
    if(from === rootNode.id){
      childIds.push(to)
    }
  })
  let childNodes = []
  nodes.getDataSet().forEach((childNode) => {
    if(childIds.find((item) => item === childNode.id)){
      childNodes.push(childNode)
    }
  })
  rootNode.children = childNodes
  for(let node of rootNode.children){
    parseVisNode(node, nodes, edges)
  }

}