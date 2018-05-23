const debounce = require('../util/debounce')

module.exports = {
  connectionIsValid,
  getNodesById,
  getNodeChildrenAndParentById,
  applyInheritance,
  connectionValidator,
  nodeColor,
  applyPositionIds,
  parseOnUpdate,
  parseNetworkToText,
  handleTextUpdate
}

/**
 * Triggered on Text change
 * If there is an valid Update on the Text it will apply it to the Network
 */
function handleTextUpdate () {
  const inValidInput = () => {
    // TODO
    console.log('invalid input')
  }
  const lineValidator = (valid, line) => {
    const validLine = /^-*[\w\s]+:(concept|term):-?(0[.]?\d*|1)$/
    line = line.trim()
    if (line === '') return valid
    return valid && !!validLine.exec(line)
  }
  // Parses every line to node data and checks if Child Parent Relationship is valid
  const mapLinesToNodeDataAndCheckValidity = (textLines) =>
    textLines.reduce(({lines, lastPositionId, valid}, line, index) => {
      if (!valid) return {lines, lastPositionId, valid}
      // Empty Line Check
      if (line.trim() === '') {
        lines.push(null)
        return {lines, lastPositionId, valid}
      }

      // Check if valid child or brother
      const positionDepth = (line.match(/^-*/g)[0].split('')).length
      if ((lastPositionId.length === 0 && positionDepth !== 0)
        || (positionDepth - lastPositionId.length > 1)) {
        return {lines, lastPositionId, valid: false}
      }
      // Count up Position Id
      let newPositionId = lastPositionId.slice(0, positionDepth + 1)
      newPositionId[positionDepth] =
        newPositionId[positionDepth] === undefined ? 0 : newPositionId[positionDepth] + 1

      // Parse Data from line
      const [label, type, relationship] = line.slice(positionDepth).split(':')
      lines.push({label, type, relationship, positionId: newPositionId.join('_'), index})
      return {lines, lastPositionId: newPositionId, valid}
    }, {lines: [], lastPositionId: [], valid: true})
  // Reduce Helper to find maximum equal line
  const lineMatcher = (oldTextLines) => ([matchIndex, count], line, index) => {
    if (index - 1 !== matchIndex) return [index, count]
    if (line === oldTextLines[index]) return [matchIndex, count + 1]
    return [matchIndex, count]
  }

  const getMinimumChangeDepth = (nodeDataLines) =>
    nodeDataLines.reduce(([_depth, _position], line) => {
      if (!line) return [_depth, _position]
      const pIds = line.positionId.split('_').map((item) => parseInt(item))
      const depth = pIds.length

      return [
        Math.min(depth, _depth),
        Math.min(depth, _depth) === depth ? line.positionId : _position
      ]
    }, [Infinity, ''])

  const getPositionIdChangedLines = ([changeDepth, changePosition]) =>
    (accumulator, line, index) => {
      if (changeDepth === Infinity) return accumulator
      if (!line) return accumulator
      const pIds = line.positionId.split('_').map((item) => parseInt(item))
      if (changeDepth > pIds.length) return accumulator
      const changePositionIds = changePosition.split('_').map((item) => parseInt(item))
      const changeTailId = changePositionIds[changePositionIds.length - 1]
      if (pIds[changeDepth - 1] < changeTailId) return accumulator
      if (changeDepth > 1 &&
        changePositionIds.slice(0, changeDepth - 1).join('_')
        !== pIds.slice(0, changeDepth - 1).join('_')) return accumulator
      return index + 1
    }

  const newText = document.getElementById(this.options.batch_container_id).value
  //Abort if no changes
  if (newText === this.batchText) return
  const newTextLines = newText.split('\n')
  // Validate if text is in right format
  if (!newTextLines.reduce(lineValidator, true)) return inValidInput()

  const oldTextLines = this.batchText.split('\n')
  const oldTextNodeData = mapLinesToNodeDataAndCheckValidity(oldTextLines)
  const newTextNodeData = mapLinesToNodeDataAndCheckValidity(newTextLines)

  // Find Begin and end of the changes between old and new Text
  const [beginMatch, headMatchCount] = newTextLines
    .reduce(lineMatcher(oldTextLines), [-1, 0])
  let [endMatch, tailMatchCount] = newTextLines
    .reverse()
    .reduce(lineMatcher(oldTextLines.reverse()), [-1, 0])
  endMatch = newTextLines.length - 1 - endMatch // index transformation because endcount
  endMatch = endMatch - beginMatch === 1 ? endMatch + 1 : endMatch

  // console.log(headMatchCount, tailMatchCount, oldTextLines.length)
  //
  // console.log(beginMatch, endMatch)
  // get implied end match because of position ids, remember implied changes
  // update implied position ids

  function textDataToJson (textData) {
    const _parseInt = (i) => parseInt(i)
    const result = []
    textData.reduce((currentResult, dataLine) => {
      const {label: name, type, relationship, meta} = dataLine
      const lineWithChildren = Object.assign({}, {
        children: [],
        name,
        type,
        relationship: parseFloat(relationship),
        meta
      })
      dataLine.positionId
        .split('_')
        .map(_parseInt)
        .reduce((accumulator, current) => {
          if (!accumulator[current]) accumulator[current] = lineWithChildren
          if (!!accumulator[current].children) {
            return accumulator[current].children
          } else {
            return accumulator[current]
          }
        }, currentResult)
      return currentResult
    }, result)
    return result
  }

  this.network.setData(
    this.network_util.parseArrayToVis(
      textDataToJson(
        newTextNodeData
          .lines.filter(line => line !== null)
          .sort((a, b) => a.positionId.length - b.positionId.length)
      )
    )
  )
  // const visData = this.network_util.parseJsonToVis(jsonNetwork)
  // console.log(visData)
  // this.network.data = visData
  // console.log(jsonNetwork)
  // this.network.setData(visData)
}

