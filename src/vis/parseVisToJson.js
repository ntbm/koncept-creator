const Network = require("./Network")

module.exports = {
  parseVisToJson
}

function parseVisToJson(network) {
  if (!network instanceof Network){
    throw "input should be of type Network"
  }
  let {nodes, edges} = network.getAllNodesAndEdges()
  let childrenIds = edges.getDataSet().map(({to}) => to)
  let rootNodes = []
  nodes.getDataSet().forEach((node) => {
    if(!childrenIds.find((item) => item === node.id)){
      rootNodes.push(node)
    }
  })
  for(let rootNode of rootNodes){
    parseVisNode(rootNode, nodes, edges)
  }
  return rootNodes
}
function parseVisNode (rootNode, nodes, edges){
  let childrenIds = []
  edges.getDataSet().forEach(({from, to}) =>{
    if(from === rootNode.id){
      childrenIds.push(to)
    }
  })
  let childrendNodes = []
  nodes.getDataSet().forEach((childNode) => {
    if(childrenIds.find((item) => item === childNode.id)){
      childrendNodes.push(childNode)
    }
  })
  rootNode.children = childrendNodes
  for(let node of rootNode.children){
    parseVisNode(node, nodes, edges)
  }

}