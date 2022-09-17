import { Pipe, PipeTransform } from '@angular/core';
import {
  ACTIVE,
  DISABLE,
  ENTITY_STATUS,
  EXPIRED,
  INACTIVE,
  PENDING,
  PREPARE,
  UNKNOWN,
} from '../interface/entity-status';
@Pipe({
  name: 'status',
})
export class StatusPipe implements PipeTransform {
  transform(value: string): string {
    let _status: string;
    switch (value) {
      case INACTIVE: {
        _status = 'Ngừng hoạt động';
        break;
      }
      case ACTIVE: {
        _status = 'Hoạt động';
        break;
      }
      case UNKNOWN: {
        _status = 'Chưa cập nhật thông tin';
        break;
      }
      case EXPIRED: {
        _status = 'Đã kết thúc';
        break;
      }
      case PENDING: {
        _status = 'Chưa được duyệt';
        break;
      }
      case DISABLE: {
        _status = 'Đã vô hiệu hóa';
        break;
      }
      case PREPARE: {
        _status = 'Đang chuẩn bị';
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
