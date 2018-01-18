const Network = require('./vis/Network')
const {parseJsonToVis} = require('./vis/parseJsonToVis')
const {parseVisToJson} = require('./vis/parseVisToJson')
const Options = require('./util/Options')

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

function nodeColor (relationship) {
  function int_to_hex(num)
  {
    var hex = Math.round(num).toString(16);
    if (hex.length == 1)
      hex = '0' + hex;
    return hex;
  }
  function blendColors (color1, color2, percentage) {
    if (color1.length == 4)
      color1 = color1[1] + color1[1] + color1[2] + color1[2] + color1[3] + color1[3]
    else
      color1 = color1.substring(1)
    if (color2.length == 4)
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
  if (relation === 0){
    color = this.relationshipColors[0]
  }
  if (relation < 0 && relation >= -1){
    color = blendColors('#fff', this.relationshipColors['-1'], Math.abs(relation))
  }
  if (relation > 0 && relation <= 1){
    color = blendColors('#fff', this.relationshipColors['1'], relation)
  }
  return color
}
function set_node_defaults (defaults) {
  this.node_defaults = defaults
}
class ConceptCreator {
  constructor (options, inputJson = {}) {
    this.options = new Options(options)
    this.exportJSON = this.exportJSON.bind(this)
    this.network_util = {}
    Object.assign(this.network_util, {
      on_node_create: this.options.on_node_create.bind(this.network_util),
      on_edge_create: this.options.on_edge_create.bind(this.network_util),
      connectionIsValid: connectionIsValid.bind(this.network_util),
      getNodesById: getNodesById.bind(this.network_util),
      connectionValidator: connectionValidator.bind(this.network_util),
      parseJsonToVis: parseJsonToVis.bind(this.network_util),
      nodeColor: nodeColor.bind(this.network_util),
      set_node_defaults: set_node_defaults.bind(this.network_util),
      node_defaults: {},
      parseVisToJson: parseVisToJson.bind(this),
      nodeShape: this.options.nodeShape,
      relationship_mapping: this.options.relationship_mapping,
      relationshipColors: this.options.relationshipColors
    })
    let data = this.network_util.parseJsonToVis(inputJson)
    let container = document.getElementById(this.options.network_container_id)

    if (this.options.editable) {
      function addNode (nodeData, callback) {
        this.network_util.on_node_create(nodeData, (_nodeData) => {
          if(!_nodeData.relationship) _nodeData.relationship = 0
          if(!_nodeData.shape) _nodeData.shape = this.network_util.nodeShape[_nodeData.type]
          if(!_nodeData.color) _nodeData.color = this.network_util.nodeColor(_nodeData.relationship)
          callback(_nodeData)
        })
      }

      function addEdge (edgeData, callback) {
        this.network_util.on_edge_create(
          edgeData,
          (_edgeData) => {
            this.network_util.connectionValidator(_edgeData, callback)
          }
        )
      }

      Object.assign(this.options.visOptions.manipulation, {
        addNode: addNode.bind(this),
        addEdge: addEdge.bind(this)
      })
    }
    this.network = new Network(container, data, this.options.visOptions)
  }

  exportJSON () {
    return this.network_util.parseVisToJson()
  }
}

window
  .ConceptCreator = ConceptCreator
module
  .exports = ConceptCreator
