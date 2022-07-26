import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Map, MapboxOptions, NavigationControl } from 'mapbox-gl';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { Marker } from 'mapbox-gl';
import * as mapboxgl from 'mapbox-gl';
import { environment } from 'src/environments/environment';
import { MapboxService } from './mapbox.service';
import * as turf from '@turf/turf';
import { Feature } from '@turf/turf';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-mapbox',
  templateUrl: './mapbox.component.html',
  styleUrls: ['./mapbox.component.scss'],
})
export class MapboxComponent implements OnInit, AfterViewInit {
  // @Input() closeButton = true;
  private CLASS_CTRL: string = 'mapboxgl-ctrl-geocoder mapboxgl-ctrl';
  private CLASS_INPUT_CTRL: string = `mapboxgl-ctrl-geocoder--input ${this.CLASS_CTRL}`;

  private mapboxOptions: MapboxOptions = {
    accessToken: environment.mapbox.accessToken,
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-77.04, 38.907],
    zoom: 11.15,
  };

  private coordinatesGeocoder(query: string): any {
    // Match anything which looks like
    // decimal degrees coordinate pair.
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

  private geojson: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [],
  };

  private linestring: GeoJSON.Feature = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [],
    } as GeoJSON.LineString,
    properties: {
      name: 'lineString',
    },
  };

  mapRef!: Map;
  photoURL: string = './assets/img/avatars/8.jpg';
  startPoint: { lng: number; lat: number } | undefined;
  endPoint: { lng: number; lat: number } | undefined;
  currentPoint: { lng: number; lat: number } | undefined;
  ctrlTopRight!: Element;
  ctrlTopLeft!: Element;
  ctrlBottomRight!: Element;
  ctrlBottomLeft!: Element;
  startMarker: Marker | undefined;
  endMarker: Marker | undefined;

  formShare!: HTMLFormElement;
  buttonToggleFormShare!: HTMLButtonElement;
  buttonToggleSearch!: HTMLButtonElement;
  divSearch!: HTMLDivElement;
  avatar!: HTMLButtonElement;
  buttonToggleProfile!: HTMLButtonElement;
  divPopupClick!: HTMLDivElement;

  geocoderOptionsForEndPoint: any = {
    accessToken: environment.mapbox.accessToken,
    localGeocoder: this.coordinatesGeocoder,
    marker: {
      color: 'red',
    },
    placeholder: 'Điểm đến',
    mapboxgl: mapboxgl,
  };
  geocoderOptionsForStartPoint: any = {
    accessToken: environment.mapbox.accessToken,
    localGeocoder: this.coordinatesGeocoder,
    marker: {
      color: 'green',
    },
    placeholder: 'Điểm xuất phát',
    mapboxgl: mapboxgl,
  };

  geocoderOptsForShareEndPoint: any = {
    accessToken: environment.mapbox.accessToken,
    localGeocoder: this.coordinatesGeocoder,
    marker: {
      color: 'red',
    },
    placeholder: 'Điểm đến',
    mapboxgl: mapboxgl,
  };

  geocoderOptsForShareStartPoint: any = {
    accessToken: environment.mapbox.accessToken,
    localGeocoder: this.coordinatesGeocoder,
    marker: {
      color: 'green',
    },
    placeholder: 'Điểm xuất phát',
    mapboxgl: mapboxgl,
  };

  constructor(
    private mapboxService: MapboxService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initMap();
  }

  ngAfterViewInit(): void {
    this.addInputFilter();
    this.addNavigationGroup();
    this.addFormShare();
    this.addUserInfo();
    this.addHandleOnClick();
  }

  private initMap(): void {
    const map: Map = new Map(this.mapboxOptions);
    this.mapRef = map;

    map.on('load', () => {
      map.addSource('geojson', {
        type: 'geojson',
        data: this.geojson,
      });

      map.addLayer({
        id: 'measure-points',
        type: 'circle',
        source: 'geojson',
        paint: {
          'circle-radius': 5,
          'circle-color': '#000',
        },
        filter: ['in', '$type', 'Point'],
      });

      map.addLayer({
        id: 'measure-lines',
        type: 'line',
        source: 'geojson',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#000',
          'line-width': 2.5,
        },
        filter: ['in', '$type', 'LineString'],
      });
    });

    // map.on('click', (e) => {
    //   const features: mapboxgl.MapboxGeoJSONFeature[] =
    //     map.queryRenderedFeatures(e.point, {
    //       layers: ['measure-points'],
    //     });

    //   if (this.geojson.features.length > 1) this.geojson.features.pop();

    //   inputDistance.value = '';

    //   if (features.length) {
    //     const _id = features[0].properties!['id'];
    //     this.geojson.features = this.geojson.features.filter(
    //       (point) => point.properties!['id'] !== _id
    //     );
    //   } else {
    //     const point: Feature<GeoJSON.Point, GeoJSON.GeoJsonProperties> = {
    //       type: 'Feature',
    //       geometry: {
    //         type: 'Point',
    //         coordinates: [e.lngLat.lng, e.lngLat.lat],
    //       },
    //       properties: {
    //         id: String(new Date().getTime()),
    //       },
    //     };

    //     this.geojson.features.push(point);
    //   }

    //   if (this.geojson.features.length > 1) {
    //     (this.linestring.geometry as GeoJSON.LineString).coordinates =
    //       this.geojson.features.map(
    //         (point) => (point.geometry as GeoJSON.Point).coordinates
    //       );

    //     this.geojson.features.push(this.linestring);
    //     const distance = turf.length(this.linestring);
    //     inputDistance.value = `Khoảng cách: ${distance.toLocaleString()}km`;
    //   }

    //   (map.getSource('geojson') as mapboxgl.GeoJSONSource).setData(
    //     this.geojson
    //   );
    // });

    // map.on('mousemove', (e: mapboxgl.MapMouseEvent) => {
    //   const features = map.queryRenderedFeatures(e.point, {
    //     layers: ['measure-points'],
    //   });
    //   map.getCanvas().style.cursor = features.length ? 'pointer' : 'crosshair';
    // });
  }

  private addInputFilter(): void {
    this.mapRef.addControl(
      new MapboxGeocoder(this.geocoderOptionsForEndPoint),
      'top-left'
    );
    this.mapRef.addControl(
      new MapboxGeocoder(this.geocoderOptionsForStartPoint),
      'top-left'
    );
    this.ctrlTopLeft = document.getElementsByClassName(
      'mapboxgl-ctrl-top-left'
    )[0] as HTMLDivElement;
    this.ctrlTopLeft.append(
      document.getElementById('custom-filter-search') as HTMLDivElement
    );
  }

  private addFormShare(): void {
    this.mapRef.addControl(
      new MapboxGeocoder(this.geocoderOptsForShareStartPoint),
      'bottom-left'
    );
    this.mapRef.addControl(
      new MapboxGeocoder(this.geocoderOptsForShareEndPoint),
      'bottom-left'
    );

    this.ctrlBottomLeft = document.getElementsByClassName(
      'mapboxgl-ctrl-bottom-left'
    )[0] as HTMLDivElement;
    this.ctrlBottomLeft.getElementsByClassName('mapboxgl-ctrl')[2].remove();
    this.ctrlBottomLeft.append(
      document.getElementById('custom-filter-share') as HTMLDivElement,
      document.getElementById('btn-toggle-share') as HTMLButtonElement
    );
  }

  private addUserInfo(): void {
    this.ctrlTopRight = document.getElementsByClassName(
      'mapboxgl-ctrl-top-right'
    )[0] as HTMLDivElement;
    // this.ctrlTopRight.append(
    //   document.getElementById('btn-toggle-profile') as HTMLButtonElement
    // );
  }

  private addNavigationGroup(): void {
    this.mapRef.addControl(new NavigationControl(), 'bottom-right');
  }

  private addHandleOnClick(): void {
    this.ctrlBottomRight = document.getElementsByClassName(
      'mapboxgl-ctrl-bottom-right'
    )[0] as HTMLDivElement;
    (
      this.ctrlBottomRight.getElementsByClassName(
        'mapboxgl-ctrl mapboxgl-ctrl-attrib'
      )[0] as HTMLDivElement
    ).remove();

    this.divPopupClick = document.getElementById(
      'popup-click'
    ) as HTMLDivElement;

    const applyPoint: HTMLLinkElement =
      this.divPopupClick.getElementsByClassName(
        'apply-point'
      )[0] as HTMLLinkElement;

    const inputEnd: HTMLInputElement =
      this.ctrlTopLeft.getElementsByTagName('input')[0];
    const inputStart: HTMLInputElement =
      this.ctrlTopLeft.getElementsByTagName('input')[1];

    this.ctrlBottomRight.prepend(this.divPopupClick);

    applyPoint.onclick = (e: MouseEvent) => {
      this.endPoint = this.currentPoint;
      inputEnd.value = `${this.endPoint!.lat} ${this.endPoint!.lng}`;
      inputStart.focus();
      inputStart.select();
      applyPoint.style.display = 'none';
    };

    this.mapRef.on(
      'click',
      (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
        if (this.endPoint == undefined) {
          if (this.endMarker) {
            this.endMarker!.remove();
          }
          this.endMarker = new Marker({ color: 'red' })
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .addTo(this.mapRef);
        } else if (this.startPoint == undefined) {
          if (this.startMarker) {
            this.startMarker!.remove();
          }
          this.startMarker = new Marker({ color: 'green' })
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .addTo(this.mapRef);
        }
        this.currentPoint = { lng: e.lngLat.lng, lat: e.lngLat.lat };
        this.divPopupClick.style.display = 'block';
      }
    );
  }
}