function handleTextUpdateOld () {
  const inValidInput = () => {
    // TODO
    console.log('invalid input')
  }
  const lineValidator = (valid, line) => {
    const validLine = /^-*[\w\s]+:(concept|term):-?(0[.]?\d*|1)$/
    line = line.trim()
    if (line === '') return valid
    return valid && !!validLine.exec(line)
  }
  const lineMatcher = (oldTextLines) => (accumulator, line, index) => {
    if (index - 1 !== accumulator) return accumulator
    if (line === oldTextLines[index]) return index
    return accumulator
  }
  const mapLinesToNodeDataAndCheckValidity = (textLines) => textLines.reduce(({lines, lastPositionId, valid}, line, index) => {
    if (!valid) return {lines, lastPositionId, valid}
    // Empty Line Check
    if (line.trim() === '') {
      lines.push(null)
      return {lines, lastPositionId, valid}
    }

    const {depth: positionDepth} = line.split('').reduce(({depth, counting}, char) => {
      if (!counting) return {depth, counting}
      if (char === '-') depth++
      else counting = false
      return {depth, counting}
    }, {depth: 0, counting: true})

    if (lastPositionId.length === 0 && positionDepth !== 0) return {lines, lastPositionId, valid: false}
    if (positionDepth - lastPositionId.length > 1) return {lines, lastPositionId, valid: false}
    let newPositionId = lastPositionId.slice(0, positionDepth + 1)
    newPositionId[positionDepth] = newPositionId[positionDepth] === undefined
      ? 0 : newPositionId[positionDepth] + 1
    const [label, type, relationship] = line.slice(positionDepth).split(':')
    lines.push({label, type, relationship, positionId: newPositionId.join('_'), index})
    return {lines, lastPositionId: newPositionId, valid}
  }, {lines: [], lastPositionId: [], valid: true})
  const getLinesToChange = (mappedLines, beginMatch, endMatch) =>
    mappedLines.filter((line, index) => index > beginMatch && index < endMatch)
  const getPositionIdChangedLines = ([changeDepth, changePosition]) =>
    (accumulator, line, index) => {
      if (changeDepth === Infinity) return accumulator
      if (!line) return accumulator
      const pIds = line.positionId.split('_').map((item) => parseInt(item))
      if (changeDepth > pIds.length) return accumulator
      const changePositionIds = changePosition.split('_').map((item) => parseInt(item))
      const changeTailId = changePositionIds[changePositionIds.length - 1]
      if (pIds[changeDepth - 1] < changeTailId) return accumulator
      if (changeDepth > 1 &&
        changePositionIds.slice(0, changeDepth - 1).join('_')
        !== pIds.slice(0, changeDepth - 1).join('_')) return accumulator
      return index + 1
    }
  const getMinimumChangeDepth = (nodeDataLines) => nodeDataLines.reduce(([_depth, _position], line) => {
    if (!line) return [_depth, _position]
    const pIds = line.positionId.split('_').map((item) => parseInt(item))
    const depth = pIds.length

    return [
      Math.min(depth, _depth),
      Math.min(depth, _depth) === depth ? line.positionId : _position
    ]
  }, [Infinity, ''])
  const getParentPositonId = (positionId) => positionId.split('_').slice(0, -1).join('_')
  const getNodeIdByPostionId = (_postionId = '') => {
    if (_postionId === '') return null
    const node = Object.values(this.network.body.data.nodes.getDataSet()._data)
      .find(({positionId}) => positionId === _postionId)
    return !!node ? node.id : null
  }
  const applyNodeDataToNetwork = (nodeLine) => {
    if (!nodeLine) return
    nodeLine.color = this.network_util.nodeColor(nodeLine.relationship)

    // new
    const parentId = getNodeIdByPostionId(getParentPositonId(nodeLine.positionId))

    // console.log(getNodeIdByPostionId(nodeLine.positionId))
    // this.network.body.data.nodes.getDataSet().update(nodeLine)

    return
  }

  const newText = document.getElementById(this.options.batch_container_id).value

  //Abort if no changes
  if (newText === this.batchText) return

  let newTextLines = newText.split('\n')

  // Validate if text is in right format
  if (!newTextLines.reduce(lineValidator, true)) return inValidInput()

  const oldTextLines = this.batchText.split('\n')

  newTextLines.reverse()
  oldTextLines.reverse()

  // map text lines to node data lines and check if they are valid in structure
  const {lines: mappedLines, valid} = mapLinesToNodeDataAndCheckValidity(newTextLines)
  if (!valid) return inValidInput()

  // TODO deletion
  // Filter the Node Data relevant to the Update
  const modifiedLines = getLinesToChange(mappedLines, beginMatch, endMatch)
  console.log(modifiedLines)

  // get the Postion Id and Depth to check if there's a change in other positionIds
  const [changeDepth, changePosition] = getMinimumChangeDepth(modifiedLines)

  const impliedEndMatch = mappedLines.reduce(getPositionIdChangedLines([changeDepth, changePosition]), endMatch)
  const linesToUpdate = getLinesToChange(mappedLines, beginMatch, impliedEndMatch)

  // console.log([changeDepth, changePosition])
  console.log(beginMatch, endMatch, impliedEndMatch)
  console.log(mappedLines, modifiedLines, linesToUpdate)
  // console.log(this)

  linesToUpdate
  // TODO maybe sorting
    .forEach(applyNodeDataToNetwork)

  this.batchText = newText
}

