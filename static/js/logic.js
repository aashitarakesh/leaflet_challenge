  // Create the tile layer that will be the background of our map
var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map earthquakeData &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
});

var grayscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map earthquakeData &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/light-v9",
    accessToken: API_KEY
});

var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map earthquakeData &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/outdoors-v9",
    accessToken: API_KEY
});

// Create two separate layer groups: one for earthquakes and one for tectonic plates
var earthquakes = new L.LayerGroup();
var tectonicPlates = new L.LayerGroup();

// Create a baseMaps object
var baseMaps = {
    "Grayscale": grayscaleMap,
    "Satellite": satelliteMap, 
    "Outdoors" :outdoorsMap
  };
  
  // Create an overlay object
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
  };
  
  // Define a map object
  var myMap = L.map("mapid", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [satelliteMap, earthquakes, tectonicPlates]
  });
  
  // Pass our map layers into our layer control
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  var geoUrl ="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
  var tectonicUrl ="https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform an API call to USGS GeoJSON Information endpoint
d3.json(geoUrl).then(function(earthquakeData) {
 console.log(earthquakeData)
  // Function to determine marker size based on magnitude of earthquake
    function markerSize(magnitude) {
    return magnitude *3;
    }
  // Function to determine style of Marker Based on the Magnitude of the Earthquake
    function styleInfo(feature) {
        return {
          opacity: 1,
          fillOpacity: 1,
          fillColor: quakeColor(feature.properties.mag),
          color: "#000000",
          radius: markerSize(feature.properties.mag),
          stroke: true,
          weight: 0.5
        };
    }
 // Function to determine the color of the earth quake by depth
    function quakeColor(depth){
        switch (true) {
            case depth < 1:
              return "#228B22";
            case depth < 2:
              return "#32CD32";
            case depth < 3:
              return "#ADFF2F";
            case depth < 4:
              return "#FFFF00";
            case depth < 5:
              return "#FF8C00";
            default:
              return "#FF4500";
        }
    }
     // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of earthquakeData in the array
   L.geoJSON(earthquakeData, {
      pointToLayer: function (feature, latlng) {
           return L.circleMarker(latlng);
      },
      style: styleInfo,
        // Binding a pop-up to each layer
      onEachFeature: function(feature, layer) {
            layer.bindPopup(`<strong>Place: </strong> ${feature.properties.place}<br><strong>Time: </strong>${new Date(feature.properties.time)}<br>
            <strong>Magnitude: </strong>${feature.properties.mag}`);
      }
      // Add earthquakeData to earthquakes LayerGroups 
    }).addTo(earthquakes);
    // Add earthquakes Layer to the Map
    earthquakes.addTo(myMap);

    // When the first API call is complete, perform another call to the earthquakeData on tectonic plates endpoint
    d3.json(tectonicUrl).then(function(tectonicData) {
     console.log(tectonicData)
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of earthquakeData in the array
        L.geoJSON(tectonicData, {
            color: "orange",
            weight: 2
        }).addTo(tectonicPlates);
        
    // Add tectonicPlates Layer to the Map
        tectonicPlates.addTo(myMap);
    });

    // Create a legend to display information about our map
    var legend = L.control({
       position: "bottomright"
    });
  
  // When the layer control is added, insert a div with the class of "legend"
    legend.onAdd = function() {
     var div = L.DomUtil.create("div", "legend");
     var magnitude = [0, 1, 2, 3, 4, 5];
     div.innerHTML = "<h4>Magnitude</h4>";
     for (var i = 0; i < magnitude.length; i++) {
        div.innerHTML += '<i style="background: ' + quakeColor(magnitude[i] + 1) + '"></i> ' +
        magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
     }
     return div;
    };
    // Add the info legend to the map
    legend.addTo(myMap);  
});
