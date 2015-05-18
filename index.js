
const LAYER_DEFAULTS = {}

const REQUEST_DEFAULTS = {
  accessModes: 'WALK',
  egressModes: 'WALK',
  date: new Date().toISOString().split('T')[0],
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

/**
 * Create an instance of Analyst.js for use with single point requests.
 *
 * @param {Leaflet} L Pass in an instance of Leaflet so that it doesn't need to be packaged as a dependency.
 * @param {Object} opts Options object.
 * @example
 * const analyst = new Analyst(window.L, {
 *   apiUrl: 'http://localhost:3000/api',
 *   tileUrl: 'http://localhost:4000/tile'
 * })
 */

export default class Analyst {
  constructor (L, opts = {}) {
    this.apiUrl = opts.apiUrl
    this.tileUrl = opts.tileUrl

    this.shapefileId = opts.shapefileId
    this.graphId = opts.graphId
    this.profile = opts.profile === undefined ? true : opts.profile

    this.connectivityType = opts.connectivityType || 'AVERAGE'
    this.timeLimit = opts.timeLimit || 3600
    this.showPoints = !!opts.showPoints
    this.showIso = !!opts.showIso

    this.L = L

    this.requestOptions = Object.assign({}, REQUEST_DEFAULTS, opts.requestOptions)
    this.tileLayerOptions = Object.assign({}, LAYER_DEFAULTS, opts.tileLayerOptions)
  }

  /**
   * Update/create the single point layer for this Analyst.js instance.
   *
   * @return {TileLayer} A Leaflet tile layer that pulls in the generated single point tiles.
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
   * @return {Promise} Resolves with a JSON list of shapefiles.
   * @example
   * analyst.shapefiles().then(function (shapefiles) {
   *   console.log(shapefiles)
   * })
   */

  shapefiles () {
    return window.fetch(this.apiUrl + '/shapefiles').then(r => r.json())
  }

  /**
   * Run a single point request and generate a tile layer.
   *
   * @param {LatLng} point
   * @param {Object} opts
   * @return {Promise} Resolves with an object containing the tile layer and the results data.
   * @example
   * analyst
   *   .singlePointRequest(marker.getLatLng())
   *   .then(function (response) {
   *     response.tileLayer.addTo(map)
   *   })
   */

  singlePointRequest (point, opts = {}) {
    const options = Object.assign({}, this.requestOptions, opts)

    if (!point) return Promise.reject(new Error('Lat/lng point required.'))

    options.fromLat = options.toLat = point.lat
    options.fromLon = options.toLon = point.lng

    if (!this.shapefileId) return Promise.reject(new Error('Shapefile ID required'))
    if (!this.graphId) return Promise.reject(new Error('Graph ID required'))

    return post(this.apiUrl + '/single', {
        destinationPointsetId: this.shapefileId,
        graphId: this.graphId,
        profile: this.profile,
        options: options
      })
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        this.key = data.key

        return {
          tileLayer: this.updateSinglePointLayer(),
          results: data
        }
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
