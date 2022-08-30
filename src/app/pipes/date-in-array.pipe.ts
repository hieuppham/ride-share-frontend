import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateInArray',
})
export class DateInArrayPipe implements PipeTransform {
  transform(value: any): string {
    const date: number[] = value as number[];
    return `${this.twoDigit(date[3])}:${this.twoDigit(date[4])} ${this.twoDigit(
      date[2]
    )}/${this.twoDigit(date[1])}/${date[0]}`;
  }

  twoDigit(num: number): string {
    return num < 10 ? '0' + num : num + '';
  }
}
