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
  GeoJSONSourceRaw,
} from 'mapbox-gl';

import { MapboxService } from './mapbox.service';
import { StorageService } from '../../services/firebase/storage/storage.service';
import {
  Point,
  Feature,
  FeatureCollection,
  LineString,
  GeoJsonProperties,
} from 'geojson';
import { ITempImage, ITempTarget, IUser } from 'src/app/interface/user';
import { UserService } from 'src/app/services/user.service';
import { IRide } from 'src/app/interface/ride';

import {
  getStartPoint,
  getEndPoint,
  getPath,
  calDistance,
  getStringTimeNow,
  newPoint,
  pointToCoordinates,
  toFeature,
  dateArrayToString,
  enumToStatus,
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
import { AuthService } from 'src/app/services/firebase/auth/auth.service';
import { EEntityStatus } from 'src/app/interface/entity-status';

@Component({
  selector: 'app-mapbox',
  templateUrl: './mapbox.component.html',
  styleUrls: ['./mapbox.component.scss'],
})
export class MapboxComponent implements OnInit, AfterViewInit {
  constructor(
    private mapboxService: MapboxService,
    private userService: UserService,
    private storageService: StorageService,
    private datePipe: DatePipe,
    private router: Router,
    private authService: AuthService,
    private date: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadMap();
    this.loadRidesByBound();
  }

  private dataTable: any = null;

  ngAfterViewInit(): void {
    this.loadDataTable();
    initView(this);
    this.loadTopLeft();
    this.loadBottomLeft();
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

  private dataPathShare: GeoJSON.Feature<LineString, GeoJsonProperties> = {
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
    userIdImage: new FormControl('', [Validators.required]),
    vehicles: new FormArray([]),
  });

  public get vehicles(): FormArray {
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

  buttonAdminPage!: HTMLButtonElement;
  buttonToggleSearch!: HTMLButtonElement;
  divSearch!: HTMLDivElement;
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
        vehicleImage: new FormControl('', Validators.required),
        lpnImage: new FormControl('', Validators.required),
      })
    );
    this._tmpImg.vehicleImages.push({ vehicleImage: '', lpnImage: '' });
    this._tmpTarget.vehicleImages.push({ vehicleImage: null, lpnImage: null });
  }

  removeVehicle(index: number): void {
    this.vehicles.removeAt(index);
    this._tmpImg.vehicleImages.splice(index, 1);
    this._tmpTarget.vehicleImages.splice(index, 1);
  }

  async onSubmitFormUserInfo(): Promise<void> {
    this.formUserInfo.value['uid'] = this.user.uid;
    console.log(this._tmpTarget);

    await this.storageService.upload(
      this._tmpTarget.userIdImage!,
      this.user.uid,
      'userIdImage'
    );
    for (let [i, v] of this._tmpTarget.vehicleImages.entries()) {
      await this.storageService.upload(
        v.vehicleImage!,
        this.user.uid,
        'vehicleImage',
        i
      );
      await this.storageService.upload(
        v.lpnImage!,
        this.user.uid,
        'lpnImage',
        i
      );
    }

    this.userService.upsertUser(this.formUserInfo.value).subscribe({
      next: (res) => {
        this.user = res;
      },
      error: (err) => console.error(err),
    });
  }

  onSubmitFormShare(): void {
    const _ride: IRide = {
      id: null,
      uid: this.user.uid,
      startPoint: this.currentStartPointShare!,
      endPoint: this.currentEndPointShare!,
      path: this.dataPathShare!,
      startTime: new Date(),
      endTime: new Date(),
      status: EEntityStatus.UNKNOWN,
      note: this.formShareRide.value['note'],
      distance: parseFloat(
        this.inputDistanceMeasureShare.value.replace('km', '')
      ),
      vehicle: this.user?.vehicles?.filter(
        (v) => v.name == this.formShareRide.value['vehicle']
      )[0]!,
      criterions: (this.formShareRide.value['criterions'] = (
        this.formShareRide.value['criterions'] as string
      )
        .split(',')
        .map((c) => c.trim())),
    };
    this.setFormShareValue(_ride);

    this.mapboxService.createRide(this.formShareRide.value).subscribe({
      next: (res) => {
        this.loadAllRides();
      },
      error: (err) => console.error(err),
    });
    this.formShareRide.reset();
    this.toggleFormSaveRide();
  }

  // checked //
  private loadUserInfo(): void {
    const uid = localStorage.getItem('uid') as string;
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
          userIdImage: new FormControl(this.user.userIdImage || null, [
            Validators.required,
          ]),
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
              image: new FormControl(v.vehicleImage, [Validators.required]),
              lpnImage: new FormControl(v.lpnImage, Validators.required),
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
  }

  newStepPoint(e: MapMouseEvent): void {
    this.dataPointShare.features.pop();
    const _end = this.dataPointShare.features.pop();

    this.dataPointShare.features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [e.lngLat.lng, e.lngLat.lat] },
      properties: {
        id: String(new Date().getTime()),
      },
    } as Feature<Point, GeoJsonProperties>);

    this.dataPointShare.features.push(_end!);
    this.loadPathLayer();
  }

  removeStartPoint(): void {
    this.markerShareStart?.remove();
    this.dataPointShare.features.shift();
    // pop linestring
    this.dataPointShare.features.pop();
    if (this.dataPointShare.features.length == 0) {
      //
      this.currentStartPointShare = undefined;
    } else {
      // TODO:
      console.log(this.dataPathShare.geometry.coordinates);
    }
    this.loadPathLayer();
  }

  removeEndPoint(): void {
    this.markerShareEnd?.remove();
    // Pop linestring
    this.dataPointShare.features.pop();
    // pop endpoint
    this.dataPointShare.features.pop();
    if (this.dataPointShare.features.length == 0) {
      this.currentEndPointShare = undefined;
    } else {
      // TODO:
    }
    this.loadPathLayer();
  }

  removeStepPoint(feature: Feature<Point, GeoJsonProperties>): void {
    this.dataPointShare.features.pop();
    this.dataPointShare.features = this.dataPointShare.features.filter(
      (f) => f!.properties!['id'] != feature!.properties!['id']
    );
    this.loadPathLayer();
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
            render: (data, type, row, meta) => {
              return this.formatDate(data);
            },
          },
          {
            data: 'endTime',
            render: (data, type, row, meta) => {
              return this.formatDate(data);
            },
          },
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
        this.rideInfoModalVisible = !this.rideInfoModalVisible;
      });

      // set canvas w-100
      $('canvas.mapboxgl-canvas').addClass('w-100 h-100');

      $(document).on('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key == 'x') {
          console.log('toggle table data');
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
    $(() => {
      $('div.mapboxgl-ctrl-top-left')
        .append($('div#search-user'))
        .addClass('d-flex');
    });
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
      new MapboxGeocoder(GEOCODER_OPT_START_POINT)
        .on('result', (e) => {
          this.currentStartPointShare = newPoint(e);
          this.markerShareStart = this.newStartMarker(
            this.markerShareStart,
            this.currentStartPointShare
          );
        })
        .on('clear', (e) => {
          this.removeStartPoint();
        }),
      'bottom-left'
    );
    this.formShareDivStart = this.ctrlBottomLeft.getElementsByClassName(
      'mapboxgl-ctrl'
    )[0] as HTMLDivElement;
    // end start

    // end
    this.mapRef.addControl(
      new MapboxGeocoder(GEOCODER_OPT_END_POINT)
        .on('result', (e) => {
          this.currentEndPointShare = newPoint(e);
          this.markerShareEnd = this.newEndMarker(
            this.markerShareEnd,
            this.currentEndPointShare
          );
        })
        .on('clear', (e) => {
          this.removeEndPoint();
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

  toggleFormSaveRide(): void {
    if (this.formShareWrapper.style.display == 'block') {
      this.switchMapOnClickListener(false);
      this.formShareWrapper.style.display = 'none';
    } else {
      this.switchMapOnClickListener(true);
      this.formShareWrapper.style.display = 'block';
    }
  }

  switchMapOnClickListener(saveRideModeOn: boolean): void {
    if (saveRideModeOn) {
      this.mapRef.on('click', (e: MapMouseEvent & EventData) => {
        const features = this.mapRef.queryRenderedFeatures(e.point, {
          layers: ['share-points'],
        });

        if (features.length > 0) {
          this.removeStepPoint(
            features[0] as Feature<Point, GeoJsonProperties>
          );
        } else {
          if (this.dataPointShare.features.length >= 3) {
            this.newStepPoint(e);
          }
        }
      });
    } else {
      // TODO: thêm action listener vào đây
      this.mapRef.on('click', (e: MapMouseEvent & EventData) => {
        console.log('form save off');
      });
    }
  }

  navigateToAdminPage(): void {
    this.router.navigate(['/admin']);
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

    this.loadPathLayer();
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

    this.loadPathLayer();
    return old;
  }

  loadPathLayer(): void {
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
  }

  dateToTimeStr(date: Date | undefined): string {
    console.log(date);
    return 'fasd';
    // return this.datePipe.transform(date, 'HH:mm dd-MM-YYY')!
  }

  toggleDataTable(): void {
    $('#map').toggleClass('h-100');
    $('canvas.mapboxgl-canvas').toggleClass('h-100');
    $('#table-container').toggleClass('d-none');
  }

  _tmpImg: ITempImage = {
    userIdImage: '',
    vehicleImages: [],
  };

  _tmpTarget: ITempTarget = {
    userIdImage: null,
    vehicleImages: [],
  };
  private fileReader: FileReader = new FileReader();
  onSelectFile(event: Event, type: string, index?: number): void {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    if (target.files && target.files.item(0)) {
      this.fileReader.readAsDataURL(target.files.item(0)!);

      this.fileReader.onload = (e) => {
        const _url: string = e.target?.result as string;
        switch (type) {
          case 'userIdImage': {
            this._tmpImg.userIdImage = _url;
            this._tmpTarget.userIdImage = target;
            break;
          }
          case 'vehicleImage': {
            this._tmpImg.vehicleImages[index!].vehicleImage = _url;
            this._tmpTarget.vehicleImages[index!].vehicleImage = target;
            break;
          }
          case 'lpnImage': {
            this._tmpImg.vehicleImages[index!].lpnImage = _url;
            this._tmpTarget.vehicleImages[index!].lpnImage = target;
            break;
          }
          default: {
            break;
          }
        }
      };
    }
  }

  searchUserResult: IUser[] = [];
  onSearchUser(event: Event): void {
    let what = (event.target as HTMLInputElement).value.trim();
    if (what) {
      this.userService.searchUser(what).subscribe({
        next: (res) => {
          console.log('searching');
          this.searchUserResult = res;
        },
        error: (err) => console.error(err),
      });
    }
  }

  formatDate(date: number[]): string {
    return dateArrayToString(date);
  }

  chosenSearchUser: IUser | undefined;
  searchUserModalVisible: boolean = false;
  toggleSearchUserModal(user?: IUser): void {
    if (user) {
      this.chosenSearchUser = user;
    }
    this.searchUserModalVisible = !this.searchUserModalVisible;
  }

  myRidesModalVisible: boolean = false;
  toggleMyRidesModal(): void {
    this.myRidesModalVisible = !this.myRidesModalVisible;
  }

  userInfoModalVisible: boolean = false;
  toggleUserInfoModal(): void {
    this.userInfoModalVisible = !this.userInfoModalVisible;
  }

  confirmSignOutModalVisible: boolean = false;
  toggleConfirmSignOutModal(): void {
    this.toggleUserInfoModal();
    this.confirmSignOutModalVisible = !this.confirmSignOutModalVisible;
  }

  confirmSaveRideModalVisible: boolean = false;
  toggleConfirmSaveRideModal(): void {
    this.confirmSaveRideModalVisible = !this.confirmSaveRideModalVisible;
  }

  signOutApp(): void {
    this.authService.signOutApp();
  }

  dateToStr(date: any): string {
    if (date) {
      let _dateAny: any = date as any;
      let _dateNums: number[] = _dateAny as number[];
      return dateArrayToString(_dateNums);
    }
    return '';
  }

  status(status: any) {
    return enumToStatus(status as string);
  }

  showFormEditRide(ride: IRide): void {
    this.toggleMyRidesModal();
    this.toggleFormSaveRide();
    this.setFormShareValue(ride);
  }

  setFormShareValue(ride: IRide): void {
    this.formShareRide.patchValue({
      uid: ride.uid,
      startPoint: ride.startPoint,
      endPoint: ride.endPoint,
      path: ride.path,
      distance: ride.distance,
      vehicle: ride.vehicle,
      criterions: ride.criterions,
      startTime: ride.startTime,
      endTime: ride.endTime,
      note: ride.note,
    });
  }
}
