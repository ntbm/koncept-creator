const Network = require("./Network")
const clean = require('../util/ConceptNode').clean

module.exports = {
  parseVisToJson
}

function parseVisToJson(network=this.network, cleanNodes=true) {
  if (!network instanceof Network){
    throw "input should be of type Network"
  }
  let {nodes, edges} = network.getAllNodesAndEdges()
  let childIds = edges.getDataSet().map(({to}) => to)
  let rootNodes = []
  nodes.getDataSet().forEach((node) => {
    if(!childIds.find((item) => item === node.id)){
      rootNodes.push(node)
    }
  })
  for(let rootNode of rootNodes){
    parseVisNode(rootNode, nodes, edges)
  }
  if (cleanNodes) {
    for (let _i in rootNodes) {
      rootNodes[_i] = clean(rootNodes[_i])
    }
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
  if (childNodes.length > 0) {
    rootNode.children = childNodes
    for(let node of rootNode.children){
      parseVisNode(node, nodes, edges)
    }
  }
}