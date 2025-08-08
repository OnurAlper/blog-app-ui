import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BlogEditComponent } from 'src/app/features/admin/blog/blog-edit/blog-edit.component';

@Injectable({ providedIn: 'root' })
export class PendingChangesGuard implements CanDeactivate<BlogEditComponent> {
  constructor(private i18n: TranslateService) {}

  canDeactivate(component: BlogEditComponent): boolean {
    if (component.saving) return true;

    if (component.hasUnsavedChanges) {
      const msg = this.i18n.instant('COMMON.UNSAVED_CHANGES');
      return window.confirm(msg);
    }
    return true;
  }
}
