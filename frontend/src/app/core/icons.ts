import { inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

export function registerIcons(): void {
  inject(MatIconRegistry).addSvgIconSet(
    inject(DomSanitizer).bypassSecurityTrustResourceUrl('icons.svg'),
  );
}
