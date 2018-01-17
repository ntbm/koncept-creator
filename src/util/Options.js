module.exports = class Options {
  constructor ({
                 network_container_id,
                 batch_container_id,
                 editable = true,
                 on_node_create = on_node_create,
                 on_edge_create = on_edge_create,
                 relationshipColors = {},
                 parent_relationship_mapping = {},
                 nodeShape = {},
                 visOptions = {}
               }) {
    this.network_container_id = network_container_id
    this.batch_container_id = batch_container_id
    this.on_node_create = on_node_create
    this.on_edge_create = on_edge_create
    this.relationshipColors = Object.assign({
      '1': 'red',
      '0': 'blue',
      '-1': 'green'
    }, relationshipColors)
    this.parent_relationship_mapping = Object.assign({
      'contradicts': -1,
      'maybe_contradicts': -0.5,
      'inherit': 0,
      'maybe_supports': 0.5,
      'supports': 1
    }, parent_relationship_mapping)
    this.nodeShape = Object.assign({
      concept: 'box',
      term: 'ellipse'
    }, nodeShape)
    this.visOptions = Object.assign({}, visOptions)
    this.editable = editable
  }
}

function on_node_create (nodeData, callback) {
  nodeData.type = 'concept'
  nodeData.label = 'foobar'
  nodeData.shape = this.nodeShape['concept']
  callback(nodeData)
}

function on_edge_create (edgeData, callback) {
  edgeData.relationship = 0
  if (this.connectionIsValid(edgeData)) {
    return callback(edgeData)
  }
  return callback(null)
}