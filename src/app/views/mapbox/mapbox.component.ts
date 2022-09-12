import {
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NavigationControl } from 'mapbox-gl';

import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Map,
  EventData,
  MapboxEvent,
  Marker,
  LngLatLike,
  Popup,
  MapStyleDataEvent,
} from 'mapbox-gl';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import * as MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import { Path, Route } from 'src/app/interface/route';
import { RideService } from '../../services/ride.service';
import { StorageService } from '../../services/firebase/storage/storage.service';
import {
  Feature,
  FeatureCollection,
  LineString,
  GeoJsonProperties,
} from 'geojson';
import {
  ITempImage,
  TempVehicleImage,
  ITempTarget,
  UserDto,
  FindUsersResponse,
  UpdateUserRequest,
  VehicleDto,
} from 'src/app/interface/user';
import { UserService } from 'src/app/services/user.service';
import {
  FindRidesResponse,
  SaveRideRequest,
  FindRideDetailResponse,
  FindRidesByBoundRequest,
} from 'src/app/interface/ride';

import {
  dateArrayToDateTimeLocal,
  addRide,
  removeRide,
} from './util/geojson.function';
import {
  Confirm,
  ImageTarget,
  ResponseBody,
  RESPONSE_CODE,
  VehicleImageTarget,
} from 'src/app/interface/util';

import {
  GEOCODER_OPT_SEARCH,
  MAPBOX_OPTIONS,
  COLOR,
  MAP_STYLE_STREETS,
  MAP_URL,
  MAP_STYLE_DARK,
} from './util/geojson.constant';
import { Error } from 'src/app/interface/util';
import $ from 'jquery';
import 'datatables.net';
import { AuthService } from 'src/app/services/firebase/auth/auth.service';
import { environment } from 'src/environments/environment';
import { VehiclePipe } from 'src/app/pipes/vehicle.pipe';
import { DateInArrayPipe } from 'src/app/pipes/date-in-array.pipe';
import { AvatarPipe } from 'src/app/pipes/avatar.pipe';
import { MetricPipe } from 'src/app/pipes/metric.pipe';
import { ModalComponent } from '@coreui/angular';
import { DateInMilisecPipe } from 'src/app/pipes/date-in-milisec.pipe';
import { socketClient } from 'src/app/services/socket-client/socket.client';
import {
  ConnectInfo,
  SocketMessage,
} from 'src/app/interface/socket.interfaces';
import { timeValidator } from 'src/app/shared/form-save-ride.directive';
import { DateLocalPipe } from 'src/app/pipes/date-local.pipe';
@Component({
  selector: 'app-mapbox',
  templateUrl: './mapbox.component.html',
  styleUrls: ['./mapbox.component.scss'],
})
export class MapboxComponent implements AfterViewInit, OnDestroy {
  @ViewChild('imagePopup') imagePopup!: ElementRef<HTMLImageElement>;
  @ViewChild('rideInfoModal') rideInfoModal!: ModalComponent;

  loadAllDone: boolean = false;
  constructor(
    private rideService: RideService,
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService,
    private vehiclePipe: VehiclePipe,
    private dateInArrayPipe: DateInArrayPipe,
    private dateInMilisec: DateInMilisecPipe,
    private avatarPipe: AvatarPipe,
    private metricPipe: MetricPipe,
    private dateTimeLocalPipe: DateLocalPipe
  ) {}

  ngAfterViewInit(): void {
    this.loadAll()
      .then((res) => {})
      .catch((err) => {
        console.error(err);
      });
  }

  private setSocketClient(): void {
    if (socketClient.disconnected) {
      socketClient.connect();
      socketClient.on('new-connect', (data: ConnectInfo) => {
        this.numberOfOnlineUser = data.numberOfConnection;
      });
      socketClient.on('new-disconnect', (data: ConnectInfo) => {
        this.numberOfOnlineUser = data.numberOfConnection;
      });
      socketClient.on('ride-added', (data: SocketMessage) => {
        this.rideService.findSingleRideById(data.id).subscribe({
          next: (res) => {
            removeRide(res.id, this);
            addRide(res.id, this, res.path, res.photoURL);
            this.findRidesByBound();
          },
        });
      });
      socketClient.on('ride-removed', (data: SocketMessage) => {
        removeRide(data.id, this);
        this.findRidesByBound();
      });
    }
  }

