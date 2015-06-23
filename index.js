import concat from 'concat-stream'
import dbg from 'debug'
import http from 'http'

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

const debug = dbg('analyst.js')

/**
 * Create an instance of Analyst.js for use with single point requests.
 *
 * @param {Leaflet} L Pass in an instance of Leaflet so that it doesn't need to be packaged as a dependency.
 * @param {Object} options Options object.
 * @param {String} [options.apiUrl]
 * @param {String} [options.tileUrl]
 * @param {String} [options.shapefileId]
 * @param {String} [options.graphId]
 * @param {Boolean} [options.profile] Defaults to true
 * @param {String} [options.connectivityType]
 * @param {Number} [options.timeLimit] Defaults to 3600
 * @param {Boolean} [options.showPoints] Defaults to false
 * @param {Boolean} [options.showIso] Defaults to true
 * @param {Object} [options.requestOptions] Pass in default request options to be used.
 * @param {Object} [options.tileLayerOptions] Pass in default tileLayerOptions to use.
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

  updateSinglePointLayer (key1, key2) {
    if (key2 !== null) { 
      var keyVals = key2 + '/' + key1;
    } else { 
      var keyVals = key1;
    }

    const url = `${this.tileUrl}/single/${keyVals}/{z}/{x}/{y}.png?which=${this.connectivityType}&timeLimit=${this.timeLimit}&showPoints=${this.showPoints}&showIso=${this.showIso}`

    if (!this.singlePointLayer) {
      debug(`creating single point layer with url: ${url}`)
      this.singlePointLayer = this.L.tileLayer(url, this.tileLayerOptions)
    } else {
      debug(`updating single point layer to url: ${url}`)
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
    debug('fetching available shapefiles')
    return get(this.apiUrl + '/shapefile').then(r => r.json())
  }

  /**
   * Run a single point request and generate a tile layer.
   *
   * @param {LatLng} point
   * @param {Object} options Options object.
   * @return {Promise} Resolves with an object containing the tile layer and the results data.
   * @example
   * analyst
   *   .singlePointRequest(marker.getLatLng())
   *   .then(function (response) {
   *     response.tileLayer.addTo(map)
   *   })
   */

  singlePointRequest (point, compareKey, opts = {}) {
    if (!point) return Promise.reject(new Error('Lat/lng point required.'))
    if (!this.shapefileId) return Promise.reject(new Error('Shapefile ID required'))
    if (!this.graphId) return Promise.reject(new Error('Graph ID required'))

    const options = Object.assign({}, this.requestOptions, opts)
    options.fromLat = options.toLat = point.lat
    options.fromLon = options.toLon = point.lng

    debug(`making single point request to [${point.lng}, ${point.lat}]`, options)
    return post(this.apiUrl + '/single', {
        destinationPointsetId: this.shapefileId,
        graphId: this.graphId,
        profile: this.profile,
        options: options
      })
      .then((data) => {
        debug('single point request successful')
        this.key = data.key

        return {
          tileLayer: this.updateSinglePointLayer(this.key, compareKey),
          results: data
        }
      })
  }

  /**
   * Run a vector request and return a GeoJSON object.
   *
   * @param {LatLng} point
   * @param {Object} options Options object.
   * @return {Promise} Resolves with an object containing the GeoJSON object.
   * @example
   * analyst
   *   .vectorRequest(marker.getLatLng())
   *   .then(function (geojson) {
   *     L.geoJson(geoJson).addTo(map)
   *   })
   */

  vectorRequest (point, opts = {}) {
      if (!point) return Promise.reject(new Error('Lat/lng point required.'))
      if (!this.graphId) return Promise.reject(new Error('Graph ID required'))

      const options = Object.assign({}, this.requestOptions, opts)
      options.fromLat = options.toLat = point.lat
      options.fromLon = options.toLon = point.lng

      debug(`making vector request to [${point.lng}, ${point.lat}]`, options)
      return post(this.apiUrl + '/single', {
        graphId: this.graphId,
        profile: this.profile,
        options: options
      }).then((data) => {
        debug('vector request successful')

        return data
      })
    }
}

const getHostPortAndPath = new RegExp('^(.*)://([A-Za-z0-9\-\.]+)(:[0-9]+)?(.*)$')
function post (url, data) {
  return new Promise((resolve, reject) => {
    const [, , host, port, path] = url.match(getHostPortAndPath)

    const params = {
      host,
      path,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      withCredentials: false
    }

    if (port !== undefined) params.port = port

    debug('POST', params)
    const req = http.request(params, (res) => {
      res.on('error', reject)
      res.pipe(concat((data) => {
        resolve(JSON.parse(data))
      }))
    })

    req.on('error', reject)
    req.write(JSON.stringify(data))
    req.end()
  })
}

function get (url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      res.on('error', reject)
      res.pipe(concat((data) => {
        resolve(JSON.parse(data))
      }))
    }).on('error', reject)
  })
}
