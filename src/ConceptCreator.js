const Network = require('./vis/Network')
const {parseJsonToVis, parseArrayToVis} = require('./vis/parseJsonToVis')
const {parseVisToJson} = require('./vis/parseVisToJson')
const Options = require('./util/Options')
const debounce = require('./util/debounce')
const {
  connectionIsValid,
  getNodesById,
  getNodeChildrenAndParentById,
  applyInheritance,
  connectionValidator,
  nodeColor,
  applyPositionIds,
  parseOnUpdate,
  handleTextUpdate
} = require('./vis/manipulation')

// TODO: What is this fucntion for?
function set_node_defaults (defaults) {
  this.node_defaults = defaults
}

/**
 * ConceptCreator class, it is the wrapper for the VisJS-rendering engine with it's own logic
 */
class ConceptCreator {
  /**
   * Constructor
   * @param options JSON object to configure Concept Network, keys are defined in Options.js
   * @param inputJson (optional) initial Network data
   */
  constructor (options, inputJson = {}) {
    // create Options
    this.options = new Options(options)
    // initialize fields
    this.network_util = {}
    this.batchText = ''

    // bind methods to instance and scope
    this.exportJSON = this.exportJSON.bind(this)
    this.onUpdate = this.onUpdate.bind(this)
    this.onSelect = this.onSelect.bind(this)

    // bind network_util functions to the right scope
    Object.assign(this.network_util, {
      on_node_create: this.options.on_node_create.bind(this.network_util),
      on_node_edit: this.options.on_node_edit.bind(this.network_util),
      on_edge_create: this.options.on_edge_create.bind(this.network_util),
      flexApi: this.options.flexApi.bind(this.network_util),
      flexApiCache: {},
      connectionIsValid: connectionIsValid.bind(this.network_util),
      getNodesById: getNodesById.bind(this.network_util),
      getNodeChildrenAndParentById: getNodeChildrenAndParentById.bind(this.network_util),
      connectionValidator: connectionValidator.bind(this.network_util),
      applyInheritance: applyInheritance.bind(this),
      applyPositionIds: applyPositionIds.bind(this),
      parseOnUpdate: debounce(parseOnUpdate.bind(this), 250),
      handleTextUpdate: debounce(handleTextUpdate.bind(this), 500),
      parseJsonToVis: parseJsonToVis.bind(this.network_util),
      parseArrayToVis: parseArrayToVis.bind(this.network_util),
      nodeColor: nodeColor.bind(this.network_util),
      set_node_defaults: set_node_defaults.bind(this.network_util),
      parseVisToJson: parseVisToJson.bind(this),
      nodeShape: this.options.nodeShape,
      relationship_mapping: this.options.relationship_mapping,
      relationshipColors: this.options.relationshipColors
    })

    // create right visOptions for manipulation of network
    if (this.options.editable) {
      // TODO extract functions to other file
      /**
       * Manipulation middleware for vis frame work
       * @param nodeData nodeData to be added
       * @param callback to pass modified nodeData
       */
      function addNode (nodeData, callback) {
        this.network_util.on_node_create(nodeData, (_nodeData) => {
          if (!_nodeData.relationship) _nodeData.relationship = 0
          if (!_nodeData.shape) _nodeData.shape = this.network_util.nodeShape[_nodeData.type]
          if (!_nodeData.color) _nodeData.color = this.network_util.nodeColor(_nodeData.relationship)
          _nodeData.positionId = this.network_util.parseVisToJson().length
          setTimeout(this.network_util.parseOnUpdate, 200)
          callback(_nodeData)
        })
      }

      /**
       * Manipulation middleware for vis frame work
       * @param nodeData nodeData to be edited
       * @param callback to pass modified nodeData
       */
      function editNode (nodeData, callback) {
        this.network_util.on_node_edit(nodeData, (_nodeData) => {
          if (!_nodeData.relationship) _nodeData.relationship = 0
          if (!_nodeData.shape) _nodeData.shape = this.network_util.nodeShape[_nodeData.type]
          if (!_nodeData.color) _nodeData.color = this.network_util.nodeColor(_nodeData.relationship)
          callback(_nodeData)
        })
      }

      /**
       * Manipulation middleware for vis frame work
       * @param edgeData edgeData to be added
       * @param callback to pass modified nodeData
       */
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

      // add middlewares to vis
      Object.assign(this.options.visOptions.manipulation, {
        addNode: addNode.bind(this),
        editNode: editNode.bind(this),
        addEdge: addEdge.bind(this)
      })

      // create eventlistners for the batch mode
      if (this.options.batch_container_id) {
        setTimeout(() => {
          document.getElementById(this.options.batch_container_id)
            .addEventListener('keyup',
              this.network_util.handleTextUpdate
            )
        }, 200)
        setTimeout(() => {
          document.getElementById(this.options.batch_container_id)
            .addEventListener('change',
              this.network_util.handleTextUpdate
            )
        }, 200)
      }
    }

    // create vis Network with the right options
    const data = this.network_util.parseJsonToVis(inputJson)
    const container = document.getElementById(this.options.network_container_id)
    this.network = new Network(container, data, this.options.visOptions)

    // bind and fire event listeners
    setTimeout(this.onUpdate, 200)
    this.network.on('_dataUpdated', this.onUpdate)
    this.network.on('select', this.onSelect)
    this.network.on('renderFlex', (args) => {
      // todo flex renderer
      console.log('renderFlex', args)
    })

  }