  private async loadAll(): Promise<boolean> {
    try {
      await this.loadMap();
      this.initView();
      this.setSocketClient();
      await this.loadUser();
      await this.findRidesByBound();
      await this.loadAllRides();
      this.loadDataTable();
      await this.loadUserLocation();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  ngOnDestroy(): void {
    if (socketClient.connected) {
      socketClient.disconnect();
    }
  }

  numberOfOnlineUser: number = 0;

  // user
  formUserInfo: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    fullName: new FormControl('', [Validators.required]),
    dob: new FormControl('', [Validators.required]),
    gender: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required]),
    userIdPhotoURL: new FormControl(''),
    vehicles: new FormArray([]),
    email: new FormControl('', [Validators.required]),
  });
  user: UserDto | undefined;

  public get vehicles(): FormArray {
    return this.formUserInfo.get('vehicles') as FormArray;
  }

  imageTarget: ImageTarget = {
    userIdPhotoURL: undefined,
    userIdPhotoImage: undefined,
    vehilceImage: [],
  };

  addVehicle(vehicles?: VehicleDto[]): void {
    const id: number = this.imageTarget.vehilceImage.length;
    this.vehicles.push(
      new FormGroup({
        id: new FormControl(id, Validators.required),
        type: new FormControl('', [Validators.required]),
        name: new FormControl('', Validators.required),
        lpn: new FormControl('', Validators.required),
        image: new FormControl(''),
        lpnImage: new FormControl(''),
      })
    );
    this.imageTarget.vehilceImage.push({
      id: id,
      image: undefined,
      imageURL: undefined,
      lpnImage: undefined,
      lpnImageURL: undefined,
    });
  }
  removeVehicle(index: number): void {
    this.vehicles.controls.splice(index, 1);
  }

  removeAllVehicles(): void {
    this.vehicles.controls = [];
  }
  // end user
  private async loadUser(): Promise<void> {
    this.user = await this.userService
      .findUserById(localStorage.getItem('id')!)
      .toPromise();
    this.userIsAdmin = this.user!.email == environment.adminEmail;
    await this.loadFormUserInfo(this.user!);
    this.formSaveRide.patchValue({ userId: this.user!.id });
  }

  getDateNow(): Date {
    return new Date();
  }

  private async loadFormUserInfo(user: UserDto): Promise<void> {
    this.formUserInfo.patchValue({
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      gender: user.gender,
      dob: this.dateInMilisec.transform(user.dob, 'YYYY-MM-DD'),
      email: user.email,
      userIdPhotoURL: user.userIdPhotoURL,
    });

    this.imageTarget = {
      userIdPhotoImage: undefined,
      userIdPhotoURL: user.userIdPhotoURL,
      vehilceImage: [],
    };

    user.vehicles.forEach((v) => {
      this.vehicles.push(
        new FormGroup({
          id: new FormControl(v.id, Validators.required),
          type: new FormControl(v.type, Validators.required),
          name: new FormControl(v.name, Validators.required),
          lpn: new FormControl(v.lpn, Validators.required),
          image: new FormControl(v.image),
          lpnImage: new FormControl(v.lpnImage),
        })
      );

      this.imageTarget.vehilceImage.push({
        id: v.id,
        image: undefined,
        imageURL: v.image,
        lpnImage: undefined,
        lpnImageURL: v.lpnImage,
      });
    });
  }

  private dataTable: any = null;

  private async loadUserLocation(): Promise<void> {
    try {
      const navigator = window.navigator;
      const locationPermission = await navigator.permissions.query({
        name: 'geolocation',
      });
      this.setUserLocation(navigator, this.map);
      locationPermission.addEventListener('change', (ev: Event) => {
        this.setUserLocation(navigator, this.map);
      });
    } catch (err) {
      console.error(err);
    }
  }
  private userLocationMarker: Marker | undefined;
  private setUserLocation(navigator: Navigator, map: Map): void {
    navigator.geolocation.getCurrentPosition((p: GeolocationPosition) => {
      const location: LngLatLike = {
        lng: p.coords.longitude,
        lat: p.coords.latitude,
      };
      if (this.userLocationMarker) {
        this.userLocationMarker.remove();
      }
      this.userLocationMarker = new Marker({ color: '#dd0a21' }).setLngLat(
        location
      );
      this.userLocationMarker.addTo(map);
      map.flyTo({ center: location, zoom: 14 });
    });
  }

  public rideResponseDtoFeatureCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features: [],
  };

  saveRoute: Route | undefined;

  map!: Map;
  photoURL: string = './assets/img/avatars/8.jpg';

  formSaveRide: FormGroup = new FormGroup({
    id: new FormControl(null),
    userId: new FormControl('', Validators.required),
    route: new FormControl(null, [Validators.required]),
    startTime: new FormControl('', [Validators.required, timeValidator()]),
    endTime: new FormControl('', [Validators.required, timeValidator()]),
    vehicleId: new FormControl('', Validators.required),
    criterions: new FormControl(''),
    note: new FormControl(''),
  });

  async onSubmitFormUserInfo(): Promise<void> {
    try {
      await this.uploadImage();
      this.formUserInfo.patchValue({
        userIdPhotoURL: this.imageTarget.userIdPhotoURL,
      });
      await this.imageTarget.vehilceImage.forEach((v) => {
        this.vehicles.controls.forEach((c) => {
          if (c.get('id')!.value == v.id) {
            c.patchValue({
              image: v.imageURL,
              lpnImage: v.lpnImageURL,
            });
          }
        });
      });

      await this.userService
        .updateUser(this.formUserInfo.value as UpdateUserRequest)
        .toPromise();
    } catch (error) {}
  }

  private async uploadImage(): Promise<void> {
    try {
      if (this.imageTarget.userIdPhotoImage) {
        // upload userIdPhotoURL
        this.imageTarget.userIdPhotoURL = await this.storageService.upload(
          this.imageTarget.userIdPhotoImage.files!.item(0)!,
          this.user!.uid,
          'user'
        );
      }
      if (this.imageTarget.vehilceImage.length > 0) {
        this.imageTarget.vehilceImage = await Promise.all(
          this.imageTarget.vehilceImage.map(async (v) => {
            v.imageURL = await this.storageService.upload(
              v.image!.files!.item(0)!,
              this.user!.uid,
              'vehicle',
              v.id
            );

            v.lpnImageURL = await this.storageService.upload(
              v.lpnImage!.files!.item(0)!,
              this.user!.uid,
              'lpn',
              v.id
            );
            return v;
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  private onSubmitFormSaveRide(): void {
    this.formSaveRide.patchValue({
      userId: this.user!.id,
      route: this.saveRoute,
      criterions: (this.formSaveRide.value['criterions'] = (
        this.formSaveRide.value['criterions'] as string
      )
        .split(',')
        .map((c) => c.trim())),
    });

    if (this.formSaveRide.valid) {
      const request = this.formSaveRide.value as SaveRideRequest;

      this.rideService.saveRide(request).subscribe({
        next: (res) => {
          if (res.code == RESPONSE_CODE['ONE_RIDE_ACTIVE']) {
            this.toggleErrorModal(res);
          }
        },
      });
      this.formSaveRide.patchValue({
        id: null,
        route: null,
        startTime: null,
        endTime: null,
        vehicleId: null,
        criterions: '',
        note: null,
      });
    } else {
      console.error(this.formSaveRide.errors);
    }
    this.toggleFormSaveRide();
  }

  setFormSaveRideValue(id: string): void {
    this.rideService.findRideById(id).subscribe({
      next: (res) => {
        this.formSaveRide.patchValue({
          id: res.id,
          userId: res.userId,
          route: res.route,
          startTime: this.dateTimeLocalPipe.transform(
            new Date(),
            'now',
            true,
            res.startTime as any
          ),
          vehicleId: res.vehicle.id,
          endTime: this.dateTimeLocalPipe.transform(
            new Date(),
            'now',
            true,
            res.endTime as any
          ),
          criterions: res.criterions.join(', '),
          note: res.note,
        });
      },
    });
  }

  userIsAdmin: boolean = false;
  private async loadMap(): Promise<void> {
    this.map = new Map(MAPBOX_OPTIONS);
    setTimeout(() => {
      this.map.resize();
    }, 0);

    this.loadAllDone = true;
    this.map.on(
      'moveend',
      (
        e: MapboxEvent<MouseEvent | TouchEvent | WheelEvent | undefined> &
          EventData
      ) => {
        this.findRidesByBound();
      }
    );
  }

  private loadDataTable(): void {
    // $(() => {
    this.dataTable = $('#table_id').DataTable({
      autoWidth: true,
      scrollCollapse: true,
      info: false,
      jQueryUI: true,
      pageLength: 5,
      paging: false,
      searching: true,
      language: {
        paginate: {
          first: 'Đầu',
          last: 'Cuối',
          next: 'Kế',
          previous: 'Trước',
        },
        zeroRecords: 'Không tìm được chuyến',
        search: 'Tìm kiếm',
      },
      columns: [
        {
          data: 'photoURL',
          className: 'text-center',
          render: (data, type, row, meta) => {
            return this.avatarPipe.transform(data, 40);
          },
          orderable: false,
        },
        {
          data: 'vehicle.type',
          className: 'text-center',
          render: (data, type, row, meta) => {
            return this.vehiclePipe.transform(data);
          },
        },
        {
          data: 'path.properties.startPointTitle',
          orderable: false,
        },
        {
          data: 'path.properties.endPointTitle',
          orderable: false,
        },
        {
          data: 'startTime',
          render: (data, type, row, meta) => {
            return this.dateInArrayPipe.transform(data);
          },
        },
        {
          data: 'endTime',
          render: (data, type, row, meta) => {
            return this.dateInArrayPipe.transform(data);
          },
        },
        {
          data: 'distance',
          render: (data, type, row, meta) => {
            return this.metricPipe.transform(data);
          },
        },
        { data: 'criterions', searchable: true, orderable: false },
      ],
      drawCallback: (settings: any) => {
        this.changeLinesColor();
      },
    });

    $(document).on('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key == 'x') {
        this.toggleDataTable();
      }
    });
    // });
  }

  error: Error = {
    code: '9999',
    message: 'Lỗi xảy ra',
  };
  errorModalVisible: boolean = false;
  toggleErrorModal(error?: ResponseBody): void {
    if (error) {
      this.error = error;
      this.errorModalVisible = true;
    } else {
      this.errorModalVisible = !this.errorModalVisible;
    }
  }

  private async findRidesByBound(): Promise<void> {
    let res: FindRidesResponse[] | undefined = await this.rideService
      .findRidesByBound(
        this.map.getBounds().getSouthWest().toArray(),
        this.map.getBounds().getNorthEast().toArray()
      )
      .toPromise();
    this.updateDataTable(res);
  }

  private updateDataTable(data: any): void {
    if (this.dataTable) {
      this.dataTable!.clear();
      this.dataTable.rows.add(data).draw();
    }
  }

  private async loadAllRides(): Promise<void> {
    const res = await this.rideService.findAllRides().toPromise();
    res!.forEach((ride) => {
      addRide(ride.id, this, ride.path, ride.photoURL);
    });
  }

  popup: Popup = new Popup({
    closeButton: true,
  });

  private initView(): void {
    this.loadTopLeft();
    this.loadBottomLeft();
    this.loadTopRight();
    this.loadBottomRight();
  }

  private loadTopLeft(): void {
    this.map.addControl(new MapboxGeocoder(GEOCODER_OPT_SEARCH), 'top-left');
    $(() => {
      $('div.mapboxgl-ctrl-top-left')
        .append($('div#search-user'))
        .append($('div#online-users'))
        .addClass('d-flex');

      $('div.mapboxgl-ctrl-top-left > *').css('height', '36px');
    });
  }
  private loadBottomLeft(): void {
    $(() => {
      $(
        '#map > div.mapboxgl-control-container > div.mapboxgl-ctrl-bottom-left > div > a'
      ).remove();

      this.map.addControl(
        new MapboxDirections({
          accessToken: environment.mapbox.accessToken,
          profile: 'mapbox/driving',
          unit: 'metric',
          controls: {
            instructions: false,
            profileSwitcher: false,
          },
          language: 'vi',
          placeholderOrigin: 'Bắt đầu',
          placeholderDestination: 'Kết thúc',
        })
          .on('route', (routes: Path) => {
            this.onRouteSet(routes);
          })
          .on('clear', () => {
            this.formSaveRide.patchValue({ route: null });
          }),
        'bottom-left'
      );
      $('div.mapboxgl-ctrl-directions.mapboxgl-ctrl').css('min-width', '240px');
      $('#mapbox-directions-origin-input > div')
        .css('width', 'auto')
        .css('max-width', '200px')
        .css('min-width', '200px');
      $('#mapbox-directions-destination-input > div')
        .css('width', 'auto')
        .css('max-width', '200px')
        .css('min-width', '200px');
      $('#form-ride-share')
        .prepend(
          $(
            '#map > div.mapboxgl-control-container > div.mapboxgl-ctrl-bottom-left > div.mapboxgl-ctrl-directions.mapboxgl-ctrl'
          )
        )
        .css('max-width', '240px');

      $('#form-ride-share > .mapboxgl-ctrl-directions.mapboxgl-ctrl').css(
        'margin-left',
        '0'
      );

      $(
        '#map > div.mapboxgl-control-container > div.mapboxgl-ctrl-bottom-left'
      ).append($('#bottom-left-container'));
    });
  }

  private loadTopRight(): void {
    $('#map > div.mapboxgl-control-container').append(
      $('div.mapboxgl-ctrl-top-center')
    );
  }

  private loadBottomRight(): void {
    this.map.addControl(new NavigationControl(), 'bottom-right');
    $(
      '#map > div.mapboxgl-control-container > div.mapboxgl-ctrl-bottom-right > div.mapboxgl-ctrl.mapboxgl-ctrl-attrib'
    ).remove();

    $('div.mapboxgl-ctrl-bottom-right')
      .prepend($('#btn-toggle-table'))
      .addClass('d-flex');
  }
  toggleFormSaveRide(display?: boolean): void {
    $(() => {
      if (display) {
        $('#form-ride-share').removeClass('d-none');
      } else {
        $('#form-ride-share').toggleClass('d-none');
      }
    });
  }

  navigateToAdminPage(): void {
    this.router.navigate(['/admin']);
  }

  toggleDataTable(): void {
    $('#map').toggleClass('vh-100').toggleClass('vh-60');
    $('#table-container').toggleClass('d-none').toggleClass('vh-40');
    this.map.resize();
  }

  private fileReader: FileReader = new FileReader();
  onSelectFile(event: Event, type: string, index?: number): void {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    if (target.files && target.files.item(0)) {
      this.fileReader.readAsDataURL(target.files.item(0)!);
      this.fileReader.onload = (e) => {
        const url: string = e.target?.result as string;
        switch (type) {
          case 'userIdPhotoImage': {
            this.imageTarget.userIdPhotoURL = url;
            this.imageTarget.userIdPhotoImage = target;
            break;
          }
          case 'image': {
            this.imageTarget.vehilceImage[index!].imageURL = url;
            this.imageTarget.vehilceImage[index!].image = target;
            break;
          }
          case 'lpnImage': {
            this.imageTarget.vehilceImage[index!].lpnImageURL = url;
            this.imageTarget.vehilceImage[index!].lpnImage = target;
            break;
          }
          default: {
            break;
          }
        }
      };
    }
  }

  findUsesByTextResult: FindUsersResponse[] = [];
  onSearchUser(event: Event): void {
    let text = (event.target as HTMLInputElement).value.trim();
    if (text) {
      this.userService.findUsersByText(text).subscribe({
        next: (res) => {
          this.findUsesByTextResult = res;
        },
      });
    }
  }

  chosenSearchUser: FindUsersResponse | undefined;
  searchUserModalVisible: boolean = false;
  toggleSearchUserModal(): void {
    this.searchUserModalVisible = !this.searchUserModalVisible;
  }

  myRide: FindRideDetailResponse[] = [];
  myRidesModalVisible: boolean = false;
  toggleMyRidesModal(): void {
    this.findRidesByUserId(this.user!.id);
    this.myRidesModalVisible = !this.myRidesModalVisible;
  }

  private findRidesByUserId(id: string): void {
    this.rideService.findRidesByUserId(id).subscribe({
      next: (res) => {
        this.myRide = res;
      },
    });
  }

  isActiveRide(status: string) {
    return status == 'ACTIVE';
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

  confirm: Confirm = {
    title: '',
    dismiss: '',
    accept: '',
    action: '',
  };
  confirmModalVisible: boolean = false;
  toggleConfirmModal(action?: string): void {
    switch (action) {
      case 'newUser': {
        this.confirm = {
          title:
            'Bạn là người dùng mới, hãy cập nhật thông tin để tiếp tục sử dụng.',
          dismiss: 'Đăng xuất',
          accept: 'Cập nhật',
          action: action,
        };
        break;
      }
      case 'signOutNotInUserInfo': {
        this.confirm = {
          title: 'Đăng xuất khỏi hệ thống',
          dismiss: 'Hủy',
          accept: 'Đăng xuất',
          action: 'signOut',
        };
        this.toggleConfirmModal('close');
        break;
      }
      case 'signOut': {
        this.confirm = {
          title: 'Đăng xuất khỏi hệ thống',
          dismiss: 'Hủy',
          accept: 'Đăng xuất',
          action: action,
        };
        this.toggleUserInfoModal();
        break;
      }
      case 'saveRide': {
        this.confirm = {
          title: 'Lưu thông tin hành trình',
          dismiss: 'Hủy',
          accept: 'Lưu',
          action: action,
        };
        break;
      }
      // case 'updateRide': {
      //   this.confirm = {
      //     title: 'Cập nhật thông tin chuyến đi',
      //     dismiss: 'Hủy',
      //     accept: 'Cập nhật',
      //     action: action,
      //   };
      // }
      case 'updateRideStatus': {
        this.confirm = {
          title: 'Cập nhật trạng thái chuyến đi',
          dismiss: 'Hủy',
          accept: 'Cập nhật',
          action: action,
        };

        break;
      }
      case 'updateUser': {
        this.confirm = {
          title: 'Cập nhật thông tin tài khoản',
          dismiss: 'Hủy',
          accept: 'Cập nhật',
          action: action,
        };
        this.toggleUserInfoModal();
        break;
      }
      case 'contactUser': {
        break;
      }
      default: {
        break;
      }
    }
    this.confirmModalVisible = !this.confirmModalVisible;
  }

  rideDetailInfo!: FindRideDetailResponse;
  rideInfoModalVisible: boolean = false;
  toggleRideInfoModal(id?: string): void {
    if (id) {
      this.rideService.findRideDetailById(id).subscribe({
        next: (res) => {
          this.rideDetailInfo = res;
        },
      });
    }
    this.rideInfoModal.visible = !this.rideInfoModal.visible;
  }

  // helper
  private oldLineIds: string[] = [];
  private changeLinesColor(): void {
    const var1 = ($('#table_id').dataTable().api() as any)
      .rows({ page: 'current' })
      .data();

    const var2 = var1.length;
    let var3: string[] = [];
    for (let i = 0; i < var2; i++) {
      let id = (var1[i] as FindRidesResponse).id;
      var3.push(id);
      this.map.setPaintProperty(`${id}-path`, 'line-color', COLOR['pink']);
      this.map.setPaintProperty(
        `${id}-path-casing`,
        'line-color',
        COLOR['pink-dark']
      );
      this.oldLineIds = this.oldLineIds.filter((i) => i != id);
    }

    this.oldLineIds.forEach((i) => {
      this.map.setPaintProperty(`${i}-path`, 'line-color', COLOR['blue']);
      this.map.setPaintProperty(
        `${i}-path-casing`,
        'line-color',
        COLOR['blue-dark']
      );
    });
    this.oldLineIds = var3;
  }

  //listener
  private onRouteSet(path: Path): void {
    this.saveRoute = path.route.at(0);
    this.formSaveRide.patchValue({ route: this.saveRoute });
  }

  filterVehicle: string = 'all';
  onSelectFilterVehicle(event: string): void {
    console.log(event);
  }

  onAcceptConfirm(): void {
    switch (this.confirm.action) {
      case 'newUser': {
        this.toggleUserInfoModal();
        break;
      }
      case 'signOut': {
        this.signOutApp();
        break;
      }
      case 'updateUser': {
        this.onSubmitFormUserInfo();
        break;
      }
      case 'saveRide': {
        this.onSubmitFormSaveRide();
        break;
      }
      // case 'updateRide': {
      //   this.
      // }
      case 'updateRideStatus': {
        break;
      }
      case 'contactUser': {
        break;
      }
      default: {
        break;
      }
    }
    this.toggleConfirmModal();
  }
}
