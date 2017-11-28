class ConceptC {
  constructor (options, inputJson) {
    this.options = options

    this.jsonModel = inputJson
    let {container_id, visOptions={}} = options
    let data = createNodesAndDataset(inputJson)
    let container = document.getElementById(container_id);

    this.visNetwork = new vis.Network(container, data, visOptions)
  }
}
function createNodesAndDataset (data) {
  let {nodesArray, edgesArray} = a(null, data, [], [])
  return {
    nodes: new vis.DataSet(nodesArray),
    edges: new vis.DataSet(edgesArray)
  }
}
function a (parent, current_node, nodesArray, edgesArray) {
  let {name, type="concept", parent_relationship="inherit", meta, children} = current_node
  let current = {
    label: name,
    id: (nodesArray.length || 0) + 1,
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
  nodesArray.push(current)
  if(current_node.children){
    for(let node of current_node.children){
      let result = a(current, node, nodesArray, edgesArray)
      nodesArray = result.nodesArray
      edgesArray = result.edgesArray
    }
  }
  return {
    nodesArray,
    edgesArray
  }
}

window.ConceptC = ConceptC