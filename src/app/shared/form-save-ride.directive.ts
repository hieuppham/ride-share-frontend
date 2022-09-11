import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

function getTimeNow(): number {
  return Date.now();
}

export function timeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valid: boolean =
      compareDate(
        new Date(control.value).getTime(),
        addMinutes(getTimeNow(), 10)
      ) > 0;
    return valid
      ? null
      : {
          message: 'Thời điểm kết thúc phải diễn ra sau thời điểm xuất phát',
        };
  };
}

// export function customTimeFormValidator(): ValidatorFn {
//     return (form: AbstractControl): ValidationErrors | null => {
//         form = form as FormGroup;
//         const valid: boolean =
//           compareDate(
//             new Date(form.controls['endTime'].value).getTime(),
//             new Date(form.controls['startTime'].value).getTime()
//           ) > 0;
//         return valid
//           ? null
//           : {
//               message: 'Thời điểm kết thúc phải diễn ra sau thời điểm xuất phát',
//             };
//       };
// }

function compareDate(var1: number, var2: number): number {
  return (var1 - var2) / (1000 * 60);
}

function addMinutes(date: number, minutes: number): number {
  return date + minutes * 1000 * 60;
}
