module.exports = class Options {
  constructor (optionsObj) {
    let {
      container_id,
      visOptions={}
    } = optionsObj
    this.container_id = container_id
    this.visOptions = visOptions
  }
}