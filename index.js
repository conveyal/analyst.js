
const REQUEST_DEFAULTS = {
  accessModes: 'WALK',
  egressModes: 'WALK',
  fromTime: 25200,
  toTime: 32400,
  walkSpeed: 1.3333333333333333,
  bikeSpeed: 4.1,
  carSpeed: 20,
  streetTime: 90,
  maxWalkTime: 20,
  maxBikeTime: 45,
  maxCarTime: 45,
  minBikeTime: 10,
  minCarTime: 10,
  suboptimalMinutes: 5,
  analyst: true,
  bikeSafe: 1,
  bikeSlope: 1,
  bikeTime: 1
}

export default class Analyst {
  /**
   * Create an instance of Analyst.js for use with single point requests.
   *
   * @param {Leaflet} L Pass in an instance of Leaflet so that it doesn't need to be packaged with this.
   * @param {Object} opts
   */

  constructor (L, opts = {}) {
    this.apiUrl = opts.apiUrl
    this.tileUrl = opts.tileUrl

    this.destinationPointsetId = opts.destinationPointsetId
    this.graphId = opts.graphId
    this.profile = opts.profile === undefined ? true : opts.profile

    this.connectivityType = opts.connectivityType || 'AVERAGE'
    this.timeLimit = opts.timeLimit || 3600
    this.showPoints = !!opts.showPoints
    this.showIso = !!opts.showIso

    this.L = L
    this.tileLayerOptions = {}
  }

  /**
   * Update/create the single point layer for this Analyst.js instance.
   *
   * @return {TileLayer} singlePointLayer
   * @example
   * analyst.key = 'NEW KEY'
   * analyst.updateSinglePointLayer().redraw()
   */

  updateSinglePointLayer () {
    const url = `${this.tileUrl}/single/${this.key}/{z}/{x}/{y}.png?which=${this.connectivityType}&timeLimit=${this.timeLimit}&showPoints=${this.showPoints}&showIso=${this.showIso}`

    if (!this.singlePointLayer) {
      this.singlePointLayer = this.L.tileLayer(url, this.tileLayerOptions)
    } else {
      this.singlePointLayer.setUrl(url)
    }

    return this.singlePointLayer
  }

  /**
   * Get all of the available shapefiles.
   *
   * @return {Promise}
   * @example
   * analyst.shapefiles().then(function (shapefiles) {
   *   console.log(shapefiles)
   * })
   */

  shapefiles () {
    return new Promise((resolve, reject) => {
      window.fetch(this.apiUrl + '/shapefiles')
        .then((response) => {
          resolve(response.json())
        })
        .catch(reject)
    })
  }

  /**
   * Run a single point request and generate a tile layer.
   *
   * @param {LatLng} point
   * @param {Object} opts
   * @return {Promise}
   * @example
   * analyst
   *   .singlePointRequest(marker.getLatLng())
   *   .then(function (response) {
   *     response.tileLayer.addTo(map)
   *   })
   */

  singlePointRequest (point, opts = {}) {
    const options = Object.assign({}, REQUEST_DEFAULTS, opts)

    options.fromLat = options.toLat = point.lat
    options.fromLng = options.toLng = point.lng

    return new Promise((resolve, reject) => {
      post(this.apiUrl + '/single', {
          destinationPointsetId: this.destinationPointsetId,
          graphId: this.graphId,
          profile: this.profile,
          options: options
        })
        .then((response) => {
          const data = response.json()
          this.key = data.key

          resolve({
            tileLayer: this.updateSinglePointLayer(),
            results: data
          })
        })
        .catch(reject)
    })
  }
}

function post (url, data) {
  return window.fetch(url, {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
}