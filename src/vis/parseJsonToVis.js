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
  let {name, type="concept", relationship=0, meta, children, positionId='0'} = current_node
  let current = {
    label: name,
    id: (nodesArray.length || 0) + 1,
    type,
    meta,
    relationship,
    positionId
  }
  if (this.relationship_mapping[relationship] || this.relationship_mapping[relationship] === 0) {
    Object.assign(current, {
      relationship:this.relationship_mapping[relationship]
    })
  }
  if(parent){
    edgesArray.push({
      from: parent.id,
      to: current.id
    })
  }
  current.color = current.relationship === 0 ?
    (parent ? parent.color : this.nodeColor(0))
    : this.nodeColor(current.relationship)
  current.shape = this.nodeShape[type]
  nodesArray.push(current)
  if(children){
    children.forEach((node, index) => {
      Object.assign(node, {
        positionId: current.positionId + `_${index}`
      })
      let result = this.parseJsonNode(current, node, nodesArray, edgesArray)
      nodesArray = result.nodesArray
      edgesArray = result.edgesArray
    })
  }
  return {
    nodesArray,
    edgesArray
  }
}
