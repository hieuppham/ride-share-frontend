import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'vehicle',
})
export class VehiclePipe implements PipeTransform {
  transform(value: string): string {
    return value == 'car' ? 'Ô tô' : 'Xe máy';
  }
}
