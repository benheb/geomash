/* jshint devel:true */
console.log('\'Allo \'Allo!');


var map = L.map('map').setView([25.528, -35.680],3);

L.esri.basemapLayer("Gray").addTo(map);

function getRadius(d) {
  return d > 500 ? 20 :
         d > 300  ? 14 :
         d > 100  ? 12 :
         d > 50  ? 9 :
         d > 20   ? 6 :
         d > 10   ? 5 :
         d > 0   ? 3 :
             0;
}


function styler(feature) {
  return {
    radius: getRadius(feature.properties.count),
    weight: 1,
    opacity: 1,
    color: '#EEE',
    fillColor: "#438fbf",
    fillOpacity: 0.7
  };
}

/**
 * Geohash encode, decode, bounds, neighbours.
 *
 * @namespace
 */
var Geohash = {};


/* (Geohash-specific) Base32 map */
Geohash.base32 = '0123456789bcdefghjkmnpqrstuvwxyz';

//get geohash data
$.ajax({
  dataType: "json",
  url: "data/geohash-400.out.json",
  success: function(data) {
    console.log('data', data);
    window.data = data;
    var precision = getPrecision(map.getZoom());
    var hash = getHash(data, precision);
    addPoints(hash);
  }
}).error(function() {});

//update map on zoom
map.on('zoomend', function() {
  var zoom = map.getZoom();
  console.log('zoom!', zoom);
  if ( zoom < 9 ) {
    var precision = getPrecision(zoom);
    var hash = getHash(window.data, precision);
    addPoints(hash);
  } else {
    if ( !window.fLayer ) {
      addFeatureLayer();
    }
  }
});

//calculate subhash
function getHash(data, precision) {
  var newHash = {};
  for ( var key in data ) {
    var sub = key.substring(0, precision);
    if ( !newHash[sub] ) {
      newHash[sub] = 0;
    }
    newHash[sub]++;
  }
  return newHash;
}

function getPrecision(zoom) {
  var precision;
  switch(true) {
    case (zoom>8):
        precision = 9;
        break;
    case (zoom>7):
        precision = 7;
        break;
    case (zoom>6):
        precision = 5;
        break;
    case (zoom>5):
        precision = 4;
        break;
    case (zoom>4):
        precision = 3;
        break;
    case (zoom>3):
        precision = 3;
        break;
    case (zoom>2):
        precision = 2;
        break;
    default:
        precision = 1;
  }
  return precision;
}


function addPoints(data) {

  if ( window.layer ) map.removeLayer(window.layer);
  if ( window.fLayer ) {
    map.removeLayer(window.fLayer);
    window.fLayer = null;
  }

  var features = [];

  for ( var hash in data ) {
    //console.log('data[hash]', data[hash]);
    var latlng = Geohash.decode(hash);
    //console.log('latlng', latlng);

    var geojsonFeature = {
        "type": "Feature",
        "properties": {
          "count": data[hash]
        },
        "geometry": {
            "type": "Point",
            "coordinates": [latlng.lon, latlng.lat]
        }
    };

    features.push(geojsonFeature);

  }

  window.layer = L.geoJson(features, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, styler(feature));
    }
  })

  window.layer.addTo(map);
}


function addFeatureLayer() {

  if ( window.layer ) map.removeLayer(window.layer);

  window.fLayer = new L.esri.FeatureLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/crowdmag/MapServer/0", {
    style: function () {
      return { color: "#70ca49", weight: 2 };
    }
  }).addTo(map);

  var popupTemplate = "<h5>Intensity</h5> {INTENSITY}<br>";

  window.fLayer.bindPopup(function(feature){
    return L.Util.template(popupTemplate, feature.properties)
  });
}



/*
******GEOHASH *****
*/
Geohash.decode = function(geohash) {

    var bounds = Geohash.bounds(geohash); // <-- the hard work
    // now just determine the centre of the cell...

    var latMin = bounds.sw.lat, lonMin = bounds.sw.lon;
    var latMax = bounds.ne.lat, lonMax = bounds.ne.lon;

    // cell centre
    var lat = (latMin + latMax)/2;
    var lon = (lonMin + lonMax)/2;

    // round to close to centre without excessive precision: ⌊2-log10(Δ°)⌋ decimal places
    lat = lat.toFixed(Math.floor(2-Math.log(latMax-latMin)/Math.LN10));
    lon = lon.toFixed(Math.floor(2-Math.log(lonMax-lonMin)/Math.LN10));

    return { lat: Number(lat), lon: Number(lon)};

};


/**
 * Returns SW/NE latitude/longitude bounds of specified geohash.
 *
 * @param   {string} geohash - Cell that bounds are required of.
 * @returns {{sw: {lat: number, lon: number}, ne: {lat: number, lon: number}}}
 * @throws  Invalid geohash.
 */
Geohash.bounds = function(geohash) {
    if (geohash.length == 0) throw new Error('Invalid geohash');

    geohash = geohash.toLowerCase();

    var evenBit = true;
    var latMin =  -90, latMax =  90;
    var lonMin = -180, lonMax = 180;

    for (var i=0; i<geohash.length; i++) {
        var chr = geohash.charAt(i);
        var idx = Geohash.base32.indexOf(chr);
        if (idx == -1) throw new Error('Invalid geohash');

        for (var n=4; n>=0; n--) {
            var bitN = idx >> n & 1;
            if (evenBit) {
                // longitude
                var lonMid = (lonMin+lonMax) / 2;
                if (bitN == 1) {
                    lonMin = lonMid;
                } else {
                    lonMax = lonMid;
                }
            } else {
                // latitude
                var latMid = (latMin+latMax) / 2;
                if (bitN == 1) {
                    latMin = latMid;
                } else {
                    latMax = latMid;
                }
            }
            evenBit = !evenBit;
        }
    }

    var bounds = {
        sw: { lat: latMin, lon: lonMin },
        ne: { lat: latMax, lon: lonMax }
    };

    return bounds;
};
