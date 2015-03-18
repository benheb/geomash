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
  //console.log('d', d);
  return d > 500 ? '#800026' :
         d > 300  ? '#BD0026' :
         d > 100  ? '#E31A1C' :
         d > 50  ? '#FC4E2A' :
         d > 20   ? '#FD8D3C' :
         d > 10   ? '#FEB24C' :
         d > 0   ? '#FED976' :
                    'none';
}


function styler(feature) {
  return {
    fillColor: getColor(feature.properties.pt_count),
    weight: 0.2,
    opacity: 1,
    color: '#EEE',
    fillOpacity: 0.7
  };
}

$.ajax({
  dataType: "json",
  //url: "/data/intensity.json",
  //url: "/data/count.json",
  url: "/data/count-large.json",
  success: function(data) {
    console.log('data', data);
    L.geoJson(data, {
      style: styler
    }).addTo(map);    
  }
}).error(function() {});