import { AfterViewInit, Component, OnInit } from '@angular/core';
import { IRideResponseDto } from '../../interface/ride-reponse-dto';
import { DatePipe } from '@angular/common';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Map } from 'mapbox-gl';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { Marker, MapMouseEvent, GeoJSONSource, LngLat } from 'mapbox-gl';

import { MapboxService } from './mapbox.service';
import { ActivatedRoute } from '@angular/router';
import {
  Point,
  Feature,
  FeatureCollection,
  LineString,
  GeoJsonProperties,
  Geometry,
} from 'geojson';
import { IUser } from 'src/app/interface/user';
import { UserService } from 'src/app/user.service';
import { IRideRequestDto } from 'src/app/interface/ride-request-dto';
import { ICriteria, IRide } from 'src/app/interface/ride';

import {
  getStartPoint,
  getEndPoint,
  getPath,
  calDistance,
  getStringTimeNow,
  getNewPoint,
  pointToCoordinates,
  toFeature,
} from './util/geojson.function';

import {
  GEOCODER_OPT_END_POINT,
  GEOCODER_OPT_START_POINT,
  MAPBOX_OPTIONS,
} from './util/geojson.constant';

import { initView } from './util/view.config';
import { EEntityStatus } from 'src/app/interface/entity-status';
import $ from 'jquery';
import 'datatables.net';

@Component({
  selector: 'app-mapbox',
  templateUrl: './mapbox.component.html',
  styleUrls: ['./mapbox.component.scss'],
})
export class MapboxComponent implements OnInit, AfterViewInit {
  constructor(
    private mapboxService: MapboxService,
    private userService: UserService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMap();
  }

  ngAfterViewInit(): void {
    $(() => {
      $('#table_id').DataTable();
    });
    initView(this);
    this.loadTopLeft();
    this.loadBottomLeft();
    this.loadUserInfo();
    this.switchToSearchMode();
  }

  public rideResponse: IRideResponseDto[] = [];

  public rideResponseDtoFeatureCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features: [],
  };

  private dataPointShare: FeatureCollection = {
    type: 'FeatureCollection',
    features: [],
  };

  private dataPathShare: GeoJSON.Feature = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [],
    } as LineString,
    properties: {
      name: 'lineString',
    },
  };

  user: IUser | undefined;
  rideUser: IRide[] = [];

  formUserInfo: FormGroup = new FormGroup({
    uid: new FormControl('', [Validators.required]),
    fullName: new FormControl('', [Validators.required]),
    email: new FormControl('', Validators.required),
    dob: new FormControl('', [Validators.required]),
    gender: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required]),
    vehicles: new FormArray([]),
  });

  get vehicles(): FormArray {
    return this.formUserInfo.get('vehicles') as FormArray;
  }

  get shareCriterions(): FormArray {
    return this.formShare.get('criterions') as FormArray;
  }

  rideShow: IRideResponseDto | undefined;
  mapRef!: Map;
  photoURL: string = './assets/img/avatars/8.jpg';

  ctrlTopCenter!: HTMLDivElement;
  ctrlTopLeft!: HTMLDivElement;
  ctrlBottomRight!: HTMLDivElement;
  ctrlBottomLeft!: HTMLDivElement;
  ctrlMidRight!: HTMLDivElement;

  currentChosenPoint: GeoJSON.Feature<Point, GeoJsonProperties> | undefined;

  buttonAdminPage!: HTMLButtonElement;
  buttonToggleSearch!: HTMLButtonElement;
  divSearch!: HTMLDivElement;
  avatar!: HTMLButtonElement;
  buttonToggleProfile!: HTMLButtonElement;
  divButtonApplyWrapper!: HTMLDivElement;
  buttonApplyPoint!: HTMLButtonElement;
  inputDistance!: HTMLInputElement;

  // search
  inputStartSearch!: HTMLInputElement;
  inputEndSearch!: HTMLInputElement;
  inputMaxDistanceSearch!: HTMLInputElement;
  inputTimeStartSearch!: HTMLInputElement;
  selectGenderOwner!: HTMLSelectElement;
  selectGenderAllow!: HTMLSelectElement;
  selectVehicleType!: HTMLSelectElement;
  markerSearchStart: Marker | undefined;
  markerSearchEnd: Marker | undefined;
  currentEndPointSearch: GeoJSON.Feature<Point, GeoJsonProperties> | undefined;
  currentStartPointSearch:
    | GeoJSON.Feature<Point, GeoJsonProperties>
    | undefined;
  // end search

  // form share
  formShareWrapper!: HTMLFormElement;
  buttonToggleFormShare!: HTMLButtonElement;
  formShareDivStart!: HTMLDivElement;
  formShareDivEnd!: HTMLDivElement;
  inputStartShare!: HTMLInputElement;
  inputEndShare!: HTMLInputElement;
  inputDistanceMeasureShare!: HTMLInputElement;

  markerShareStart: Marker | undefined;
  markerShareEnd: Marker | undefined;

  currentStartPointShare: GeoJSON.Feature<Point, GeoJsonProperties> | undefined;
  currentEndPointShare: GeoJSON.Feature<Point, GeoJsonProperties> | undefined;
  buttonShowMyRides!: HTMLButtonElement;
  // end form share

  formShare: FormGroup = new FormGroup({
    uid: new FormControl(''),
    distance: new FormControl(0),
    startTime: new FormControl(''),
    endTime: new FormControl(''),
    startPoint: new FormControl(''),
    endPoint: new FormControl(''),
    path: new FormControl(''),
    vehicle: new FormControl(''),
    criterions: new FormArray([]),
    note: new FormControl(''),
  });

  private defaultPoint: Feature<Point, GeoJsonProperties> = getNewPoint(
    new LngLat(105.82014860766915, 21.00304388986788)
  );
  private startPointSearch: Feature<Point, GeoJsonProperties> =
    this.defaultPoint;
  private endPointSearch: Feature<Point, GeoJsonProperties> = this.defaultPoint;
  private maxDistanceSearch: number = 1000;
  private startTimeSearch: string = getStringTimeNow();
  criterionsSearch: ICriteria[] = [];
  private vehicleTypeSearch: string = 'both';

  addSearchCriteria(): void {
    this.criterionsSearch.push({ name: '', value: '' });
  }

  removeSearchCriteria(index: number) {
    this.criterionsSearch.splice(index, 1);
  }

  addVehicle(): void {
    this.vehicles.push(
      new FormGroup({
        type: new FormControl('', [Validators.required]),
        name: new FormControl('', Validators.required),
        licensePlateNumber: new FormControl('', Validators.required),
      })
    );
  }

  removeVehicle(index: number): void {
    this.vehicles.removeAt(index);
  }

  addCriteria(): void {
    this.shareCriterions.push(
      new FormGroup({
        name: new FormControl(''),
        value: new FormControl(''),
      })
    );
  }

  removeCriteria(index: number): void {
    this.shareCriterions.removeAt(index);
  }

  onSubmitFormUserInfo(): void {
    this.formUserInfo.value['uid'] = this.user!.uid;
    this.userService.updateUser(this.formUserInfo.value).subscribe({
      next: (res) => {
        this.user = res;
      },
      error: (err) => console.error(err),
    });
  }

  onSubmitFormShare(): void {
    this.formShare.patchValue({
      uid: this.user?.uid,
      startPoint: getStartPoint(this.dataPointShare),
      endPoint: getEndPoint(this.dataPointShare),
      path: getPath(this.dataPointShare),
      distance: parseFloat(
        this.inputDistanceMeasureShare.value.replace('km', '')
      ),
    });

    this.formShare.value['vehicle'] = this.user?.vehicles?.filter(
      (v) => v.name == this.formShare.value['vehicle']
    )[0];

    this.mapboxService.createRide(this.formShare.value).subscribe({
      next: (res) => {
        this.loadAllRides();
      },
      error: (err) => console.error(err),
    });
    this.toggleFormShare();
  }

  // checked //
  private loadUserInfo(): void {
    const uid = this.route.snapshot.queryParamMap.get('uid')!;
    this.userService.getUserByUID(uid).subscribe({
      next: (res) => {
        this.user = res;
        this.formUserInfo = new FormGroup({
          userId: new FormControl(this.user?.id, [Validators.required]),
          fullName: new FormControl(this.user?.fullName, [Validators.required]),
          dob: new FormControl(
            this.datePipe.transform(new Date(this.user?.dob!), 'yyyy-MM-dd'),
            [Validators.required]
          ),
          gender: new FormControl(this.user?.gender, [Validators.required]),
          phone: new FormControl(this.user?.phone, [Validators.required]),
          email: new FormControl(this.user?.email, Validators.required),
          vehicles: new FormArray([]),
        });

        this.user?.vehicles?.forEach((v) => {
          this.vehicles.push(
            new FormGroup({
              type: new FormControl(v.type, [Validators.required]),
              name: new FormControl(v.name, Validators.required),
              licensePlateNumber: new FormControl(
                v.licensePlateNumber,
                Validators.required
              ),
            })
          );
        });
      },
    });

    this.mapboxService.getRidesByUid(uid).subscribe({
      next: (res) => {
        this.rideUser = res;
      },
    });
  }

  public showRide(id: string) {
    for (let ride of this.rideResponse) {
      if (ride._id == id) {
        this.rideShow = ride;
      }
    }
  }

  public vehicle(type: string): string {
    return type === 'motobike' ? 'Xe máy' : 'Ô tô';
  }

  public gender(gender: string): string {
    return gender === 'female' ? 'Nữ' : 'male' ? 'Nam' : 'Cả nam và nữ';
  }

  private loadMap(): void {
    const map: Map = new Map(MAPBOX_OPTIONS);
    this.mapRef = map;
    map.on('load', () => {
      map.addSource('geojson', {
        type: 'geojson',
        data: this.dataPointShare,
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
          'line-width': 4,
        },
        filter: ['in', '$type', 'LineString'],
      });

      this.loadAllRides();
    });

    map.on('mousemove', (e: MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['measure-points'],
      });
      map.getCanvas().style.cursor = features.length ? 'pointer' : 'crosshair';
    });

    map.on('mousemove', (e: MapMouseEvent) => {
      const feature = map.queryRenderedFeatures(e.point, {
        layers: ['measure-lines'],
      });
      map.getCanvas().style.cursor = feature.length ? 'pointer' : 'crosshair';
    });
  }

  private loadAllRides(): void {
    this.mapboxService
      .findRides({ status: EEntityStatus.ACTIVE } as IRideRequestDto)
      .subscribe({
        next: (res) => {
          for (let rideResponseDto of res) {
            this.mapRef.addSource(`${rideResponseDto._id}-line`, {
              type: 'geojson',
              data: toFeature(rideResponseDto.path),
            });

            this.mapRef.addSource(`${rideResponseDto._id}-start-point`, {
              type: 'geojson',
              data: toFeature(rideResponseDto.startPoint),
            });

            this.mapRef.addSource(`${rideResponseDto._id}-end-point`, {
              type: 'geojson',
              data: toFeature(rideResponseDto.endPoint),
            });

            this.mapRef.addLayer({
              id: `${rideResponseDto._id}-line`,
              type: 'line',
              source: `${rideResponseDto._id}-line`,
              layout: {
                'line-cap': 'round',
                'line-join': 'round',
              },
              paint: {
                'line-color': '#3179c0',
                'line-width': 5,
              },
              filter: ['in', '$type', 'LineString'],
            });

            this.mapRef.addLayer({
              id: `${rideResponseDto._id}-start-point`,
              type: 'circle',
              source: `${rideResponseDto._id}-start-point`,
              paint: {
                'circle-radius': 7,
                'circle-color': '#008200',
              },
              filter: ['in', '$type', 'Point'],
            });

            this.mapRef.addLayer({
              id: `${rideResponseDto._id}-end-point`,
              type: 'circle',
              source: `${rideResponseDto._id}-end-point`,
              paint: {
                'circle-radius': 7,
                'circle-color': '#ff0000',
              },
              filter: ['in', '$type', 'Point'],
            });
          }
        },
        error: (err) => console.error(err),
        complete: () => console.log('load rides done'),
      });
  }

  private loadTopLeft(): void {
    this.mapRef.addControl(
      new MapboxGeocoder(GEOCODER_OPT_START_POINT).on('result', (e) => {
        this.startPointSearch = getNewPoint(
          new LngLat(e.result.center[0], e.result.center[1]),
          e.result.place_name
        );
        this.findRides();
      }),
      'top-left'
    );
    this.mapRef.addControl(
      new MapboxGeocoder(GEOCODER_OPT_END_POINT).on('result', (e) => {
        this.endPointSearch = getNewPoint(
          new LngLat(e.result.center[0], e.result.center[1]),
          e.result.place_name
        );
        this.findRides();
      }),
      'top-left'
    );
    this.ctrlTopLeft.append(
      document.getElementById('custom-filter-search') as HTMLDivElement
    );

    this.inputStartSearch = this.ctrlTopLeft.getElementsByTagName(
      'input'
    )[0] as HTMLInputElement;
    this.inputStartSearch.onchange = () => {
      this.findRides();
    };

    this.inputEndSearch = this.ctrlTopLeft.getElementsByTagName(
      'input'
    )[1] as HTMLInputElement;
    this.inputEndSearch.onchange = () => {
      this.findRides();
    };

    this.inputMaxDistanceSearch = document.getElementById(
      'max-distance'
    ) as HTMLInputElement;
    this.inputMaxDistanceSearch.onchange = () => {
      this.maxDistanceSearch = parseFloat(this.inputMaxDistanceSearch.value);
      this.findRides();
    };

    this.inputTimeStartSearch = document.getElementById(
      'time-start-search'
    ) as HTMLInputElement;
    this.inputTimeStartSearch.onchange = () => {
      this.startTimeSearch = this.inputTimeStartSearch.value;
      this.findRides();
    };

    // criteria

    this.selectVehicleType = document.getElementById(
      'vehicle-type'
    ) as HTMLSelectElement;
    this.selectVehicleType.onchange = () => {
      this.vehicleTypeSearch = this.selectVehicleType.value;
      this.findRides();
    };
  }

  private loadBottomLeft(): void {
    this.ctrlBottomLeft.getElementsByClassName('mapboxgl-ctrl')[0].remove();

    this.formShareWrapper = document.getElementById(
      'form-ride-share'
    ) as HTMLFormElement;

    this.buttonToggleFormShare = document.getElementById(
      'btn-toggle-share'
    ) as HTMLButtonElement;

    //start
    this.mapRef.addControl(
      new MapboxGeocoder(GEOCODER_OPT_START_POINT).on('result', (e) => {
        this.currentChosenPoint = getNewPoint(
          {
            lng: e.result.center[0],
            lat: e.result.center[1],
          } as LngLat,
          e.result.place_name
        );
        this.currentStartPointShare = this.currentChosenPoint;
        this.markerShareStart = this.newStartMarker(
          this.markerShareStart,
          this.currentStartPointShare
        );
      }),
      'bottom-left'
    );
    this.formShareDivStart = this.ctrlBottomLeft.getElementsByClassName(
      'mapboxgl-ctrl'
    )[0] as HTMLDivElement;
    // end start

    // end
    this.mapRef.addControl(
      new MapboxGeocoder(GEOCODER_OPT_END_POINT).on('result', (e) => {
        this.currentChosenPoint = getNewPoint(
          {
            lng: e.result.center[0],
            lat: e.result.center[1],
          } as LngLat,
          e.result.place_name
        );
        this.currentEndPointShare = this.currentChosenPoint;
        this.markerShareEnd = this.newEndMarker(
          this.markerShareEnd,
          this.currentEndPointShare
        );
      }),
      'bottom-left'
    );

    this.formShareDivEnd = this.ctrlBottomLeft.getElementsByClassName(
      'mapboxgl-ctrl'
    )[0] as HTMLDivElement;
    // end end

    this.formShareWrapper.prepend(this.formShareDivStart, this.formShareDivEnd);
    this.ctrlBottomLeft.append(
      this.formShareWrapper,
      this.buttonToggleFormShare
    );

    this.inputStartShare = this.formShareDivStart.getElementsByTagName(
      'input'
    )[0] as HTMLInputElement;

    this.inputEndShare = this.formShareDivEnd.getElementsByTagName(
      'input'
    )[0] as HTMLInputElement;

    this.inputDistanceMeasureShare = document.getElementById(
      'distance-measure-share'
    ) as HTMLInputElement;

    this.buttonShowMyRides = document.getElementById(
      'btn-toggle-show-my-rides'
    ) as HTMLButtonElement;

    this.ctrlBottomLeft.append(this.buttonShowMyRides);
  }

  toggleFormShare(): void {
    if (this.formShareWrapper.style.display == 'block') {
      this.formShareWrapper.style.display = 'none';
      this.switchToSearchMode();
    } else {
      this.formShareWrapper.style.display = 'block';
      this.switchToShareMode();
    }
  }

  navigateToAdminPage(): void {
    console.log('admin');

    this.router.navigate(['/admin'], {
      queryParams: { uid: this.user!.uid },
    });
  }

  private switchToSearchMode(): void {
    // this.mapRef.on('click', (e: MapMouseEvent & EventData) => {
    //   this.currentChosenPoint = this.newPoint(e.lngLat, null);
    //   if (!this.currentStartPointSearch) {
    //     if (this.markerSearchStart) {
    //       this.markerSearchStart.remove();
    //     }
    //     this.markerSearchStart = this.newStartMarker(
    //       this.markerSearchStart,
    //       this.currentChosenPoint,
    //       'search'
    //     );
    //     this.inputStartSearch.value = `${e.lngLat.lat} ${e.lngLat.lng}`;
    //     this.displayButtonApply();
    //     this.buttonApplyPoint.onclick = () => {
    //       this.currentStartPointSearch = this.currentChosenPoint;
    //       this.hidenButtonApply();
    //     };
    //   } else if (!this.currentEndPointSearch) {
    //     if (this.markerSearchEnd) {
    //       this.markerSearchEnd.remove();
    //     }
    //     this.markerSearchEnd = this.newEndMarker(
    //       this.markerSearchEnd,
    //       this.currentChosenPoint,
    //       'search'
    //     );
    //     this.inputEndSearch.value = `${e.lngLat.lat} ${e.lngLat.lng}`;
    //     this.displayButtonApply();
    //     this.buttonApplyPoint.onclick = () => {
    //       this.currentEndPointSearch = this.currentChosenPoint;
    //       this.hidenButtonApply();
    //     };
    //   }
    // });
  }

  private switchToShareMode(): void {
    // this.mapRef.on('click', (e: MapMouseEvent & EventData) => {
    //   this.currentChosenPoint = this.newPoint(
    //     e.lngLat,
    //     `[${e.lngLat.lng} ${e.lngLat.lat}]`
    //   );
    //   this.drawLineString(e);
    // });
  }

  private findRides(): void {
    const rideRequestDto: IRideRequestDto = {
      startCoordinates: pointToCoordinates(this.startPointSearch),
      endCoordinates: pointToCoordinates(this.endPointSearch),
      maxDistance: this.maxDistanceSearch,
      startTime: this.startTimeSearch,
      criterions: this.criterionsSearch,
      vehicleType: this.vehicleTypeSearch,
      status: EEntityStatus.ACTIVE,
    };
    this.mapboxService.findRides(rideRequestDto).subscribe({
      next: (res) => {
        this.rideResponse = res;
      },
      error: (err) => console.error(err),
    });
  }

  // private drawLineString(e: MapMouseEvent & EventData): void {
  //   const features = this.mapRef.queryRenderedFeatures(e.point, {
  //     layers: ['measure-points'],
  //   });

  //   const _linestring = this.geojson.features.pop();

  //   // If a feature was clicked, remove it from the map.
  //   if (features.length) {
  //     const _start = this.geojson.features.shift();
  //     const _end = this.geojson.features.pop();
  //     const _id = features[0].properties!['id'];
  //     this.geojson.features = this.geojson.features.filter(
  //       (point) => point.properties!['id'] != _id
  //     );
  //     this.geojson.features.unshift(_start!);
  //     this.geojson.features.push(_end!);
  //   } else {
  //     const _last = this.geojson.features.pop();
  //     this.geojson.features.push(this.currentChosenPoint!);
  //     this.geojson.features.push(_last!);
  //   }

  //   // Push linestring
  //   if (this.geojson.features.length > 1) {
  //     (this.linestring.geometry as LineString).coordinates =
  //       this.geojson.features.map(
  //         (point) => (point.geometry as Point).coordinates
  //       );
  //     this.geojson.features.push(this.linestring);
  //     // this.inputDistanceMeasureShare.value = `${turf.length(
  //     //   this.linestring
  //     // )}km`;
  //     // this.formShare.value['distance'] = this.inputDistanceMeasureShare.value;
  //   }
  //   (this.mapRef.getSource('geojson') as GeoJSONSource).setData(this.geojson);
  // }

  private displayButtonApply(): void {
    this.divButtonApplyWrapper.style.display = 'block';
  }

  private hidenButtonApply(): void {
    this.divButtonApplyWrapper.style.display = 'none';
  }

  private newStartMarker(
    old: Marker | undefined,
    point: GeoJSON.Feature<Point, GeoJsonProperties>,
    mode?: string
  ): Marker {
    this.currentStartPointShare = point;
    if (old) {
      old.remove();
    }
    old = new Marker({ color: 'green' })
      .setLngLat([point.geometry.coordinates[0], point.geometry.coordinates[1]])
      .addTo(this.mapRef);
    // if (!mode) {
    this.dataPointShare.features.pop();
    if (this.dataPointShare.features) {
      this.dataPointShare.features.shift();
    }
    this.dataPointShare.features.unshift(point);
    (this.dataPathShare.geometry as LineString).coordinates =
      this.dataPointShare.features.map(
        (point) => (point.geometry as Point).coordinates
      );

    this.dataPointShare.features.push(this.dataPathShare);
    (this.mapRef.getSource('geojson') as GeoJSONSource).setData(
      this.dataPointShare
    );
    this.inputDistanceMeasureShare.value = `${calDistance(
      this.dataPathShare
    )}km`;

    // }
    return old;
  }

  private newEndMarker(
    old: Marker | undefined,
    point: GeoJSON.Feature<Point, GeoJsonProperties>,
    mode?: string
  ): Marker {
    this.currentEndPointShare = point;
    if (old) {
      old.remove();
    }
    old = new Marker({ color: 'red' })
      .setLngLat([point.geometry.coordinates[0], point.geometry.coordinates[1]])
      .addTo(this.mapRef);
    // if (!mode) {
    this.dataPointShare.features.pop();
    if (this.dataPointShare.features.length > 1) {
      this.dataPointShare.features.pop();
    }
    this.dataPointShare.features.push(point);
    (this.dataPathShare.geometry as LineString).coordinates =
      this.dataPointShare.features.map(
        (point) => (point.geometry as Point).coordinates
      );

    this.dataPointShare.features.push(this.dataPathShare);
    (this.mapRef.getSource('geojson') as GeoJSONSource).setData(
      this.dataPointShare
    );
    this.inputDistanceMeasureShare.value = `${calDistance(
      this.dataPathShare
    )}km`;

    // }
    return old;
  }
}
