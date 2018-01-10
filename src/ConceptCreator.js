const Network = require('./vis/Network')
const {parseJsonToVis} = require('./vis/parseJsonToVis')
const {parseVisToJson} = require('./vis/parseVisToJson')
const {nodeShape} = require('./vis/stylingOfNodeAndEdges')
const Options = require('./util/Options')

class ConceptC {
  constructor (options, inputJson = {}) {
    this.options = new Options(options)
    let data = parseJsonToVis(inputJson)
    let container = document.getElementById(this.options.container_id)

    const addDialog = addAddNodeDialogElements.bind(this)
    const removeDialog = removeAddNodeDialogElements.bind(this)
    if (!this.options.editable) {} else {
      this.options.locale = 'en'
      this.options.visOptions.manipulation = {
        addNode: function (nodeData, callback) {
          addDialog()
          let dialogNode = document.getElementById('concept-dialog-container')
          dialogNode.querySelector('#button-confirm').onclick = () => {
            nodeData.label = dialogNode.querySelector('#input-name').value
            let type = dialogNode.querySelector('#select').value
            nodeData.shape = nodeShape(type)
            nodeData.type = type
            removeDialog()
            callback(nodeData)
          }
        },
        addEdge: (edgeData, callback) => {
          console.log(edgeData)
          if (edgeData.from === edgeData.to) {
            callback(null)
            return
          }
          // TODO refactor this block to another module
          let jsonNetwork = parseVisToJson(this.network)
          function getNodesById (_network, ids, result) {
            let nextNetwork = new Array(0)
            if (!result) {
              result = new Array(ids.length).fill(0)
            }
            _network.forEach(node => {
              ids.forEach((id, index) => {
                node.children.forEach( child => {
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
              return getNodesById(nextNetwork, ids, result)
            }
          }
          let [from, to] = getNodesById(jsonNetwork, [edgeData.from, edgeData.to])
          function connectionIsValid (from, to) {
            if(to.parent) {
              return false
            }
            if(from.type === 'term'){
              return false
            }
            //Check if from is child of to
            let stuff = getNodesById([to], [from.id]).filter(i => i === 0)
            if(stuff.length === 0){
              return false
            }
            return true
          }
          if (connectionIsValid(from, to)){
            callback(edgeData)
            return
          }else{
            // TODO Question: Test swapped connection, and apply if valid
            console.log('invalid')
          }
          callback(null)
        }
      }
    }
    this.network = new Network(container, data, this.options.visOptions)
  }
  exportJSON () {
    return parseVisToJson(this.network)
  }
}

function addAddNodeDialogElements () {
  // TODO only if not exists
  const dialogHtml = '<h1 id=\'title\'>Add Node</h1>' +
    '<input name=\'node-name\' id=\'input-name\'>' +
    '<br>' +
    '<select id=\'select\'>' +
    '<option value=\'term\'>term</option>' +
    '<option value=\'concept\' selected>concept</option>' +
    '</select>' +
    '<br>' +
    '<input type=\'button\' id=\'button-confirm\' value=\'Add\'>'

  let container = document.getElementById(this.options.container_id)
  let dialogNode = document.createElement('div')

  dialogNode.id = 'concept-dialog-container'
  // TODO proper styling
  dialogNode.style = {
    top: 0,
    left: 0
  }
  dialogNode.innerHTML = dialogHtml
  container.appendChild(dialogNode)
}

function removeAddNodeDialogElements () {
  let container = document.getElementById(this.options.container_id)
  container.removeChild(container.querySelector('#concept-dialog-container'))
}

window.ConceptC = ConceptC
module.exports = ConceptC
