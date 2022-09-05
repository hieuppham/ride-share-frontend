import { Pipe, PipeTransform } from '@angular/core';

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
          result = 'ACTIVE';
          break;
        }
        case 'EXPIRED': {
          result = 'INACTIVE';
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
