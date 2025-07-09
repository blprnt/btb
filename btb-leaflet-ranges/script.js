//Remixed from this excellent Leaflet starter: https://glitch.com/~starter-leaflet
/* global L */

/*

To get data:

  1. Visit the Status & Trends page and search for your species: https://science.ebird.org/en/status-and-trends
  2. On the species page click on 'Download'
  3. If you haven't already done so, follow the instructions to get an Access key to download eBird's science products
  4. Scroll down to find 'Range Vector (All Seasons)' - download this!
  5. Use an online converter like this one: https://mygeodata.cloud/converter/gpkg-to-geojson to convert the .gpkg file to GeoJSON
  6. Add it to your sketch in the data folder

*/

/* MAP SETUP
 */

// make the map
let map = L.map("mapid", {
  center: [45.55, -102.65], // latitude, longitude in decimal degrees (find it on Google Maps with a right click!)
  zoom: 3, // can be 0-22, higher is closer
  scrollWheelZoom: false, // don't zoom the map on scroll
});
// add the basemap tiles (I'm using openstreetmap here but you can use any tileset)
let osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);


/* EVENT HANDLERS
   Event handlers are functions that respond to events on the page. These are
   defined first so they can each be attached to the data layer and triggered on
   specific events.
*/

let geojson; // this is global because of resetHighlight

// change style
function highlightFeature(e) {
  let layer = e.target; // highlight the actual feature that should be highlighted
  layer.setStyle({
    weight: 3, // thicker border
    color: "#000", // black
    fillOpacity: 0.3, // a bit transparent
  });
}

// reset to normal style
function resetHighlight(e) {
  geojson.resetStyle(e.target);
}

// zoom to feature (a.k.a. fit the bounds of the map to the bounds of the feature
function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

//Objects to configure the layer controls
let baseMaps = {
  OpenStreetMap: osm,
};

let overlayMaps = {};

// attach the event handlers to events
function onEachFeature(feature, layer) {
  //Add each layer to the list for the layer control
  overlayMaps[feature.properties.season] = layer;
  layer.on({
    mouseover: highlightFeature, // a.k.a. hover
    mouseout: resetHighlight, // a.k.a. no longer hovering
    click: zoomToFeature, // a.k.a. clicking
  });
}

/* GET DATA
   Because the data is in a different file, it must be retrieved asynchronously. This ensures that all of
   the data has been loaded before trying to use it (in this case, add it to the map). Read more about Fetch:
   https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
*/

// get the data
fetch("data/ovbi.json")
  .then(function (response) {
    return response.json();
  })
  .then(function (json) {
    // this is where we do things with data
    doThingsWithData(json);
  });

// once the data is loaded, this function takes over
function doThingsWithData(json) {
  // assign colors to each season
  let colorObj = assignColors(json, "season");
  // add the data to the map
  geojson = L.geoJSON(json, {
    // both `style` and `onEachFeature` want a function as a value
    // the function for `style` is defined inline (a.k.a. an "anonymous function")
    // the function for `onEachFeature` is defined earlier in the file
    // so we just set the value to the function name
    style: function (feature) {
      return {
        color: colorObj[feature.properties.season], // set color based on colorObj
        weight: 1.7, // thickness of the border
        fillOpacity: 0.2, // opacity of the fill
      };
    },
    onEachFeature: onEachFeature, // call onEachFeature
  })
    .bindPopup(function (layer) {
      return layer.feature.properties.season; // use the season property as the popup value
    })
    .addTo(map);
  
  var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
}

function registerLayer(_layer) {
  console.log(_layer);
}

// create an object where each unique value in prop is a key and
// each key has a color as its value
function assignColors(json, prop) {
  // from ColorBrewer http://colorbrewer2.org
  let colors = [
    "#a6cee3", //breeding
    "#1f78b4", //non-breeding
    "#b2df8a", //postbreeding_migration
    "#33a02c", //pre-breeding_migration
  ];
  let uniquePropValues = []; // create an empty array to hold the unique values
  json.features.forEach((feature) => {
    // for each feature
    if (uniquePropValues.indexOf(feature.properties[prop]) === -1) {
      uniquePropValues.push(feature.properties[prop]); // if the value isn't already in the list, add it
    }
  });
  let colorObj = {}; // create an empty object
  uniquePropValues.forEach((prop, index) => {
    // for each unique value
    colorObj[prop] = colors[index]; // add a new key-value pair to colorObj
  });
  return colorObj;
}
