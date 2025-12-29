import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortenId',
  standalone: true
})
export class ShortenIdPipe implements PipeTransform {
  transform(value: string, maxLength: number = 8): string {
    if (!value) return '';
    return value.length > maxLength ? `${value.substring(0, maxLength)}...` : value;
  }
}