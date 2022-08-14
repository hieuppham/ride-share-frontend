import { AfterViewInit, Component, OnInit } from '@angular/core';
import { IRideResponseDto } from '../../interface/ride-reponse-dto';
import { DatePipe } from '@angular/common';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Map, EventData, MapboxEvent, LineLayer } from 'mapbox-gl';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import {
  Marker,
  MapMouseEvent,
  GeoJSONSource,
  LngLat,
  GeoJSONSourceRaw,
} from 'mapbox-gl';

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
import { IRide } from 'src/app/interface/ride';

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
  GEOCODER_OPT_SEARCH,
  GEOCODER_OPT_START_POINT,
  MAPBOX_OPTIONS,
} from './util/geojson.constant';

import { initView } from './util/view.config';
import $ from 'jquery';
import 'datatables.net';
import { lineOffset } from '@turf/turf';

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
    this.loadRidesByBound();
  }

  private dataTable: any = null;

  ngAfterViewInit(): void {
    this.loadDataTable();
    initView(this);
    this.loadTopLeft();
    this.loadBottomLeft();
    this.loadUserInfo();
  }

  public vehicle(type: string): string {
    return type === 'motobike' ? 'Xe máy' : 'Ô tô';
  }

  public avatar(url: string): string {
    return `<img class="rounded-circle" src="${url}" width="40" height="40">`;
  }

  public ridesInBound: IRideResponseDto[] = [];

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

  user!: IUser;
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
  // avatar!: HTMLButtonElement;
  buttonToggleProfile!: HTMLButtonElement;
  divButtonApplyWrapper!: HTMLDivElement;
  buttonApplyPoint!: HTMLButtonElement;
  inputDistance!: HTMLInputElement;

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

  rideInfoModalVisible: boolean = false;
  chosenRide: IRideResponseDto | undefined;

  formShareRide: FormGroup = new FormGroup({
    uid: new FormControl(''),
    distance: new FormControl(0),
    startTime: new FormControl(''),
    endTime: new FormControl(''),
    startPoint: new FormControl(''),
    endPoint: new FormControl(''),
    path: new FormControl(''),
    vehicle: new FormControl(''),
    criterions: new FormControl(''),
    note: new FormControl(''),
  });

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

  onSubmitFormUserInfo(): void {
    this.formUserInfo.value['uid'] = this.user.uid;
    this.userService.upsertUser(this.formUserInfo.value).subscribe({
      next: (res) => {
        this.user = res;
      },
      error: (err) => console.error(err),
    });
  }

  onSubmitFormShare(): void {
    this.formShareRide.patchValue({
      uid: this.user.uid,
      startPoint: this.currentStartPointShare,
      endPoint: this.currentEndPointShare,
      path: this.dataPathShare,
      distance: parseFloat(
        this.inputDistanceMeasureShare.value.replace('km', '')
      ),
    });
    this.formShareRide.value['vehicle'] = this.user?.vehicles?.filter(
      (v) => v.name == this.formShareRide.value['vehicle']
    )[0];
    this.formShareRide.value['criterions'] = (
      this.formShareRide.value['criterions'] as string
    )
      .split(',')
      .map((c) => c.trim());

    this.mapboxService.createRide(this.formShareRide.value).subscribe({
      next: (res) => {
        this.loadAllRides();
      },
      error: (err) => console.error(err),
    });
    this.formShareRide.reset();
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

  public gender(gender: string): string {
    return gender === 'female' ? 'Nữ' : 'male' ? 'Nam' : 'Cả nam và nữ';
  }

  loadMap(): void {
    this.mapRef = new Map(MAPBOX_OPTIONS);
    this.mapRef.on('load', (e: MapboxEvent<undefined> & EventData) => {
      this.loadAllRides();
      this.mapRef.addSource('geojson', {
        type: 'geojson',
        data: this.dataPointShare,
      } as GeoJSONSourceRaw);

      this.mapRef.addLayer({
        id: 'share-points',
        type: 'circle',
        source: 'geojson',
        paint: {
          'circle-radius': 5,
          'circle-color': '#000',
        },
        filter: ['in', '$type', 'Point'],
      });

      this.mapRef.addLayer({
        id: 'share-line',
        type: 'line',
        source: 'geojson',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#000',
          'line-width': 3,
        },
        filter: ['in', '$type', 'LineString'],
      });
    });

    this.mapRef.on(
      'moveend',
      (
        e: MapboxEvent<MouseEvent | TouchEvent | WheelEvent | undefined> &
          EventData
      ) => {
        this.loadRidesByBound();
      }
    );

    this.mapRef.on('mousemove', (e: MapMouseEvent) => {
      const features = this.mapRef.queryRenderedFeatures(e.point, {
        layers: ['share-points', 'share-line'],
      });

      this.mapRef.getCanvas().style.cursor = features.length
        ? 'pointer'
        : 'crosshair';
    });

    this.mapRef.on('click', (e: MapMouseEvent) => {
      const features = this.mapRef.queryRenderedFeatures(e.point, {
        layers: ['share-points'],
      });

      if (features.length > 0) {
        this.removeSharePoint(features[0] as Feature<Point, GeoJsonProperties>);
      } else {
        this.addSharePoint(e);
      }
    });
  }

  addSharePoint(e: MapMouseEvent): void {
    const _line = this.dataPointShare.features.pop();
    const _end = this.dataPointShare.features.pop();

    this.dataPointShare.features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [e.lngLat.lng, e.lngLat.lat] },
      properties: {
        id: String(new Date().getTime()),
      },
    } as Feature<Point, GeoJsonProperties>);

    this.dataPointShare.features.push(_end!);
    this.dataPointShare.features.push(_line!);
    (this.dataPathShare.geometry as LineString).coordinates =
      this.dataPointShare.features.map(
        (point) => (point.geometry as Point).coordinates
      );
    this.dataPointShare.features.push(this.dataPathShare);
    (this.mapRef.getSource('geojson') as GeoJSONSource).setData(
      this.dataPointShare
    );
  }

  removeSharePoint(feature: Feature<Point, GeoJsonProperties>): void {
    this.dataPointShare.features = this.dataPointShare.features.filter(
      (f) => f != feature
    );
    (this.dataPathShare.geometry as LineString).coordinates =
      this.dataPointShare.features.map(
        (point) => (point.geometry as Point).coordinates
      );
    this.dataPointShare.features.push(this.dataPathShare);
    (this.mapRef.getSource('geojson') as GeoJSONSource).setData(
      this.dataPointShare
    );
  }

  loadDataTable(): void {
    $(() => {
      this.dataTable = $('#table_id').DataTable({
        autoWidth: true,
        scrollCollapse: true,
        info: false,
        lengthChange: false,
        pageLength: 5,
        jQueryUI: true,
        searching: false,
        pagingType: 'simple',
        scrollY: '285px',
        data: this.ridesInBound,
        language: {
          paginate: {
            first: 'Đầu',
            last: 'Cuối',
            next: 'Kế',
            previous: 'Trước',
          },
          zeroRecords: 'Không tìm được chuyến',
          // info: 'fádfs- _PAGE_ of _PAGES_',
          // infoPostFix: 'fád-',
          // infoFiltered: 'fasdf-',
          // infoEmpty: 'fsadf-',
        },
        columns: [
          {
            data: 'user.photoUrl',
            className: 'text-center',
            render: (data, type, row, meta) => {
              return this.avatar(data);
            },
            orderable: false,
          },
          {
            data: 'vehicle.type',
            className: 'text-center',
            render: (data, type, row, meta) => {
              return this.vehicle(data);
            },
          },
          {
            data: 'startTime',
          },
          { data: 'endTime' },
          {
            data: 'distance',
            render: (data, type, row, meta) => {
              return `${data} km`;
            },
          },
          { data: 'criterions', searchable: true },
        ],
      });

      $('#table_id tbody').on('click', 'tr', (target: any) => {
        this.chosenRide = this.ridesInBound[target.currentTarget._DT_RowIndex];
        console.log(this.chosenRide);

        this.rideInfoModalVisible = !this.rideInfoModalVisible;
      });

      // set canvas w-100
      $('canvas.mapboxgl-canvas').addClass('w-100');

      $(document).on('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key == 'x') {
          this.toggleDataTable();
        }
      });
    });
  }

  showRideInfo(): void {}

  loadRidesByBound(): void {
    this.mapboxService
      .getByBound(
        this.mapRef.getBounds().getSouthWest().toArray(),
        this.mapRef.getBounds().getNorthEast().toArray()
      )
      .subscribe({
        next: (res) => {
          this.ridesInBound = res;
          this.updateDataTable(res);
        },
        error: (err) => alert(err),
      });
  }

  updateDataTable(data: any): void {
    this.dataTable?.clear();
    this.dataTable.rows.add(data).draw();
  }

  loadAllRides(): void {
    this.mapboxService.getAllRides().subscribe({
      next: (res) => {
        for (let rideResponseDto of res) {
          this.mapRef.addSource(`${rideResponseDto._id}-line`, {
            type: 'geojson',
            data: rideResponseDto.path,
          });

          this.mapRef.addSource(`${rideResponseDto._id}-start-point`, {
            type: 'geojson',
            data: rideResponseDto.startPoint,
          });

          this.mapRef.addSource(`${rideResponseDto._id}-end-point`, {
            type: 'geojson',
            data: rideResponseDto.endPoint,
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
    this.mapRef.addControl(new MapboxGeocoder(GEOCODER_OPT_SEARCH), 'top-left');
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
        this.currentChosenPoint = getNewPoint(e);
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
        this.currentChosenPoint = getNewPoint(e);
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
    } else {
      this.formShareWrapper.style.display = 'block';
    }
  }

  navigateToAdminPage(): void {
    console.log('admin');

    this.router.navigate(['/admin'], {
      queryParams: { uid: this.user!.uid },
    });
  }

  private newStartMarker(
    old: Marker | undefined,
    point: GeoJSON.Feature<Point, GeoJsonProperties>
  ): Marker {
    this.currentStartPointShare = point;
    if (old) {
      old.remove();
    }
    old = new Marker({ color: 'green' })
      .setLngLat([point.geometry.coordinates[0], point.geometry.coordinates[1]])
      .addTo(this.mapRef);

    this.dataPointShare.features.pop();

    if (this.dataPointShare.features.length != 1 || !this.markerShareEnd) {
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
    )} km`;

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

    this.dataPointShare.features.pop();

    if (this.dataPointShare.features.length != 1 || !this.markerShareStart) {
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
    )} km`;

    // }
    return old;
  }

  dateToTimeStr(date: Date | undefined): string {
    console.log(date);
    return 'fasd';
    // return this.datePipe.transform(date, 'HH:mm dd-MM-YYY')!;
  }

  toggleDataTable(): void {
    $('#map').toggleClass('h-100');
    // $('div.mapboxgl-canvas-container').toggleClass('h-100');
    $('canvas.mapboxgl-canvas').toggleClass('h-100');
    $('#table-container').toggleClass('d-none');
  }
}
