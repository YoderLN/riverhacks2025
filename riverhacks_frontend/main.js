import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import { fromLonLat } from 'ol/proj';
import Circle from 'ol/geom/Circle';
import { Fill, Stroke } from 'ol/style';

// ✅ 0. Helper function: Miles to Meters
function milesToMeters(miles) {
  return miles * 1609.34;
}

const test_data ={
  'test1': {
"latitude": 30.2771,
 "longitude": -97.72813,
 "title": "Arbor Food Park",
 "type": "Takeout Restaurant",
},
'test2': {
"latitude": 30.263567,
  "longitude": -97.76289,
   "title": "The Picnic - Food Truck Park",
      "type": "Food court",
},
'test3' : {
"latitude": 30.26704,
        "longitude": -97.73685,
      "title": "Food trucks",
      "type": "Mexican",
}}

function importResturants(obj){
  const temp_mark = new Feature({
    geometry: new Point(fromLonLat([obj.test1.longitude,obj.test1.latitude]))
  })
temp_mark.setStyle(
  new Style({
    image: new Icon({
      anchor: [0.5, 1],
    src: 'https://openlayers.org/en/latest/examples/data/icon.png'
    })
  }))
const vectorSource = new VectorSource({
    features: [temp_mark]
  });
  
  // 5. Create a vector layer for the marker
 return new VectorLayer({
    source: vectorSource
  });
}

// 1. Create the map
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: fromLonLat([-97.748009, 30.277269]),
    zoom: 16
  })
});

// 2. Create a marker feature
const marker = new Feature({
  geometry: new Point(fromLonLat([-97.748009, 30.277269]))
});

// 3. Style the marker
marker.setStyle(new Style({
  image: new Icon({
    anchor: [0.5, 1],
    src: 'https://openlayers.org/en/latest/examples/data/icon.png'
  })
}));

// 4. Create a vector source and add the marker
const vectorSource = new VectorSource({
  features: [marker]
});

// 5. Create a vector layer for the marker
const markerLayer = new VectorLayer({
  source: vectorSource
});

map.addLayer(markerLayer);
map.addLayer(importResturants(test_data));


// 6. Create a circle with radius 10 miles
const center = marker.getGeometry().getCoordinates(); // ✅ now use the marker's real location

const radiusInMiles = 1; // 10 miles
const radiusInMeters = milesToMeters(radiusInMiles);

const circleFeature = new Feature({
  geometry: new Circle(center, radiusInMeters)
});

circleFeature.setStyle(new Style({
  stroke: new Stroke({
    color: 'red',
    width: 2
  }),
  fill: new Fill({
    color: 'rgba(255, 0, 0, 0.1)'
  })
}));

const circleSource = new VectorSource({
  features: [circleFeature]
});

const circleLayer = new VectorLayer({
  source: circleSource
});

map.addLayer(circleLayer);


