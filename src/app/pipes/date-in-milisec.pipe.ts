import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateInMilisec',
})
export class DateInMilisecPipe implements PipeTransform {
  transform(value: any, format?: string): string {
    const var1: Date = new Date(value);
    let result: string;
    if (format == 'YYYY-MM-DD') {
      result = `${this.twoDigit(var1.getFullYear())}-${this.twoDigit(
        var1.getMonth() + 1
      )}-${this.twoDigit(var1.getDate())}`;
    } else {
      result = `${this.twoDigit(var1.getDate())}/${this.twoDigit(
        var1.getMonth() + 1
      )}/
      ${this.twoDigit(var1.getFullYear())}`;
    }
    return result;
  }

  twoDigit(num: number): string {
    return num < 10 ? '0' + num : num + '';
  }
}
