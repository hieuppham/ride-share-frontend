import mapboxgl from 'mapbox-gl';
import { environment } from '../../../../environments/environment';
import { MapboxOptions } from 'mapbox-gl';
import { coordinatesGeocoder } from './geojson.function';

const MAPBOX_OPTIONS: MapboxOptions = {
  accessToken: environment.mapbox.accessToken,
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [105.82006363617364, 21.00317467338734],
  zoom: 15,
};

const GEOCODER_OPT_END_POINT: any = {
  accessToken: environment.mapbox.accessToken,
  localGeocoder: coordinatesGeocoder,
  marker: {
    color: 'red',
  },
  zoom: 18,
  placeholder: 'Điểm đến',
  mapboxgl: mapboxgl,
};

const GEOCODER_OPT_START_POINT: any = {
  accessToken: environment.mapbox.accessToken,
  localGeocoder: coordinatesGeocoder,
  marker: {
    color: 'green',
  },
  zoom: 18,
  placeholder: 'Điểm xuất phát',
  mapboxgl: mapboxgl,
};

export { MAPBOX_OPTIONS, GEOCODER_OPT_END_POINT, GEOCODER_OPT_START_POINT };
