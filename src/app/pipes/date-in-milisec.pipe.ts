import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateInMilisec',
})
export class DateInMilisecPipe implements PipeTransform {
  transform(value: any): string {
    const var1: Date = new Date(value);
    return `${this.twoDigit(var1.getDate())}/${this.twoDigit(
      var1.getMonth() + 1
    )}/
    ${this.twoDigit(var1.getFullYear())}`;
  }

  twoDigit(num: number): string {
    return num < 10 ? '0' + num : num + '';
  }
}
