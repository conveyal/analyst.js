# analyst.js

Lightweight client library for making requests to Analyst Server


### `constructor(L, opts)`

Create an instance of Analyst.js for use with single point requests.


### Parameters

| parameter | type    | description                                                                      |
| --------- | ------- | -------------------------------------------------------------------------------- |
| `L`       | Leaflet | Pass in an instance of Leaflet so that it doesn't need to be packaged with this. |
| `opts`    | Object  |                                                                                  |



### `updateSinglePointLayer`

Update/create the single point layer for this Analyst.js instance.


### Example

```js
analyst.key = 'NEW KEY'
analyst.updateSinglePointLayer().redraw()
```


**Returns** `TileLayer`, singlePointLayer


### `shapefiles`

Get all of the available shapefiles.


### Example

```js
analyst.shapefiles().then(function (shapefiles) {
  console.log(shapefiles)
})
```


**Returns** `Promise`, 


### `singlePointRequest(point, opts)`

Run a single point request and generate a tile layer.


### Parameters

| parameter | type   | description |
| --------- | ------ | ----------- |
| `point`   | LatLng |             |
| `opts`    | Object |             |


### Example

```js
analyst
  .singlePointRequest(marker.getLatLng())
  .then(function (response) {
    response.tileLayer.addTo(map)
  })
```


**Returns** `Promise`, 

## Installation

Requires [nodejs](http://nodejs.org/).

```sh
$ npm install analyst.js
```

## Tests

```sh
$ npm test
```


