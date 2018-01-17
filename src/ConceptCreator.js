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

class ConceptCreator {
  constructor (options, inputJson = {}) {
    this.options = new Options(options)
    this.exportJSON = this.exportJSON.bind(this)
    this.network_util = {}
    Object.assign(this.network_util, {
      on_node_create: this.options.on_node_create.bind(this.network_util),
      on_edge_create: this.options.on_edge_create.bind(this.network_util),
      nodeShape: this.options.nodeShape,
      parent_relationship_mapping: this.options.relationship_mapping,
      relationshipColors: this.options.relationshipColors,
      parseVisToJson: parseVisToJson.bind(this),
      getNodesById: getNodesById.bind(this.network_util),
      connectionIsValid: connectionIsValid.bind(this.network_util),
      connectionValidator: connectionValidator.bind(this.network_util)
    })
    let data = parseJsonToVis(inputJson)
    let container = document.getElementById(this.options.network_container_id)

    if (this.options.editable) {
      function addNode (nodeData, callback) {
        this.network_util.on_node_create(nodeData, (_nodeData) => {
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
      this.options.visOptions.manipulation = {
        addNode: addNode.bind(this),
        addEdge: addEdge.bind(this)
      }
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
