module.exports = {
  nodeColor,
  nodeShape
}

// Todo these functions make no sense from input and output -> refactor
// TODO scale -1 to 1 with middleware
function nodeColor (parent_relationship) {
  switch (parent_relationship) {
    case "contradicts":
      return "red"
    case "supports":
      return "green"
    case "maybe_supports":
      return "green"
    case "inherit":
      return null
    default:
      console.error("invalid relationship")
      return null
  }
}
function nodeShape (type) {
  switch (type) {
    case "concept":
      return "box"
    case "term":
      return "ellipse"
    default:
      console.error("invalid type")
      return null
  }
}