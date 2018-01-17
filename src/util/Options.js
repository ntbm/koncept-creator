module.exports = class Options {
  constructor ({
                 network_container_id,
                 batch_container_id,
                 editable = true,
                 on_node_create = _on_node_create,
                 on_edge_create = _on_edge_create,
                 relationshipColors = {},
                 relationship_mapping = {},
                 nodeShape = {},
                 visOptions = {}
               }) {
    this.network_container_id = network_container_id
    this.batch_container_id = batch_container_id
    this.on_node_create = on_node_create.bind(this)
    this.on_edge_create = on_edge_create.bind(this)
    this.relationshipColors = Object.assign({
      '1': 'red',
      '0': 'blue',
      '-1': 'green'
    }, relationshipColors)
    this.relationship_mapping = Object.assign({
      'contradicts': -1,
      'maybe_contradicts': -0.5,
      'inherit': 0,
      'maybe_supports': 0.5,
      'supports': 1
    }, relationship_mapping)
    this.nodeShape = Object.assign({
      concept: 'box',
      term: 'ellipse'
    }, nodeShape)
    this.visOptions = Object.assign({
      edges: {
        arrows: {
          to: true
        }
      }
    }, visOptions)
    this.editable = editable
  }
}

function _on_node_create (nodeData, callback) {
  nodeData.type = 'concept'
  nodeData.label = 'foobar'
  nodeData.shape = this.nodeShape['concept']
  callback.bind(this)(nodeData)
}

function _on_edge_create (edgeData, callback) {
  // Set edgeData properties
  edgeData.relationship = 0
  callback(edgeData)
}