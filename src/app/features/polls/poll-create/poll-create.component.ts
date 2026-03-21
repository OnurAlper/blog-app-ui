import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { PollService } from 'src/app/core/services/poll.service';
import { NotificationService } from 'src/app/shared/notification.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-poll-create',
  standalone: false,
  templateUrl: './poll-create.component.html',
  styleUrls: ['./poll-create.component.scss']
})
export class PollCreateComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private pollService: PollService,
    private notify: NotificationService,
    public i18n: TranslateService,
    private router: Router
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]],
      description: ['', Validators.maxLength(800)],
      endsAt: [null],
      allowMultipleChoice: [false],
      options: this.fb.array([
        this.fb.control('', [Validators.required, Validators.minLength(1)]),
        this.fb.control('', [Validators.required, Validators.minLength(1)])
      ])
    });
  }

  get optionsArray(): FormArray {
    return this.form.get('options') as FormArray;
  }

  addOption(): void {
    if (this.optionsArray.length < 10) {
      this.optionsArray.push(this.fb.control('', [Validators.required, Validators.minLength(1)]));
    }
  }

  removeOption(index: number): void {
    if (this.optionsArray.length > 2) {
      this.optionsArray.removeAt(index);
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const val = this.form.value;
    this.pollService.create({
      title: val.title,
      description: val.description || undefined,
      endsAt: val.endsAt ? new Date(val.endsAt).toISOString() : undefined,
      allowMultipleChoice: val.allowMultipleChoice,
      options: val.options.filter((o: string) => o.trim().length > 0)
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.notify.success(res?.data?.Message || this.i18n.instant('POLL.CREATE_SUCCESS'));
          this.router.navigate(['/polls']);
        },
        error: (err) => this.notify.error(err?.error?.Message || this.i18n.instant('COMMON.ERROR'))
      });
  }

  cancel(): void {
    this.router.navigate(['/polls']);
  }
}
