const vis = require("vis/dist/vis-network.min.js")

module.exports = {
  parseJsonToVis
}

function parseJsonToVis (data) {
  this.parseJsonNode  = parseJsonNode.bind(this)
  let {nodesArray, edgesArray} = this.parseJsonNode(null, data, [], [])

  return {
    nodes: new vis.DataSet(nodesArray),
    edges: new vis.DataSet(edgesArray)
  }
}
function parseJsonNode (parent, current_node, nodesArray, edgesArray) {
  let {name, type="concept", relationship="inherit", meta, children} = current_node
  let current = {
    label: name,
    id: (nodesArray.length || 0) + 1,
    type,
    meta,
    relationship
  }
  if (this.relationship_mapping[relationship] || this.relationship_mapping[relationship] === 0) {
    Object.assign(current, {
      relationship:this.relationship_mapping[relationship]
    })
  }
  if(parent){
    if(current.relationship===0){
      current.relationship = parent.relationship || 0
    }
    edgesArray.push({
      from: parent.id,
      to: current.id
    })
  }
  current.color = this.nodeColor(current.relationship) //todo this
  console.log(current.color, current.relationship) //todo this
  current.shape = this.nodeShape[type] //todo this
  nodesArray.push(current)
  if(children){
    for(let node of children){
      let result = this.parseJsonNode(current, node, nodesArray, edgesArray)
      nodesArray = result.nodesArray
      edgesArray = result.edgesArray
    }
  }
  return {
    nodesArray,
    edgesArray
  }
}
