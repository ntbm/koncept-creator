"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ConceptC = function ConceptC(options, inputJson) {
  _classCallCheck(this, ConceptC);

  this.options = options;

  this.jsonModel = inputJson;
  var container_id = options.container_id,
      _options$visOptions = options.visOptions,
      visOptions = _options$visOptions === undefined ? {} : _options$visOptions;

  var data = createNodesAndDataset(inputJson);
  var container = document.getElementById(container_id);

  this.visNetwork = new vis.Network(container, data, visOptions);
};

function createNodesAndDataset(data) {
  var _a = a(null, data, [], []),
      nodesArray = _a.nodesArray,
      edgesArray = _a.edgesArray;

  return {
    nodes: new vis.DataSet(nodesArray),
    edges: new vis.DataSet(edgesArray)
  };
}
function a(parent, current_node, nodesArray, edgesArray) {
  var name = current_node.name,
      _current_node$type = current_node.type,
      type = _current_node$type === undefined ? "concept" : _current_node$type,
      _current_node$parent_ = current_node.parent_relationship,
      parent_relationship = _current_node$parent_ === undefined ? "inherit" : _current_node$parent_,
      meta = current_node.meta,
      children = current_node.children;

  var current = {
    label: name,
    id: (nodesArray.length || 0) + 1,
    parent_relationship: parent_relationship
  };
  if (parent) {
    if (current.parent_relationship === "inherit") {
      current.parent_relationship = parent.parent_relationship;
    }
    edgesArray.push({
      from: parent.id,
      to: current.id
    });
  }
  nodesArray.push(current);
  if (current_node.children) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = current_node.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var node = _step.value;

        var result = a(current, node, nodesArray, edgesArray);
        nodesArray = result.nodesArray;
        edgesArray = result.edgesArray;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }
  return {
    nodesArray: nodesArray,
    edgesArray: edgesArray
  };
}

window.ConceptC = ConceptC;
