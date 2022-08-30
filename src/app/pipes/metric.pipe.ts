import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'metric',
})
export class MetricPipe implements PipeTransform {
  transform(value: number): string {
    return (value / 1000).toFixed(2) + 'km';
  }
}
