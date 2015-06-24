# analyst.js

Lightweight client library for making requests to Analyst Server


### `Analyst(L, options, [options.apiUrl], [options.tileUrl], [options.connectivityType], [options.timeLimit], [options.showPoints], [options.showIso], [options.requestOptions], [options.tileLayerOptions])`

Create an instance of Analyst.js for use with single point requests.


### Parameters

| parameter                    | type    | description                                                                            |
| ---------------------------- | ------- | -------------------------------------------------------------------------------------- |
| `L`                          | Leaflet | Pass in an instance of Leaflet so that it doesn't need to be packaged as a dependency. |
| `options`                    | Object  | Options object.                                                                        |
| `[options.apiUrl]`           | String  | _optional:_                                                                            |
| `[options.tileUrl]`          | String  | _optional:_                                                                            |
| `[options.connectivityType]` | String  | _optional:_                                                                            |
| `[options.timeLimit]`        | Number  | _optional:_ Defaults to 3600                                                           |
| `[options.showPoints]`       | Boolean | _optional:_ Defaults to false                                                          |
| `[options.showIso]`          | Boolean | _optional:_ Defaults to true                                                           |
| `[options.requestOptions]`   | Object  | _optional:_ Pass in default request options to be used.                                |
| `[options.tileLayerOptions]` | Object  | _optional:_ Pass in default tileLayerOptions to use.                                   |


### Example

```js
const analyst = new Analyst(window.L, {
  apiUrl: 'http://localhost:3000/api',
  tileUrl: 'http://localhost:4000/tile'
})
```


### `updateSinglePointLayer(key, [comparisonKey])`

Update/create the single point layer for this Analyst.js instance.


### Parameters

| parameter         | type   | description                                       |
| ----------------- | ------ | ------------------------------------------------- |
| `key`             | String | Key for accessing the single point layer tiles.   |
| `[comparisonKey]` | String | _optional:_ Key for the layer to compare against. |


### Example

```js
analyst.updateSinglePointLayer(key).redraw()
```


**Returns** `TileLayer`, A Leaflet tile layer that pulls in the generated single point tiles.


### `shapefiles`

Get all of the available shapefiles.


### Example

```js
analyst.shapefiles().then(function (shapefiles) {
  console.log(shapefiles)
})
```


**Returns** `Promise`, Resolves with a JSON list of shapefiles.


### `singlePointRequest(point, graphId, [shapefileId], [options])`

Run a single point request and generate a tile layer.


### Parameters

| parameter       | type   | description                                                                                 |
| --------------- | ------ | ------------------------------------------------------------------------------------------- |
| `point`         | LatLng |                                                                                             |
| `graphId`       | String | Graph ID to use for this request.                                                           |
| `[shapefileId]` | String | _optional:_ Shapefile ID to be used with this request, can be omitted for a vector request. |
| `[options]`     | Object | _optional:_ Options object.                                                                 |


### Example

```js
analyst
  .singlePointRequest(marker.getLatLng())
  .then(function (data) {
    analyst.updateSinglePointLayer(data.key)
  })
```


**Returns** `Promise`, Resolves with an object containing the results data.


### `singlePointComparison(point, options, comparisonOptions)`

Compare two scenarios.


### Parameters

| parameter           | type   | description |
| ------------------- | ------ | ----------- |
| `point`             | LatLng |             |
| `options`           | Object |             |
| `comparisonOptions` | Object |             |


### Example

```js
analyst
  .singlePointComparison(marker.getLatLng(), { graphId: 'graph1' }, { graphId: 'graph2' })
  .then(([res, cres]) => {
    analyst.updateSinglePointLayer(res.key, cres.key)
  })
```


**Returns** `Promise`, Resolves with an array containing `[results, comparisonResults]`

## Installation

Requires [nodejs](http://nodejs.org/).

```sh
$ npm install analyst.js
```

## Tests

```sh
$ npm test
```


