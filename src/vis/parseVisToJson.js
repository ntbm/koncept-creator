const Network = require("./Network")
const clean = require('../util/ConceptNode').clean

module.exports = {
  parseVisToJson
}

/**
 * Takes the visJS Network and maps it to the Concept JSON Representation
 * @param network Instance of the Network to parse
 * @param cleanNodes if true removes all aditional visJS Data from the result _defautl: true_
 * @returns {Array} Json Array Representation of the Network
 */
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

/**
 * Non-Pure function to modify the input data. Takes in the flat VIS JS data structure and modifies it to a tree like structure
 * @param rootNode Start Node
 * @param nodes List of Nodes in this context
 * @param edges Edges between the nodes
 */
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