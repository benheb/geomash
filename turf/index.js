var turf = require('turf');
var fs = require('fs');

var input; 
fs.readFile('input-filtered.json', function (err, data) {
  if (err) throw err;
  input = JSON.parse(data.toString());

  // create random points with random
  // z-values in their properties
  //var points = turf.random('point', 100, {
  //  bbox: [0, 30, 20, 50]
  //});
  //for (var i = 0; i < points.features.length; i++) {
  //  points.features[i].properties.z = Math.random() * 10;
  //}

  var points = turf.random('point', 100, {
    bbox: [0, 30, 20, 50]
  });
  for (var i = 0; i < points.features.length; i++) {
    points.features[i].properties.daily_precip = Math.random() * 10;
  }

  console.log('input!', input.features[1].properties.INTENSITY);
  console.log('points', points.features[1].properties.daily_precip);

  var breaks = [41000, 4000, 43000, 44000, 45000, 46000, 47000, 48000, 49000, 50000, 51000, 52000, 53000, 54000, 55000, 56000];  
  var isolined = turf.isolines(input, 'INTENSITY', 500, breaks);

  //console.log('isolined', isolined);

  var file = 'intensity.json';
  fs.writeFile( file, JSON.stringify( isolined ));

  //console.log('isolined', isolined);
  //=isolined


});
