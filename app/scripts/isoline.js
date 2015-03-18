/* jshint devel:true */
console.log('\'Allo \'Allo!');


var map = L.map('map').setView([39.528, -97.680], 4);

L.esri.basemapLayer("Gray").addTo(map);

//var parks = new L.esri.FeatureLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/crowdmag/MapServer/0", {
// style: function () {
//    return { color: "#70ca49", weight: 2 };
//  }
//}).addTo(map);

function getColor(d) {
  console.log('d', d);
  return d > 55000 ? '#800026' :
         d > 51000  ? '#BD0026' :
         d > 48000  ? '#E31A1C' :
         d > 44000  ? '#FC4E2A' :
         d > 43000   ? '#FD8D3C' :
         d > 41000   ? '#FEB24C' :
         d > 0   ? '#FED976' :
                    'none';
}


function styler(feature) {
  return {
    weight: 0.7,
    opacity: 1,
    color: getColor(feature.properties.INTENSITY),
    fillOpacity: 0.7
  };
}

$.ajax({
  dataType: "json",
  url: "/data/intensity.json",
  success: function(data) {
    console.log('data', data);
    L.geoJson(data, {
      style: styler
    }).addTo(map);    
  }
}).error(function() {});