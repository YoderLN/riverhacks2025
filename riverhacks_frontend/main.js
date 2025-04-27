import './style.css';
import './ol.css';
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
import Overlay from 'ol/Overlay'; 

//Helper function: Miles to Meters
function milesToMeters(miles) {
  return miles * 1609.34;
}

// Test data
const test_data = [
  {
    "latitude": 30.2771,
    "longitude": -97.72813,
    "title": "Arbor Food Park",
    "type": "Takeout Restaurant",
  },
  {
    "latitude": 30.263567,
    "longitude": -97.76289,
    "title": "The Picnic - Food Truck Park",
    "type": "Food court",
  },
  {
    "latitude": 30.26704,
    "longitude": -97.73685,
    "title": "Food trucks",
    "type": "Mexican",
  }
];

//  Create the map first
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

//  Create a truck source
const truckSource = new VectorSource();

//  Helper function to create a marker feature
function getResurant(res) {
  const temp_mark = new Feature({
    geometry: new Point(fromLonLat([res.longitude, res.latitude]))
  });

  temp_mark.setProperties({
    title: res.title,
    type: res.type
  });

  temp_mark.setStyle(new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: 'https://cdn-icons-png.flaticon.com/512/7566/7566122.png',
      scale: 0.08,
    })
  }));

  return temp_mark;
}

//  Import restaurants 
function importResturants(arr){
  for (let i = 0; i < arr.length; i++) {
    const feature = getResurant(arr[i]);
    truckSource.addFeature(feature);
  }
}

importResturants(test_data);

//  Create a truck layer from the truckSource
const truckLayer = new VectorLayer({
  source: truckSource
});

map.addLayer(truckLayer);

//  Add center marker
const marker = new Feature({
  geometry: new Point(fromLonLat([-97.748009, 30.277269]))
});

marker.setStyle(new Style({
  image: new Icon({
    anchor: [0.5, 1],
    src: 'https://i.postimg.cc/4dQVFCcd/Purple-ACCBat.png',
    scale: 0.08
  })
}));

const vectorSource = new VectorSource({
  features: [marker]
});

const markerLayer = new VectorLayer({
  source: vectorSource
});

map.addLayer(markerLayer);


//  Set up popup
const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

const overlay = new Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250,
  },
});

map.addOverlay(overlay);

// Close the popup when X button clicked
closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

//  Show popup when clicking a marker
map.on('singleclick', function (evt) {
  map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    const title = feature.get('title');
    const type = feature.get('type');

    if (title && type) { // Only popup if feature has title/type
      content.innerHTML = '<b>' + title + '</b><br/>' + type;
      overlay.setPosition(evt.coordinate);
    }
  });
});
