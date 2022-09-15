import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'img[changeSrcOnError]',
})
export class HideMissingDirective {
  constructor(private el: ElementRef) {}

  @HostListener('error')
  private onError() {
    this.el.nativeElement.style.src = '../../assets/img/avatars/img.jpeg';
  }
}
