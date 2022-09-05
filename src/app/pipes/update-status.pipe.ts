import { Pipe, PipeTransform } from '@angular/core';
import { ENTITY_STATUS } from '../interface/entity-status';

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
        case ENTITY_STATUS['PENDING']: {
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
        case 'INACTIVE': {
          result = 'Kích hoạt';
          break;
        }
        case 'ACTIVE': {
          result = 'Ngừng kích hoạt';
          break;
        }
        case 'UNKNOWN': {
          result = 'Không phê duyệt';
          break;
        }
        case ENTITY_STATUS['PENDING']: {
          result = 'Phê duyệt';
          break;
        }
        case 'EXPIRED': {
          result = 'Kích hoạt';
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
