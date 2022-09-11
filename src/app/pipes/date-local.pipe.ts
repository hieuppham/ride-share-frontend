import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateTimeLocal',
})
export class DateLocalPipe implements PipeTransform {
  transform(
    value: Date,
    type: string,
    number?: boolean,
    numberValue?: any
  ): string {
    let result: string;
    numberValue = numberValue as number[];
    if (number) {
      result = `${numberValue[0]}-${this.twoDigit(
        numberValue[1]
      )}-${this.twoDigit(numberValue[2])}T${this.twoDigit(
        numberValue[3]
      )}:${this.twoDigit(numberValue[4])}`;
    } else {
      switch (type) {
        case 'now': {
          result = `${value.getFullYear()}-${this.getMonthString(
            value
          )}-${this.getDateString(value)}T${this.getHour(
            value
          )}:${this.getMinute(value)}`;
          break;
        }
        case 'after10mins': {
          result = `${value.getFullYear()}-${this.getMonthString(
            value
          )}-${this.getDateString(value)}T${this.getHour(
            value
          )}:${this.getMinute(value, 10)}`;
          break;
        }
        case 'after5mins': {
          result = `${value.getFullYear()}-${this.getMonthString(
            value
          )}-${this.getDateString(value)}T${this.getHour(
            value
          )}:${this.getMinute(value, 5)}`;
          break;
        }
        case 'after1day': {
          result = `${value.getFullYear()}-${this.getMonthString(
            value
          )}-${this.getDateString(value, 1)}T${this.getHour(
            value
          )}:${this.getMinute(value)}`;
          break;
        }
        default: {
          result = `${value.getFullYear()}-${this.getMonthString(
            value
          )}-${this.getDateString(value)}T${this.getHour(
            value
          )}:${this.getMinute(value)}`;
          break;
        }
      }
    }
    return result;
  }

  twoDigit(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  getDateString(date: Date, after?: number): string {
    let var1: number = date.getDate();
    if (after) {
      var1 += after;
    }
    return var1 > 9 ? `${var1}` : `0${var1}`;
  }

  getMonthString(date: Date, after?: number): string {
    let var1: number = date.getMonth() + 1;
    if (after) {
      var1 += after;
    }
    return var1 > 9 ? `${var1}` : `0${var1}`;
  }

  getHour(date: Date, after?: number): string {
    let var1: number = date.getHours();
    if (after) {
      var1 += after;
    }
    return var1 > 9 ? `${var1}` : `0${var1}`;
  }

  getMinute(date: Date, after?: number): string {
    let var1: number = date.getMinutes();
    if (after) {
      var1 += after;
    }
    return var1 > 9 ? `${var1}` : `0${var1}`;
  }
}
