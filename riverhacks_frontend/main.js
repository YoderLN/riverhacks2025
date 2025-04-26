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

// 1. Create the map (your original part)
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: fromLonLat([-97.748009, 30.277269]), // Use fromLonLat() for correct projection
    zoom: 16
  })
});

// 2. Create a marker feature
const marker = new Feature({
  geometry: new Point(fromLonLat([-97.748009, 30.277269])) // Start Location 
});

// 3. Style the marker
marker.setStyle(new Style({
  image: new Icon({
    anchor: [0.5, 1],
    src: 'https://openlayers.org/en/latest/examples/data/icon.png' // Simple marker icon
  })
}));

// 4. Create a vector source and add the marker
const vectorSource = new VectorSource({
  features: [marker]
});

// 5. Create a vector layer and add it to the map
const markerLayer = new VectorLayer({
  source: vectorSource
});

map.addLayer(markerLayer);
