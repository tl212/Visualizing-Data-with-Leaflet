API_KEY = "pk.eyJ1IjoicmVhbGdlbml1cyIsImEiOiJjanZlNGxlOGQwYWhzNGNrd2xibGZ3c2o4In0.I9mXUnfXdhmgNt0-cmXDxw"

var earthquakes = "";
var tectonic_plates = "";

var usgsurl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonic_data = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

var myStyle = {
  "color": "#ff7800",
  "weight": 5,
  "opacity": 0.65
};

d3.json(usgsurl, function(error, data) {
    if (error) {
        console.error("Got error reading USGS earthquake geo json data : ", error);
        throw error;
    }
    earthquakes = mark_earthquakes(data.features);
    console.log("Read earchquake json data")
    d3.json(tectonic_data, function(error, data) {
      if (error) {
          console.error("Got error reading tectonic geo json data : ", error);
          throw error;
      }
      console.log("tectonic plate data", data)

      tectonic_plates = L.geoJSON(data, {
        style: function (feature) {
          return {color: "orange", opacity:1, fill:false};
          }
      });
      createMap(earthquakes, tectonic_plates);
    });
});



console.log("Outside:", earthquakes)


function mark_earthquakes(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }
    function set_color(mag) {
        if (mag >5) {return "red";}
        if (mag >4) {return "orange";}
        if (mag>3) {return "MistyRose";}
        if (mag>2) {return "coral";}
        if (mag >1) {return "lightgreen";}
        else {return "green";}
    }

    function circlemarker(feature, latlng) {
        var geojsonMarkerOptions = {
            radius: feature.properties.mag*3,
            fillColor: set_color(feature.properties.mag),
            color: "black" ,
            weight: 0.1,
            opacity: 1,
            fillOpacity: 0.8
        };
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: onEachFeature,
      pointToLayer : circlemarker
    });

    // Sending our earthquakes layer to the createMap function
    return earthquakes;
  }


function createMap(earthquakes, tectonic_plates) {
    console.log("In the function", earthquakes, "something")

    // Define streetmap and darkmap layers
    var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.outdoors",
      accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.dark",
      accessToken: API_KEY
    });

    var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.satellite",
      accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Outdoors": outdoors,
      "Gray Scale": darkmap,
      "Satellite":satellite
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes,
      Plates : tectonic_plates
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [outdoors,earthquakes, tectonic_plates]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

      // Setting up the legend
    var legend = L.control({ position: "bottomright" });
    mags = ["5+","4-5","3-4","2-3","1-2","<1"];
    colors = ["red","orange", "MistyRose","coral","lightgreen","green"];
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        div.innerHTML = "<strong>Earthquake Magnitude</strong> <br>";
        for (var i=0;i<mags.length;i++){
          div.innerHTML +=
            '<i class ="circle" style="background:' +colors[i] +
            '">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</i>&nbsp&nbsp&nbsp&nbsp'+mags[i]+'<br>';
        }
        return div;
    };

    // Adding legend to the map
    legend.addTo(myMap);

  }
