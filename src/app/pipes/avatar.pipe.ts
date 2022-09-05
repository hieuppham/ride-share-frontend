import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'avatar',
})
export class AvatarPipe implements PipeTransform {
  transform(src: string, size: number): string {
    return `<img class="rounded-circle" src="${src}" width="${size}" height="${size}">`;
  }
}
