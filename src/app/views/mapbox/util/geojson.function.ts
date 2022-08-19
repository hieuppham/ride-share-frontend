import {
  GeoJSON,
  Point,
  Feature,
  FeatureCollection,
  LineString,
  GeoJsonProperties,
  Geometry,
} from 'geojson';
import * as turf from '@turf/turf';

import { formatDate } from '@angular/common';
import { EEntityStatus } from 'src/app/interface/entity-status';

function getStartPoint(dataPoint: FeatureCollection): Point {
  return dataPoint.features[0].geometry as Point;
}

function getEndPoint(dataPoint: FeatureCollection): Point {
  return dataPoint.features[dataPoint.features.length - 2].geometry as Point;
}

function getPath(dataPoint: FeatureCollection): GeoJSON.Point {
  return dataPoint.features[dataPoint.features.length - 1].geometry as Point;
}

function calDistance(dataPath: Feature): number {
  return Math.round(turf.length(dataPath) * 100) / 100;
}

function getStringTimeNow(): string {
  return new Date().toISOString().slice(0, 16);
}

function newPoint(e: any): GeoJSON.Feature<Point, GeoJsonProperties> {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [e.result.center[0], e.result.center[1]],
    },
    properties: {
      id: String(new Date().getTime()),
      title: e.result.place_name,
    },
  } as GeoJSON.Feature<Point, GeoJsonProperties>;
}

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

export {
  getStartPoint,
  getEndPoint,
  getPath,
  calDistance,
  getStringTimeNow,
  newPoint,
  coordinatesGeocoder,
  pointToCoordinates,
  toFeature,
  dateArrayToString,
  enumToStatus,
};
