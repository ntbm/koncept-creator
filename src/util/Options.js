module.exports = class Options {
  constructor (optionsObj) {
    let {
      container_id,
      editable=true,
      visOptions={}
    } = optionsObj
    this.container_id = container_id
    this.visOptions = visOptions
    this.editable = editable
  }
}