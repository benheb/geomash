var geohash = require('ngeohash');
var Terraformer = require('terraformer');
var fs = require('fs');
 
var data = JSON.parse(fs.readFileSync('parcels.json').toString());
var precisions = [1, 2, 3, 4, 5, 6, 7, 8, 9];
var stats = {};
var count, grid;

precisions.forEach(function(prec) {
  grid = {};
  count = 0;
  data.features.forEach(function(f,i){
    var pts = ( f.geometry.coordinates[0] ) ? f.geometry.coordinates[0] : f.geometry.coordinates;
    var pt = getPolyCenter(pts);
    //console.log('pt', pt);
    var ghash = geohash.encode(pt[1], pt[0], prec);
    //console.log('f.prop', f.properties);
    if (!grid[ghash]){
      grid[ghash] = {
        count: 0
      };
    }
    grid[ghash].count++;
    count++;
  });
  stats[prec] = {};
  stats[prec].count = Object.keys(grid).length;
});

function getPolyCenter(pts){
  var twicearea=0,
      x=0, y=0,
      nPts = pts.length,
      p1, p2, f;
  //console.log('nPts', nPts);

  for (var i=0, j=nPts-1 ;i<nPts;j=i++) {
    p1=pts[i]; p2=pts[j];
    twicearea+=p1[0]*p2[1];
    twicearea-=p1[1]*p2[0];
    f=p1[0]*p2[1]-p2[0]*p1[1];
    x+=(p1[0]+p2[0])*f;
    y+=(p1[1]+p2[1])*f;
  }
  f=twicearea*3;
  return [x/f,y/f];
}

console.log('stats: ', stats);
console.log('count: ', count);
console.log('hash length: ', Object.keys(grid).length);
var hash = {};
hash.grid = grid;
hash.stats = stats;
fs.writeFileSync('parcels.out.json', JSON.stringify(hash));