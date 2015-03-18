var geohash = require('ngeohash');
var fs = require('fs');
 
var data = JSON.parse(fs.readFileSync('input.json').toString());
var grid = {};
 
data.features.forEach(function(f,i){
  var ghash = geohash.encode(f.geometry.coordinates[1], f.geometry.coordinates[0],9);
  if (!grid[ghash]){
    grid[ghash] = 0;
  }
  grid[ghash]++;
});
 
console.log(Object.keys(grid).length);
fs.writeFileSync('geohash.out.json', JSON.stringify(grid));