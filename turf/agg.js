
var turf = require('turf');
var fs = require('fs');

var input; 
fs.readFile('input-filtered.json', function (err, data) {
  if (err) throw err;
  console.log('start... ');
  input = JSON.parse(data.toString());

  var extent = [-140,0,30,80];
  var cellWidth = 30;
  var units = 'miles';

  var squareGrid = turf.squareGrid(extent, cellWidth, units);
  var counted = turf.count(squareGrid, input, 'pt_count');

  var features = [];
  counted.features.forEach(function(feature) {
    if ( feature.properties.pt_count > 0 ) {
      features.push(feature);
    }
  });
  var result = {
    "type": "FeatureCollection",
    "features": features
  };

  var file = 'count-large.json';
  fs.writeFile( file, JSON.stringify( result ));

  console.log('end... ');

});