function parseOnUpdate () {
  if (!this.options.batch_container_id) {return}
  const currentText =  document.getElementById(this.options.batch_container_id).value
  const emptyLines = currentText
      .split(/\r?\n/)
      .map((line, index) => {
        return [line, index]
      })
      .filter(([line]) => line.trim() === '')
  if (
    emptyLines.length > 0 &&
    emptyLines[0][1] === 0
  ) {
    emptyLines.splice(0, 1)
  }
  if (emptyLines.length > 0 &&
    emptyLines[emptyLines.length - 1][1] === currentText.split(/\r?\n/).length - 1
  ){
    emptyLines.splice(emptyLines.length - 1, 1)
  }
  let text = parseNetworkToText(this)
    .split(/\r?\n/)
  emptyLines
    .forEach(([line, index]) => {
      text.splice(index, 0, line)
    })
  text = text.join('\n')
  this.batchText = text
  document.getElementById(this.options.batch_container_id).value = text
}

function parseNetworkToText (ConceptCreator) {
  return ConceptCreator.network.body.data.nodes
    .getDataSet()
    .map(node => node) // this seems stupid, but the result of getDataSet does not implement sort
    .sort((a, b) => {
      let posA = a.positionId.toString().split('_').map(i => parseInt(i) + 1)
      let posB = b.positionId.toString().split('_').map(i => parseInt(i) + 1)
      let diffArr = (new Array(Math.abs(posA.length - posB.length))).fill(0)
      if (posA.length < posB.length) {posA = posA.concat(diffArr)}
      else {posB = posB.concat(diffArr)}
      return parseInt(posA.join('')) - parseInt(posB.join(''))
    })
    .reduce((output, node) => {
      let prefix = (new Array(node.positionId.toString().split('_').length - 1)).fill('-').join('')
      output += `${prefix}${node.label}:${node.type}:${node.relationship}\n`
      return output
    }, '')
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