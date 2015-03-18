var geohash = require('ngeohash');
var fs = require('fs');
 
var data = JSON.parse(fs.readFileSync('input.json').toString());
var grid = {};
 
data.features.forEach(function(f,i){
  var ghash = geohash.encode(f.geometry.coordinates[1], f.geometry.coordinates[0],9);
  //console.log('f.prop', f.properties);
  if (!grid[ghash]){
    grid[ghash] = {
      count: 0,
      avg: 0
    };
  }
  grid[ghash].count++;
  grid[ghash].avg = (f.properties.INTENSITY + grid[ghash].avg) / grid[ghash].count;
});
 
console.log(Object.keys(grid).length);
fs.writeFileSync('geohash-attrs.out.json', JSON.stringify(grid));