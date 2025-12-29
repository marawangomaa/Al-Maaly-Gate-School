// directives/image-fallback.directive.ts
import { Directive, ElementRef, Input, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: 'img[imageFallback]',
  standalone: true
})
export class ImageFallbackDirective {
  @Input() fallbackImage: string = '/assets/images/default-avatar.png';
  private hasError = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('error')
  onError() {
    if (!this.hasError) {
      this.hasError = true;
      console.log('Image failed to load, using fallback');
      
      // Set fallback image
      this.renderer.setAttribute(this.el.nativeElement, 'src', this.fallbackImage);
      
      // Remove the error handler to prevent infinite loops
      this.renderer.removeAttribute(this.el.nativeElement, 'onerror');
    }
  }

  @HostListener('load')
  onLoad() {
    console.log('Image loaded successfully');
    this.hasError = false;
  }
}