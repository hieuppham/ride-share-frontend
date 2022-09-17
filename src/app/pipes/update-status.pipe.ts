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
  name: 'updateStatus',
})
export class UpdateStatusPipe implements PipeTransform {
  transform(value: string, type?: string): string {
    let result: string;
    if (type == 'statusValue') {
      switch (value) {
        case 'INACTIVE': {
          result = 'ACTIVE';
          break;
        }
        case 'ACTIVE': {
          result = 'INACTIVE';
          break;
        }
        case 'UNKNOWN': {
          result = 'UNKNOWN';
          break;
        }
        case 'EXPIRED': {
          result = 'INACTIVE';
          break;
        }
        case PENDING: {
          result = 'ACTIVE';
          break;
        }
        default: {
          result = 'INACTIVE';
          break;
        }
      }
    } else {
      switch (value) {
        case INACTIVE: {
          result = 'Kích hoạt';
          break;
        }
        case PREPARE: {
          result = 'Đang chuẩn bị';
          break;
        }
        case ACTIVE: {
          result = 'Ngừng hoạt động';
          break;
        }
        case UNKNOWN: {
          result = 'Chưa cập nhật thông tin';
          break;
        }
        case PENDING: {
          result = 'Chờ phê duyệt';
          break;
        }
        case EXPIRED: {
          result = 'Đã kêt thúc';
          break;
        }
        case DISABLE: {
          result = 'Đã vô hiệu hóa';
          break;
        }
        default: {
          result = 'Kích hoạt';
          break;
        }
      }
    }
    return result;
  }
}
