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
import {Circle, Fill, Stroke, Style}  from 'ol/style.js';
import { fromLonLat,toLonLat  } from 'ol/proj';
import Overlay from 'ol/Overlay'; 
//import from 'ol/style.js';

let ipAddress;
let startingLocation;

//currently effectively unused attempt to get initial user location
fetch('https://api.ipify.org?format=json')
.then(response => response.json())
.then(data => ipAddress = data.ip)
.catch(ipAddress = 0);

if(ipAddress != 0){
  fetch(`https://freeipapi.com/api/json/${ipAddress}`)
  .then(res=>res.json())
  .then(data=> {
    startingLocation = [data.latitude, data.longitude];
  })
  .catch(startingLocation = [-97.748009, 30.277269])
} else {
  startingLocation = [-97.748009, 30.277269];
}

const getData = (data) => {
  //values should be unique, so trying set
  const typesSet = new Set();

  for (let i = 0; i < data.length; i++) {
    // Make longitude and latitude to floats
    data[i].latitude = parseFloat(data[i].latitude);
    data[i].longitude = parseFloat(data[i].longitude);

    if(!typesSet.has(data[i].type)) typesSet.add(data[i].type);
  }

  importResturants(data);
  getTrucksList(typesSet);
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
    center: fromLonLat(startingLocation),
    zoom: 16
  })
});

//  Create a truck source
const truckSource = new VectorSource();
const trucks = {};

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
      opacity: 1
    })
  }));

  /*
  opacity switch --TODO
  */
  //console.log(temp_mark.getStyle().getImage().setOpacity(1));

  return temp_mark;
}

//  Build trucks list
function getTrucksList(set) {
  const frag = new DocumentFragment();
  set.forEach(val =>{
    const txtbox = document.createElement('input');
    const txtlabel = document.createElement('label');
    const wrapper = document.createElement('div');
    txtbox.type = "checkbox";
    txtbox.name = val;
    txtbox.value = val;
    txtbox.id = val;
    txtbox.checked = true;
    txtlabel.innerText = val;
    txtlabel.htmlFor = val;
    wrapper.appendChild(txtlabel);
    wrapper.appendChild(txtbox);
    frag.appendChild(wrapper);
  });
  document.querySelector('fieldset').appendChild(frag);
}

const typeGroups = {}; 

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
  geometry: new Point(fromLonLat(startingLocation))
});

//  User's icon
marker.setStyle(new Style({
  image: new Icon({
    anchor: [0.5, 0.5], //currently centered on mouse click
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

let truckCoords = marker.getGeometry().getCoordinates();
let distanceRounded = 0.0;
let event = {};
//more hacky manual state management
let contentUI = false;

// Close the popup when X button clicked
closer.onclick = function () {
  overlay.setPosition(undefined);
  contentUI = false;
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
      // Truck location
      truckCoords = feature.getGeometry().getCoordinates();
      event.pos = evt.coordinate;
      event.title = title;
      event.type = type;
      truckLocale = true;
      contentUI = true;
    }
  });

  if(!truckLocale) marker.setGeometry(new Point([evt.coordinate[0], evt.coordinate[1]]));

  // User location
  const userLonLat = toLonLat(marker.getGeometry().getCoordinates()); 
  const truckLonLat = toLonLat(truckCoords); 
    // Calculate distance
  const distanceMiles = getDistance(
    userLonLat[1], userLonLat[0],  // lat1, lon1
    truckLonLat[1], truckLonLat[0] // lat2, lon2
  );
  distanceRounded = distanceMiles.toFixed(2);

  if(contentUI) {
    // Update popup content
    content.innerHTML = `
        <b>${event.title}</b><br/>
        ${event.type}<br/>
        Distance: ${distanceRounded} miles`;
    overlay.setPosition(event.pos);
  }
});
