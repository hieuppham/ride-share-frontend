import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gender',
})
export class GenderPipe implements PipeTransform {
  transform(value: string): string {
    return value == 'male' ? 'Nam' : 'Nữ';
  }
}
