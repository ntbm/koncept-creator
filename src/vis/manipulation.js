module.exports = {
  connectionIsValid,
  getNodesById,
  getNodeChildrenAndParentById,
  applyInheritance,
  connectionValidator,
  nodeColor,
  applyPositionIds

}

function nodeColor (relationship) {
  function int_to_hex (num) {
    let hex = Math.round(num).toString(16)
    if (hex.length === 1)
      hex = '0' + hex
    return hex
  }

  function blendColors (color1, color2, percentage) {
    if (color1.length === 4)
      color1 = color1[1] + color1[1] + color1[2] + color1[2] + color1[3] + color1[3]
    else
      color1 = color1.substring(1)
    if (color2.length === 4)
      color2 = color2[1] + color2[1] + color2[2] + color2[2] + color2[3] + color2[3]
    else
      color2 = color2.substring(1)
    color1 = [parseInt(color1[0] + color1[1], 16), parseInt(color1[2] + color1[3], 16), parseInt(color1[4] + color1[5], 16)]
    color2 = [parseInt(color2[0] + color2[1], 16), parseInt(color2[2] + color2[3], 16), parseInt(color2[4] + color2[5], 16)]

    let color3 = [
      (1 - percentage) * color1[0] + percentage * color2[0],
      (1 - percentage) * color1[1] + percentage * color2[1],
      (1 - percentage) * color1[2] + percentage * color2[2]
    ]
    return `#${int_to_hex(color3[0])}${int_to_hex(color3[1])}${int_to_hex(color3[2])}`
  }

  let relation = relationship
  let color = '#000'
  // parse relationship key to num
  if (this.relationship_mapping[relationship]) {
    relation = this.relationship_mapping[relationship]
  }
  if (relation === 0) {
    color = this.relationshipColors[0]
  }
  if (relation < 0 && relation >= -1) {
    color = blendColors('#fff', this.relationshipColors['-1'], Math.abs(relation))
  }
  if (relation > 0 && relation <= 1) {
    color = blendColors('#fff', this.relationshipColors['1'], relation)
  }
  return color
}

function connectionValidator (edgeData, callback) {
  //Check for valid network
  if (edgeData.from === edgeData.to) {
    callback(null)
    return
  }
  let jsonNetwork = this.parseVisToJson()
  let [from, to] = this.getNodesById(jsonNetwork, [edgeData.from, edgeData.to])
  if (this.connectionIsValid(from, to)) {
    return callback(edgeData)
  }
  return callback(null)
}

function applyInheritance (node, parent, jsonNetwork) {
  let relation = node.relationship
  if (this.network_util.relationship_mapping[node.relationship]) {
    relation = this.network_util.relationship_mapping[node.relationship]
  }
  if (relation === 0) {
    node.color = parent.color
    this.network.body.data.nodes.getDataSet().update(node)
    let {children} = this.network_util.getNodeChildrenAndParentById(jsonNetwork, node.id)
    if (children) {
      children.forEach(child => {
        this.network_util.applyInheritance(child, node, jsonNetwork)
      })
    }
  }
}

function applyPositionIds (jsonNetwork = this.network_util.parseVisToJson()) {
  const childrenPositionId = (node, _index, _positionId) => {
    let positionId = _positionId + `_${_index}`
    node.positionId = positionId
    this.network.body.data.nodes.getDataSet().update({id: node.id, positionId})
    node.children.forEach((child, index) => childrenPositionId(child, index, positionId))
  }
  jsonNetwork.forEach((node, index) => {
    if (index === 1) console.log(node)
    let positionId = `${index}`
    this.network.body.data.nodes.getDataSet().update({id: node.id, positionId})
    node.positionId = positionId
    node.children.forEach((child, index) => childrenPositionId(child, index, positionId))
  })
}

function getNodeChildrenAndParentById (_network, id, result) {
  let nextNetwork = new Array(0)
  let parentFound = false
  if (!result) {
    result = {parent: null, children: null}
  }
  _network.forEach(node => {
    node.children.forEach(child => {
      child.parent = node.id
      nextNetwork.push(child)
      if (child.id === id) {
        parentFound = true
        result.parent = node
      }
    })
    if (node.id === id) {
      result.children = node.children
    }
  })
  if (
    (!result.parent && result.children)
    || (!parentFound && result.parent)
  ) {
    return result
  } else {
    return this.getNodeChildrenAndParentById(nextNetwork, id, result)
  }
}

function connectionIsValid (from, to) {
  if (to.parent) {
    return false
  }
  if (from.type === 'term') {
    return false
  }
  //Check if from is child of to
  if (this.getNodesById([to], [from.id]).filter(i => i === 0).length === 0) {
    return false
  }
  return true
}

function getNodesById (_network, ids, result) {
  let nextNetwork = new Array(0)
  if (!result) {
    result = new Array(ids.length).fill(0)
  }
  _network.forEach(node => {
    ids.forEach((id, index) => {
      node.children.forEach(child => {
        child.parent = node.id
        nextNetwork.push(child)
      })
      if (node.id === id) {
        result[index] = node
      }
    })
  })
  let remaining = result.filter(i => i === 0)
  if ((remaining.length === 0) || nextNetwork.length === 0) {
    return result
  } else {
    return this.getNodesById(nextNetwork, ids, result)
  }
}