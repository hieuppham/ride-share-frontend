import { Component, OnInit } from '@angular/core';

interface User {
  photoURL: string;
  fullName: string;
  time: string;
}

interface Ride {
  startTitle: string;
  endTitle: string;
}

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['../admin.component.scss'],
})
export class ActivityComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  PHOTO_URL: string = '../../../assets/img/avatars/7.jpg';

  onlineUsers: User[] = [
    {
      photoURL: this.PHOTO_URL,
      fullName: 'Phạm Trung Hiếu',
      time: '34 phút',
    },
    {
      photoURL: this.PHOTO_URL,
      fullName: 'Nguyễn Thị Hòa',
      time: '56 phút',
    },
    {
      photoURL: this.PHOTO_URL,
      fullName: 'Trần Văn Trung',
      time: '1 giờ 45 phút',
    },
    {
      photoURL: this.PHOTO_URL,
      fullName: 'Đào Thị Bình',
      time: '30 phút',
    },
  ];

  newUsers: User[] = [
    {
      photoURL: this.PHOTO_URL,
      fullName: 'Phạm Trung Hiếu',
      time: '08/09/2022',
    },
    {
      photoURL: this.PHOTO_URL,
      fullName: 'Nguyễn Thị Hòa',
      time: '01/09/2022',
    },
    {
      photoURL: this.PHOTO_URL,
      fullName: 'Trần Văn Trung',
      time: '01/09/2022',
    },
    {
      photoURL: this.PHOTO_URL,
      fullName: 'Đào Thị Bình',
      time: '01/09/2022',
    },
  ];

  newRides: Ride[] = [
    { startTitle: 'Lê Trọng Tấn', endTitle: 'Nguyễn Trãi' },
    { startTitle: 'Tôn Thất Thuyết', endTitle: 'Chùa Bộc' },
    { startTitle: 'Khâm Thiên', endTitle: 'Bùi Xương Trạch' },
    { startTitle: 'Yên Lãng', endTitle: 'Lĩnh Nam' },
    { startTitle: 'Tam Trinh', endTitle: 'Dương Đình Nghệ' },
  ];
}