  /**
   * Node Select listener to node selections and display flex options
   */
  onSelect () {
    if (this.options.flex_container_id) {
      // target of select
      const nodeToShowFlex = this.network.getNodeById(this.network.getSelectedNodes()[0])
      // render target
      const flexContainer = document.getElementById(this.options.flex_container_id)
      // clean up previous selection
      while (flexContainer.firstChild) {
        flexContainer.removeChild(flexContainer.firstChild)
      }
      // return on empty selection
      if (!nodeToShowFlex) return

      // get flexOptions for selection from cache
      // TODO check for term/concept needed?
      const flexOptions = this.network_util.flexApiCache[nodeToShowFlex.label]

      /**
       * Builds html for input type select
       * @param id of the flexNode
       * @param label display name of flexForm
       * @param selected is option already selected
       * @param count occurrences in backend or something else
       * @returns {[checkboxElement, labelElement]} elements to render flexOption
       */
        // TODO refactor to other file?
      const flexSelectOption = (id, label, selected = false, count = null) => {
          // create checkbox element
          const checkboxElement = document.createElement('input')
          checkboxElement.setAttribute('type', 'checkbox')
          checkboxElement.setAttribute('value', label)
          if (selected) checkboxElement.setAttribute('selected', '')
          // bind emitter to handle options change
          checkboxElement.addEventListener('change', (event) => this.network.emit('renderFlex', {id, event}))

          // create label element
          const labelElement = document.createElement('label')
          labelElement.setAttribute('for', label)
          labelElement.innerText = `${label} ${count !== null ? count : ''}`
          return [checkboxElement, labelElement]
        }

      // render flexOptions
      flexOptions
        .map(({name, count = null}) => flexSelectOption(nodeToShowFlex.id, name, false, count))
        .forEach(([checkbox, label]) => {
          flexContainer.appendChild(checkbox)
          flexContainer.appendChild(label)
          flexContainer.appendChild(document.createElement('br'))
        })

    }
  }

  /**
   * Fired on Update of Network data, fetches new flex_api keys and parses data for batch container
   */
  onUpdate () {
    Promise.resolve()
      .then(() => {
        if (this.network_util.flexApi && typeof this.network_util.flexApi === 'function') {
          // check flex cache and load data if not present
          return Promise.all(
            this.network.body.data.nodes
              .getDataSet()
              .map(({label, type}) => {
                // flex Data already in cache
                if (this.network_util.flexApiCache[label]) {
                  return Promise.resolve(null)
                }
                // node type not selected for flexApi
                else if (this.options.flex_target && this.options.flex_target !== type) {
                  return Promise.resolve(null)
                }
                // get flex data and save to cache
                else {
                  return this.network_util.flexApi(label).then(res => {
                    this.network_util.flexApiCache[label] = res
                    return res
                  })
                }
              })
          )
        } else {
          return Promise.resolve([])
        }
      })
      .then(flexData => {
        // Check if flexData actually changed
        // TODO other event because cache change to rerender selected options?
        if (flexData.filter(item => item !== null).length !== 0) this.network.emit('renderFlex')
      })
      .then(this.network_util.parseOnUpdate)
  }

  /**
   * Export current network
   * @returns {*} JSON representation of Concept Network
   */
  exportJSON () {
    return this.network_util.parseVisToJson()
  }
}

window
  .ConceptCreator = ConceptCreator
module
  .exports = ConceptCreator
