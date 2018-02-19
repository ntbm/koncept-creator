const Network = require('./vis/Network')
const {parseJsonToVis} = require('./vis/parseJsonToVis')
const {parseVisToJson} = require('./vis/parseVisToJson')
const Options = require('./util/Options')
const debounce = require('./util/debounce')
const {
  connectionIsValid,
  getNodesById,
  getNodeChildrenAndParentById,
  applyInheritance,
  connectionValidator,
  nodeColor
} = require('./vis/manipulation')

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
  console.log(this.network.body.data.nodes.getDataSet())
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
      on_node_edit: this.options.on_node_edit.bind(this.network_util),
      on_edge_create: this.options.on_edge_create.bind(this.network_util),
      connectionIsValid: connectionIsValid.bind(this.network_util),
      getNodesById: getNodesById.bind(this.network_util),
      getNodeChildrenAndParentById: getNodeChildrenAndParentById.bind(this.network_util),
      connectionValidator: connectionValidator.bind(this.network_util),
      applyInheritance: applyInheritance.bind(this),
      applyPositionIds: applyPositionIds.bind(this),
      parseOnUpdate: debounce(() => {

        console.log('updateData', this)
      }, 250).bind(this),
      parseJsonToVis: parseJsonToVis.bind(this.network_util),
      nodeColor: nodeColor.bind(this.network_util),
      set_node_defaults: set_node_defaults.bind(this.network_util),
      parseVisToJson: parseVisToJson.bind(this),
      nodeShape: this.options.nodeShape,
      relationship_mapping: this.options.relationship_mapping,
      relationshipColors: this.options.relationshipColors
    })
    let data = this.network_util.parseJsonToVis(inputJson)
    let container = document.getElementById(this.options.network_container_id)
    if (this.options.batch_container_id) {
      this.batch_container = document.getElementById(this.options.batch_container_id)
    }

    if (this.options.editable) {
      function addNode (nodeData, callback) {
        this.network_util.on_node_create(nodeData, (_nodeData) => {
          if (!_nodeData.relationship) _nodeData.relationship = 0
          if (!_nodeData.shape) _nodeData.shape = this.network_util.nodeShape[_nodeData.type]
          if (!_nodeData.color) _nodeData.color = this.network_util.nodeColor(_nodeData.relationship)
          _nodeData.positionId = this.network_util.parseVisToJson().length
          callback(_nodeData)
        })
      }

      function editNode (nodeData, callback) {
        this.network_util.on_node_edit(nodeData, (_nodeData) => {
          if (!_nodeData.relationship) _nodeData.relationship = 0
          if (!_nodeData.shape) _nodeData.shape = this.network_util.nodeShape[_nodeData.type]
          if (!_nodeData.color) _nodeData.color = this.network_util.nodeColor(_nodeData.relationship)
          callback(_nodeData)
        })
      }

      function addEdge (edgeData, callback) {
        this.network_util.on_edge_create(
          edgeData,
          (_edgeData) => {
            this.network_util.connectionValidator(_edgeData, (validatedEdgeData) => {
              if (!validatedEdgeData) return callback(null)
              let jsonNetwork = this.network_util.parseVisToJson()
              let [from, to] = this.network_util.getNodesById(jsonNetwork, [edgeData.from, edgeData.to])
              this.network_util.applyInheritance(to, from, jsonNetwork)
              setTimeout(this.network_util.applyPositionIds, 249)
              callback(validatedEdgeData)
            })
          }
        )
      }

      Object.assign(this.options.visOptions.manipulation, {
        addNode: addNode.bind(this),
        editNode: editNode.bind(this),
        addEdge: addEdge.bind(this)
      })
    }
    this.network = new Network(container, data, this.options.visOptions)
    this.network.on('_dataUpdated',
      this.network_util.parseOnUpdate)
  }

  exportJSON () {
    return this.network_util.parseVisToJson()
  }
}

window
  .ConceptCreator = ConceptCreator
module
  .exports = ConceptCreator
