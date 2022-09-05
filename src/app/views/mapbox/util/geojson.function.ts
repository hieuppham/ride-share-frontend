import {
  GeoJSON,
  Point,
  Feature,
  FeatureCollection,
  LineString,
  GeoJsonProperties,
  Geometry,
} from 'geojson';
import {
  CircleLayer,
  EventData,
  LineLayer,
  Map,
  MapLayerMouseEvent,
  Popup,
  SymbolLayer,
} from 'mapbox-gl';
import { COLOR } from './geojson.constant';
import { FindRidesResponse } from 'src/app/interface/ride';
import 'datatables.net';
import $ from 'jquery';
import { MapboxComponent } from '../mapbox.component';

function coordinatesGeocoder(query: string): any {
  const matches = query.match(
    /^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i
  );
  if (!matches) {
    return null;
  }

  function coordinateFeature(lng: number, lat: number) {
    return {
      center: [lng, lat],
      geometry: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      place_name: 'Lat: ' + lat + ' Lng: ' + lng,
      place_type: ['coordinate'],
      properties: {},
      type: 'Feature',
    };
  }

  const coord1 = Number(matches[1]);
  const coord2 = Number(matches[2]);
  const geocodes = [];

  if (coord1 < -90 || coord1 > 90) {
    // must be lng, lat
    geocodes.push(coordinateFeature(coord1, coord2));
  }

  if (coord2 < -90 || coord2 > 90) {
    // must be lat, lng
    geocodes.push(coordinateFeature(coord2, coord1));
  }

  if (geocodes.length === 0) {
    // else could be either lng, lat or lat, lng
    geocodes.push(coordinateFeature(coord1, coord2));
    geocodes.push(coordinateFeature(coord2, coord1));
  }

  return geocodes;
}
function pointToCoordinates(
  point: Feature<Point, GeoJsonProperties>
): number[] {
  return [point.geometry.coordinates[0], point.geometry.coordinates[1]];
}

function toFeature(geometry: Geometry): Feature<Geometry, GeoJsonProperties> {
  return {
    type: 'Feature',
    geometry: geometry,
  } as Feature<Geometry, GeoJsonProperties>;
}

function twoDigit(num: number): string {
  return num < 10 ? '0' + num : num + '';
}

function dateArrayToString(date: number[]): string {
  return `${twoDigit(date[3])}:${twoDigit(date[4])} ${twoDigit(
    date[2]
  )}/${twoDigit(date[1])}/${date[0]}`;
}

function dateArrayToDateTimeLocal(date: number[]): string {
  return `${date[0]}-${twoDigit(date[1])}-${twoDigit(date[2])}T${twoDigit(
    date[3]
  )}:${twoDigit(date[4])}`;
}

function enumToStatus(status: string): string {
  let _status: string;
  switch (status) {
    case 'INACTIVE': {
      _status = 'Không hoạt động';
      break;
    }
    case 'ACTIVE': {
      _status = 'Hoạt động';
      break;
    }
    case 'UNKNOWN': {
      _status = 'Chưa được duyệt';
      break;
    }
    case 'EXPIRED': {
      _status = 'Đã kết thúc';
      break;
    }
    default: {
      _status = 'Chưa được duyệt';
      break;
    }
  }
  return _status;
}

export function extractStartPoint(
  path: Feature<LineString, GeoJsonProperties>
): Feature<Point, GeoJsonProperties> {
  const point: Feature<Point, GeoJsonProperties> = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: path.geometry.coordinates[0],
    },
    properties: null,
  };
  return point;
}

export function extractEndPoint(
  path: Feature<LineString, GeoJsonProperties>
): Feature<Point, GeoJsonProperties> {
  const point: Feature<Point, GeoJsonProperties> = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates:
        path.geometry.coordinates[path.geometry.coordinates.length - 1],
    },
    properties: null,
  };
  return point;
}

export function getPathLayer(id: string): LineLayer {
  return {
    id: `${id}-path`,
    type: 'line',
    source: `${id}-path`,
    layout: {
      'line-cap': 'butt',
      'line-join': 'round',
    },
    paint: {
      'line-color': {
        property: 'congestion',
        type: 'categorical',
        default: COLOR['blue'],
        stops: [
          ['unknown', COLOR['blue']],
          ['low', COLOR['blue']],
          ['moderate', '#f09a46'],
          ['heavy', '#e34341'],
          ['severe', '#8b2342'],
        ],
      },
      'line-width': 7,
    },
  } as LineLayer;
}

export function getPathCasingLayer(id: string) {
  return {
    id: `${id}-path-casing`,
    type: 'line',
    source: `${id}-path`,
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': COLOR['blue-dark'],
      'line-width': 12,
    },
  } as LineLayer;
}

export function getStartSymbolLayer(id: string): SymbolLayer {
  return {
    id: `${id}-start-point-label`,
    type: 'symbol',
    source: `${id}-start-point`,
    layout: {
      'text-field': 'Đ',
      'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
      'text-size': 12,
    },
    paint: {
      'text-color': '#fff',
    },
  } as SymbolLayer;
}

export function getStartPointLayer(id: string): CircleLayer {
  return {
    id: `${id}-start-point-origin`,
    type: 'circle',
    source: `${id}-start-point`,
    paint: {
      'circle-radius': 18,
      'circle-color': '#3bb2d0',
    },
  } as CircleLayer;
}

export function getEndSymbolLayer(id: string): SymbolLayer {
  return {
    id: `${id}-end-point-label`,
    type: 'symbol',
    source: `${id}-end-point`,
    layout: {
      'text-field': 'C',
      'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
      'text-size': 12,
    },
    paint: {
      'text-color': '#fff',
    },
  } as SymbolLayer;
}

export function getEndPointLayer(id: string): CircleLayer {
  return {
    id: `${id}-end-point-origin`,
    type: 'circle',
    source: `${id}-end-point`,
    paint: {
      'circle-radius': 18,
      'circle-color': '#8a8bc9',
    },
  } as CircleLayer;
}

export function addPopupToLayer(
  id: string,
  mapboxComponent: MapboxComponent,
  photoURL: string
): void {
  mapboxComponent.mapRef.on(
    'mouseenter',
    `${id}-path`,
    (e: MapLayerMouseEvent & EventData) => {
      mapboxComponent.mapRef.getCanvas().style.cursor = 'pointer';
      mapboxComponent.imagePopup.nativeElement.src = photoURL;
      mapboxComponent.imagePopup.nativeElement.className = 'block';
      mapboxComponent.imagePopup.nativeElement.addEventListener(
        'click',
        (e: MouseEvent) => {
          mapboxComponent.toggleRideInfoModal(id);
        }
      );
      mapboxComponent.popup
        .setLngLat(e.lngLat)
        .setDOMContent(mapboxComponent.imagePopup.nativeElement)
        .addTo(mapboxComponent.mapRef);
    }
  );
}

export {
  coordinatesGeocoder,
  pointToCoordinates,
  toFeature,
  dateArrayToString,
  enumToStatus,
  dateArrayToDateTimeLocal,
};
