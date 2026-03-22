import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { PollService } from 'src/app/core/services/poll.service';
import { NotificationService } from 'src/app/shared/notification.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-poll-edit',
  standalone: false,
  templateUrl: './poll-edit.component.html',
  styleUrls: ['./poll-edit.component.scss']
})
export class PollEditComponent implements OnInit {
  form: FormGroup;
  loading = false;
  saving = false;
  pollId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private pollService: PollService,
    private notify: NotificationService,
    public i18n: TranslateService
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]],
      description: ['', Validators.maxLength(800)],
      endsAt: [null],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.pollId = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    this.pollService.getById(this.pollId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          const poll = res?.data as any;
          this.form.patchValue({
            title: poll.title,
            description: poll.description || '',
            endsAt: poll.endsAt ? poll.endsAt.substring(0, 10) : null,
            isActive: poll.isActive
          });
        },
        error: (err) => {
          this.notify.error(err?.error?.Message || this.i18n.instant('COMMON.ERROR'));
          this.router.navigate(['/polls']);
        }
      });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const val = this.form.value;
    this.pollService.update({
      id: this.pollId,
      title: val.title,
      description: val.description || undefined,
      endsAt: val.endsAt ? new Date(val.endsAt).toISOString() : undefined,
      isActive: val.isActive
    })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.notify.success(this.i18n.instant('COMMON.UPDATE_SUCCESS'));
          this.router.navigate(['/polls']);
        },
        error: (err) => this.notify.error(err?.error?.Message || this.i18n.instant('COMMON.ERROR'))
      });
  }

  cancel(): void {
    this.router.navigate(['/polls']);
  }
}
