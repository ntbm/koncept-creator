module.exports = class Options {
  constructor ({
                 network_container_id,
                 batch_container_id,
                 editable = true,
                 flexApi = null,
                 flex_container_id = null,
                 flex_target = null, // term | concept
                 on_node_create = _on_node_create,
                 on_node_edit = _on_node_edit,
                 on_edge_create = _on_edge_create,
                 relationshipColors = {},
                 relationship_mapping = {},
                 nodeShape = {},
                 visOptions = {}
               }) {
    this.network_container_id = network_container_id
    this.batch_container_id = batch_container_id
    this.on_node_create = on_node_create
    this.on_node_edit = on_node_edit
    this.on_edge_create = on_edge_create
    this.relationshipColors = Object.assign({
      '-1': '#B22222',
      '0': '#0000FF',
      '1': '#008000'
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
      manipulation: {
        enabled: false
      },
      edges: {
        arrows: {
          to: true
        }
      }
    }, visOptions)
    this.editable = editable
    this.flexApi = flexApi
    this.flex_container_id = flex_container_id
    this.flex_target = flex_target
  }
}

function _on_node_create (nodeData, callback) {
  nodeData.type = 'concept'
  nodeData.label = 'foobar'
  nodeData.relationship = 0
  callback(nodeData)
}

function _on_node_edit (nodeData, callback) {
  callback(nodeData)
}

function _on_edge_create (edgeData, callback) {
  // Set edgeData properties
  callback(edgeData)
}