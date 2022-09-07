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
} from 'src/app/interface/user';
import { UserService } from 'src/app/services/user.service';
import {
  FindRidesResponse,
  SaveRideRequest,
  FindRideDetailResponse,
} from 'src/app/interface/ride';

import {
  dateArrayToDateTimeLocal,
  extractStartPoint,
  extractEndPoint,
  getPathLayer,
  getStartPointLayer,
  getStartSymbolLayer,
  getEndPointLayer,
  getEndSymbolLayer,
  addPopupToLayer,
  getPathCasingLayer,
  addDataSources,
  addRideLayer,
  addRide,
  removeRide,
} from './util/geojson.function';
import { Confirm } from 'src/app/interface/util';

import {
  GEOCODER_OPT_SEARCH,
  MAPBOX_OPTIONS,
  COLOR,
} from './util/geojson.constant';
import { initView } from './util/view.config';
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
import { ENTITY_STATUS } from 'src/app/interface/entity-status';
import { DateInMilisecPipe } from 'src/app/pipes/date-in-milisec.pipe';
import { socketClient } from 'src/app/services/socket-client/socket.client';
import {
  ConnectInfo,
  SocketMessage,
} from 'src/app/interface/socket.interfaces';
@Component({
  selector: 'app-mapbox',
  templateUrl: './mapbox.component.html',
  styleUrls: ['./mapbox.component.scss'],
})
export class MapboxComponent
  implements AfterViewInit, OnDestroy, AfterContentInit
{
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
    private metricPipe: MetricPipe
  ) {}

  ngAfterViewInit(): void {
    this.loadMap();

    initView(this);
    this.loadTopLeft();
    this.loadBottomLeft();
    this.findRidesByBound();
    this.loadUser();
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
    this.loadDataTable();
  }

  ngAfterContentInit(): void {
    this.loadAllDone = true;
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
    userIdPhotoURL: new FormControl('', [Validators.required]),
    vehicles: new FormArray([]),
    email: new FormControl('', [Validators.required]),
  });
  user: UserDto | undefined;
  userIdPhotoURL: string | undefined;
  vehiclePhoto: TempVehicleImage[] = [];

  public get vehicles(): FormArray {
    return this.formUserInfo.get('vehicles') as FormArray;
  }
  addVehicle(): void {
    this.vehicles.push(
      new FormGroup({
        id: new FormControl(this.vehiclePhoto.length, Validators.required),
        type: new FormControl('', [Validators.required]),
        name: new FormControl('', Validators.required),
        lpn: new FormControl('', Validators.required),
        image: new FormControl('', Validators.required),
        lpnImage: new FormControl('', Validators.required),
      })
    );
    this.vehiclePhoto.push({
      id: this.vehiclePhoto.length,
      image: '',
      lpnImage: '',
    });
    this._tmpTarget.vehicleImages.push({ vehicleImage: null, lpnImage: null });
  }
  removeVehicle(index: number): void {
    this.vehicles.removeAt(index);
    this.vehiclePhoto.splice(index, 1);
    this._tmpTarget.vehicleImages.splice(index, 1);
  }
  // end user
  private loadUser(): void {
    this.userService.findUserById(localStorage.getItem('id')!).subscribe({
      next: (res: UserDto) => {
        this.user = res;
        this.userIsAdmin = res.email == environment.adminEmail;
        switch (res.status) {
          case ENTITY_STATUS['UNKNOWN']: {
            this.formUserInfo.patchValue({ id: res.id, email: res.email });
            this.toggleConfirmModal('newUser');
            break;
          }
          case ENTITY_STATUS['PENDING']: {
            console.log(res.status);
            break;
          }
          case ENTITY_STATUS['INACTIVE']: {
            console.log(res.status);
            break;
          }
          case ENTITY_STATUS['ACTIVE']: {
            break;
          }
          default: {
            console.log(res.status);
            break;
          }
        }

        this.formUserInfo.patchValue({
          id: res.id,
          fullName: res.fullName,
          phone: res.phone,
          gender: res.gender,
          dob: this.dateInMilisec.transform(res.dob, 'YYYY-MM-DD'),
          email: res.email,
          userIdPhotoURL: res.userIdPhotoURL,
        });
        // res.vehicles.forEach((vehicle) => {
        //   this.vehicles.push({
        //     id: vehicle.id,
        //     type: vehicle.type,
        //     name: vehicle.name,
        //     lpn: vehicle.lpn,
        //     lpnImage: vehicle.lpnImage,
        //     image: vehicle.image,
        //   });
        //   this.vehiclePhoto.push({
        //     id: vehicle.id,
        //     lpnImage: vehicle.lpn,
        //     image: vehicle.image,
        //   });
        // });
        this.userIdPhotoURL = res.userIdPhotoURL;
        this.formSaveRide.patchValue({ uid: res.uid });
      },
    });
  }

  // private setFormUserInfoValue(user: UserDto, formUserInfo: FormGroup): void {
  //   formUserInfo.patchValue({
  //     id: user.id,
  //     fullName: user.fullName,
  //     phone: user.phone,
  //     email: user.email,
  //     userIdPhotoURL: user.userIdPhotoURL,
  //     dob: user.dob,
  //     gender: user.gender,
  //   });

  //   user.vehicles.forEach((v) => {
  //     this.vehicles.push({});
  //   });
  // }

  private dataTable: any = null;

  private loadUserLocation(): void {
    window.navigator.geolocation.getCurrentPosition(
      (p: GeolocationPosition) => {
        const location: LngLatLike = {
          lng: p.coords.longitude,
          lat: p.coords.latitude,
        };
        new Marker({ color: '#dd0a21' }).setLngLat(location).addTo(this.map);
        this.map.flyTo({ center: location, zoom: 14 });
      },
      console.error
    );
  }

  public rideResponseDtoFeatureCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features: [],
  };

  saveRoute: Route | undefined;

  map!: Map;
  photoURL: string = './assets/img/avatars/8.jpg';

  ctrlTopCenter!: HTMLDivElement;
  ctrlTopLeft!: HTMLDivElement;
  ctrlBottomRight!: HTMLDivElement;
  ctrlBottomLeft!: HTMLDivElement;
  ctrlMidRight!: HTMLDivElement;

  buttonAdminPage!: HTMLButtonElement;
  divSearch!: HTMLDivElement;
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

  buttonShowMyRides!: HTMLButtonElement;
  // end form share

  formSaveRide: FormGroup = new FormGroup({
    id: new FormControl(null),
    userId: new FormControl('', Validators.required),
    route: new FormControl('', Validators.required),
    startTime: new FormControl('', Validators.required),
    endTime: new FormControl('', Validators.required),
    vehicleId: new FormControl('', Validators.required),
    criterions: new FormControl(''),
    note: new FormControl(''),
  });

  async onSubmitFormUserInfo(): Promise<void> {
    try {
      if (this._tmpTarget.userIdImage) {
        const _userIdPhotoURL: string = await this.storageService.upload(
          this._tmpTarget.userIdImage!.files!.item(0)!,
          this.user!.uid,
          'user'
        );
        this.formUserInfo.patchValue({
          userIdPhotoURL: _userIdPhotoURL,
        });
      }
      const _vLength: number = this.user!.vehicles.length;
      for (let [i, v] of this._tmpTarget.vehicleImages.entries()) {
        const vehicleImageURL: string = await this.storageService.upload(
          v.vehicleImage?.files?.item(0)!,
          this.user!.uid,
          'vehicle',
          _vLength + i
        );
        const lpnImageUrl: string = await this.storageService.upload(
          v.lpnImage?.files?.item(0)!,
          this.user!.uid,
          'lpn',
          _vLength + i
        );
        (
          (this.formUserInfo.controls['vehicles'] as FormArray).controls[
            _vLength + i
          ] as FormGroup
        ).patchValue({
          image: vehicleImageURL,
          lpnImage: lpnImageUrl,
        });
      }

      this.userService
        .updateUser(this.formUserInfo.value as UpdateUserRequest)
        .subscribe({
          next: (res) => {
            this.user = res;
          },
          error: (err) => console.error(err),
        });
    } catch (error: any) {
      console.error(error);
      let err: Error = {
        code: '9999',
        message: 'Đã có lỗi xảy ra :(',
      };
      console.log(err);

      // this.showErrorModal(err);
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

    const request = this.formSaveRide.value as SaveRideRequest;

    this.rideService.saveRide(request).subscribe({
      next: (res) => {
        // this.loadAllRides();
      },
    });
    this.formSaveRide.reset();
    this.toggleFormSaveRide();
  }

  setFormSaveRideValue(id: string): void {
    this.rideService.findRideById(id).subscribe({
      next: (res) => {
        this.formSaveRide.patchValue({
          id: res.id,
          userId: res.userId,
          startTime: this.dateToDateTimeLocal(res.startTime),
          endTime: this.dateToDateTimeLocal(res.endTime),
          criterions: res.criterions.join(', '),
          note: res.note,
        });
      },
    });
  }

  userIsAdmin: boolean = false;
  private loadMap(): void {
    this.map = new Map(MAPBOX_OPTIONS);
    this.map.on('load', (e: MapStyleDataEvent & EventData) => {
      this.loadAllRides();
      this.loadUserLocation();
    });

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
    $(() => {
      this.dataTable = $('#table_id').DataTable({
        autoWidth: true,
        scrollCollapse: true,
        info: false,
        jQueryUI: true,
        // scrollY: '',
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

      $('canvas.mapboxgl-canvas').addClass('w-100 h-100');

      $(document).on('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key == 'x') {
          this.toggleDataTable();
        }
      });
    });
  }

  error: Error = {
    code: '9999',
    message: 'Lỗi xảy ra',
  };
  errorModalVisible: boolean = false;
  toggleErrorModal(error?: Error): void {
    if (error) {
      this.error = error;
      this.errorModalVisible = true;
    } else {
      this.errorModalVisible = !this.errorModalVisible;
    }
  }

  private findRidesByBound(): void {
    this.rideService
      .findRidesByBound(
        this.map.getBounds().getSouthWest().toArray(),
        this.map.getBounds().getNorthEast().toArray()
      )
      .subscribe({
        next: (res) => {
          this.updateDataTable(res);
        },
      });
  }

  private updateDataTable(data: any): void {
    this.dataTable?.clear();
    this.dataTable.rows.add(data).draw();
  }

  private loadAllRides(): void {
    this.rideService.findAllRides().subscribe({
      next: (res) => {
        res.forEach((ride) => {
          addRide(ride.id, this, ride.path, ride.photoURL);
        });
      },
    });
  }

  popup: Popup = new Popup({
    closeButton: true,
  });

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
        }).on('route', (routes: Path) => {
          this.onRouteSet(routes);
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

  toggleFormSaveRide(display?: boolean): void {
    $(() => {
      $('#form-ride-share').toggleClass('d-none');
    });
  }

  navigateToAdminPage(): void {
    this.router.navigate(['/admin']);
  }

  toggleDataTable(): void {
    $('#map').toggleClass('h-100');
    $('canvas.mapboxgl-canvas').toggleClass('h-100');
    $('#table-container').toggleClass('d-none');
  }

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
            this.userIdPhotoURL = _url;
            this._tmpTarget.userIdImage = target;
            break;
          }
          case 'vehicleImage': {
            this.vehiclePhoto[index!].image = _url;
            this._tmpTarget.vehicleImages[index!].vehicleImage = target;
            break;
          }
          case 'lpnImage': {
            this.vehiclePhoto[index!].lpnImage = _url;
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

  dateToDateTimeLocal(date: any): string {
    if (date) {
      let _dateAny: any = date as any;
      let _dateNums: number[] = _dateAny as number[];
      return dateArrayToDateTimeLocal(_dateNums);
    }
    return '';
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
