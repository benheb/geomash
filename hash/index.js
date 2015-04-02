var geohash = require('ngeohash');
var fs = require('fs');
 
var data = JSON.parse(fs.readFileSync('input-lg.json').toString());
var precisions = [1, 2, 3, 4, 5, 6, 7, 8, 9];
var stats = {};
var count, grid;
 
precisions.forEach(function(prec) {
  grid = {};
  count = 0;
  data.features.forEach(function(f,i){
    var ghash = geohash.encode(f.geometry.coordinates[1], f.geometry.coordinates[0],prec);
    //console.log('f.prop', f.properties);
    if (!grid[ghash]){
      grid[ghash] = {
        count: 0,
        avg: 0
      };
    }
    grid[ghash].count++;
    grid[ghash].avg = (f.properties.INTENSITY + grid[ghash].avg) / grid[ghash].count;
    count++;
  });

  stats[prec] = {};
  stats[prec].count = Object.keys(grid).length;

});
 
console.log('stats: ', stats);
console.log('count: ', count);
console.log('hash length: ', Object.keys(grid).length);
var hash = {};
hash.grid = grid;
hash.stats = stats;
fs.writeFileSync('geohash-400.out.json', JSON.stringify(hash));