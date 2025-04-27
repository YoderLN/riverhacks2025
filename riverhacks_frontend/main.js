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
import { fromLonLat,toLonLat  } from 'ol/proj';
import Overlay from 'ol/Overlay'; 

const getData = (data) => {
  importResturants(data);
}
const url = "http://localhost:5173/data.json";
const req = new XMLHttpRequest();
req.responseType = 'json';
req.onload = () => { getData(req.response) };
req.open("GET", url);
req.send();

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
    truckSource.addFeature(getResurant(arr[i]));
  }
}

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
    anchor: [0.5, 0.5],
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

// save marker location (can be used as user position later)
const userCoordinates = marker.getGeometry().getCoordinates();

const getDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => value * Math.PI / 180;

  lat1 = toRad(lat1);
  lon1 = toRad(lon1);
  lat2 = toRad(lat2);
  lon2 = toRad(lon2);

  return Math.acos(
    Math.sin(lat1) * Math.sin(lat2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)
  ) * 3958.8; // Earth radius in miles
};


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
  //hacky bool to ensure user icon doesn't overalp trucks
  let truckLocale = false;

  map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    const title = feature.get('title');
    const type = feature.get('type');

    if (title && type) {
      truckLocale = true;

      // Truck location
      const truckCoords = feature.getGeometry().getCoordinates();
      const truckLonLat = toLonLat(truckCoords); 

      // User location
      const userLonLat = toLonLat(userCoordinates); 

      // Calculate distance
      const distanceMiles = getDistance(
        userLonLat[1], userLonLat[0],  // lat1, lon1
        truckLonLat[1], truckLonLat[0] // lat2, lon2
      );

      const distanceRounded = distanceMiles.toFixed(2); // round to 2 decimal places

      // Update popup content
      content.innerHTML = `
        <b>${title}</b><br/>
        ${type}<br/>
        Distance: ${distanceRounded} miles
      `;

      overlay.setPosition(evt.coordinate);
    }
  });

  if(!truckLocale) marker.setGeometry(new Point([evt.coordinate[0], evt.coordinate[1]]));
});
