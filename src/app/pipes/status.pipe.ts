import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'status',
})
export class StatusPipe implements PipeTransform {
  transform(value: string): string {
    let _status: string;
    switch (value) {
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
}
