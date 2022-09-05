import { Pipe, PipeTransform } from '@angular/core';
import { ENTITY_STATUS } from '../interface/entity-status';
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
        _status = 'Chưa cập nhật thông tin';
        break;
      }
      case 'EXPIRED': {
        _status = 'Đã kết thúc';
        break;
      }
      case ENTITY_STATUS['PENDING']: {
        _status = 'Chưa được duyệt';
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
