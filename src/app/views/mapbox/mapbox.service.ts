import { Injectable } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import * as geojsonCustom from '../fake-data/geojsonraw.json';
import {
  Feature,
  Geometry,
  FeatureCollection,
  GeoJsonProperties,
} from 'geojson';
@Injectable({
  providedIn: 'root',
})
export class MapboxService {
  constructor() {}

  getMarkers(): mapboxgl.GeoJSONSourceRaw {
    const geoJson: mapboxgl.GeoJSONSourceRaw =
      geojsonCustom as mapboxgl.GeoJSONSourceRaw;
    return geoJson;
  }

  getFeatures(): Array<Feature<Geometry, GeoJsonProperties>> {
    const data = this.getMarkers().data as FeatureCollection<
      Geometry,
      GeoJsonProperties
    >;
    return data.features as Array<Feature<Geometry, GeoJsonProperties>>;
  }
}
