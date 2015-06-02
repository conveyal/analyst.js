# analyst.js

Lightweight client library for making requests to Analyst Server


### `Analyst(L, options, [options.apiUrl], [options.tileUrl], [options.shapefileId], [options.graphId], [options.profile], [options.connectivityType], [options.timeLimit], [options.showPoints], [options.showIso], [options.requestOptions], [options.tileLayerOptions])`

Create an instance of Analyst.js for use with single point requests.


### Parameters

| parameter                    | type    | description                                                                            |
| ---------------------------- | ------- | -------------------------------------------------------------------------------------- |
| `L`                          | Leaflet | Pass in an instance of Leaflet so that it doesn't need to be packaged as a dependency. |
| `options`                    | Object  | Options object.                                                                        |
| `[options.apiUrl]`           | String  | _optional:_                                                                            |
| `[options.tileUrl]`          | String  | _optional:_                                                                            |
| `[options.shapefileId]`      | String  | _optional:_                                                                            |
| `[options.graphId]`          | String  | _optional:_                                                                            |
| `[options.profile]`          | Boolean | _optional:_ Defaults to true                                                           |
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


### `updateSinglePointLayer`

Update/create the single point layer for this Analyst.js instance.


### Example

```js
analyst.key = 'NEW KEY'
analyst.updateSinglePointLayer().redraw()
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


### `singlePointRequest(point, options)`

Run a single point request and generate a tile layer.


### Parameters

| parameter | type   | description     |
| --------- | ------ | --------------- |
| `point`   | LatLng |                 |
| `options` | Object | Options object. |


### Example

```js
analyst
  .singlePointRequest(marker.getLatLng())
  .then(function (response) {
    response.tileLayer.addTo(map)
  })
```


**Returns** `Promise`, Resolves with an object containing the tile layer and the results data.

## Installation

Requires [nodejs](http://nodejs.org/).

```sh
$ npm install analyst.js
```

## Tests

```sh
$ npm test
```


