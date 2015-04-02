var geohash = require('ngeohash');
var Terraformer = require('terraformer');
var stream = require("JSONStream");
var es = require('event-stream');
var fs = require('fs');

var precisions = [1, 2, 3, 4, 5, 6, 7, 8, 9];
var stats = {};
var count, grid;

//should start at max precision based of size of input 
//usually 9, but in case of 1 million, had to start at 6
var prec = 6;

var parser = stream.parse('features.*');

parser.on('end', function(){
  console.log('stats: ', stats);
  console.log('count: ', count);
  console.log('hash length: ', Object.keys(grid).length);
  var hash = {};
  hash.grid = grid;
  hash.stats = stats;
  fs.writeFileSync('parcels.out.json', JSON.stringify(hash));
});

grid = {};
count = 0;
process.stdin
  .pipe(parser)
  .pipe(es.mapSync(function (f) {
    //console.log('f', f);  
    //TODO handle both points and polygons here!
    var pts = ( f.geometry.coordinates[0] ) ? f.geometry.coordinates[0] : f.geometry.coordinates;
    var pt = getPolyCenter(pts);
    //console.log('pt', pt);

    var ghash = geohash.encode(pt[1], pt[0], prec);
    if (!grid[ghash]){
      grid[ghash] = {
        count: 0
      };
    }
    grid[ghash].count++;
    count++;

    //call presitionStats

    return f
  }));
 
function precisionStats(hash) {
  //var sub = hash.substring(0, precision);
  
  //gen stats for each precistion 9 -> 1

  //if (hash.length === 1) return; 
  //else, run again
  precisionStats(hash);
}

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