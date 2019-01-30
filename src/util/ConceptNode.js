const ErrorCodes = require('./ErrorCodes')

module.exports = {
  clean
}

const ConceptNode = Object.freeze({
  name: '',
  children:[],
  type:'',
  meta: {},
  flex: []
})


function clean (node) {
  if (node.children && node.type && node.type === 'term') {
    throw new Error(ErrorCodes.TERMS_CAN_NOT_HAVE_CHILDREN);
  }
  const result = {}
  for (let _key in ConceptNode) {
    if (node[_key]){
      result[_key] = node[_key]
    }
  }
  if (node.children) {
    for (let childNum in node.children) {
      node.children[childNum] = clean(node.children[childNum]);
    }
  }
  return result;
}
