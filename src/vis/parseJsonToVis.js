const vis = require("vis/dist/vis-network.min.js")
const {nodeColor, nodeShape} = require('./stylingOfNodeAndEdges')

module.exports = {
  parseJsonToVis
}

function parseJsonToVis (data) {
  let {nodesArray, edgesArray} = parseJsonNode(null, data, [], [])
  return {
    nodes: new vis.DataSet(nodesArray),
    edges: new vis.DataSet(edgesArray)
  }
}
function parseJsonNode (parent, current_node, nodesArray, edgesArray) {
  let {name, type="concept", parent_relationship="inherit", meta, children} = current_node
  let current = {
    label: name,
    id: (nodesArray.length || 0) + 1,
    type,
    meta,
    parent_relationship
  }
  if(parent){
    if(current.parent_relationship === "inherit"){
      current.parent_relationship = parent.parent_relationship
    }
    edgesArray.push({
      from: parent.id,
      to: current.id
    })
  }
  current.color = nodeColor(current.parent_relationship)
  current.shape = nodeShape(type)
  nodesArray.push(current)
  if(children){
    for(let node of children){
      let result = parseJsonNode(current, node, nodesArray, edgesArray)
      nodesArray = result.nodesArray
      edgesArray = result.edgesArray
    }
  }
  return {
    nodesArray,
    edgesArray
  }
}
