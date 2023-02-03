import {Feature, Map, Overlay, View} from 'ol/index.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Point} from 'ol/geom.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {useGeographic} from 'ol/proj.js';
import Icon from 'ol/style/Icon';

useGeographic();

const place = [80, 16];

const point = new Point(place);

const layer1 = new TileLayer({
  source: new OSM(),
});
const pp = new Feature(point);
const layer2 = new VectorLayer({
  source: new VectorSource({
    features: pp,
  }),
  style: {
    'circle-radius': 9,
    'circle-fill-color': 'red',
  },
});
const map = new Map({
  
  target: 'map',
  view: new View({
    center: place,
    zoom: 8,
  }),
  layers: [layer1],
});

const element = document.getElementById('popup');

const popup = new Overlay({
  element: element,
  stopEvent: false,
});
map.addOverlay(popup);

function formatCoordinate(coordinate) {
  return `
    <table>
      <tbody>
        <tr><th>lon</th><td>${coordinate[0].toFixed(9)}</td></tr>
        <tr><th>lat</th><td>${coordinate[1].toFixed(9)}</td></tr>
      </tbody>
    </table>`;
}

const view = map.getView();
const info = document.getElementById('info');
const log = document.getElementById('log');
map.on('moveend', function () {
  const center = view.getCenter();
  info.innerHTML = formatCoordinate(center);
  log.innerHTML = formatCoordinate(center);
});

let popover;
map.on('click', function (event) {
  if (popover) {
    popover.dispose();
    popover = undefined;
  }
  const feature = map.getFeaturesAtPixel(event.pixel)[0];
  if (!feature) {
    return;
  }
  const coordinate = feature.getGeometry().getCoordinates();
  popup.setPosition([
    coordinate[0] + Math.round(event.coordinate[0] / 360) * 360,
    coordinate[1],
  ]);

  popover = new bootstrap.Popover(element, {
    container: element.parentElement,
    content: formatCoordinate(coordinate),
    html: true,
    offset: [0, 20],
    placement: 'top',
    sanitize: false,
  });
  popover.show();
});
  
map.on('pointermove', function (event) {
  const type = map.hasFeatureAtPixel(event.pixel) ? 'pointer' : 'inherit';
  map.getViewport().style.cursor = type;
});
