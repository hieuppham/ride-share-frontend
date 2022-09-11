import mapboxgl from 'mapbox-gl';
import { environment } from '../../../../environments/environment';
import { MapboxOptions } from 'mapbox-gl';
import { coordinatesGeocoder } from './geojson.function';

export const MAP_URL: string = 'mapbox://styles/mapbox/';
export const MAP_STYLE_STREETS: string = 'streets-v11';
export const MAP_STYLE_DARK: string = 'dark-v10';

const MAPBOX_OPTIONS: MapboxOptions = {
  accessToken: environment.mapbox.accessToken,
  container: 'map',
  style: MAP_URL + MAP_STYLE_STREETS,
  zoom: 5,
  center: [106.95859399778641, 16.78288117290175],
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

const GEOCODER_OPT_SEARCH: any = {
  accessToken: environment.mapbox.accessToken,
  localGeocoder: coordinatesGeocoder,
  marker: {
    color: '#048c2c',
  },
  zoom: 18,
  placeholder: '       Khu vực',
  mapboxgl: mapboxgl,
};

interface Color {
  [key: string]: string;
}

export const COLOR: Color = {
  pink: '#e3adbe',
  'pink-dark': '#b75676',
  blue: '#4fd2f4',
  'blue-dark': '#3a63b8',
  red: '#f20007',
};

export {
  MAPBOX_OPTIONS,
  GEOCODER_OPT_END_POINT,
  GEOCODER_OPT_START_POINT,
  GEOCODER_OPT_SEARCH,
};
