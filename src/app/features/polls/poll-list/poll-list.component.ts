import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { PollService } from 'src/app/core/services/poll.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { NotificationService } from 'src/app/shared/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { Poll, PollVoter } from 'src/app/core/models/poll.model';

@Component({
  selector: 'app-poll-list',
  standalone: false,
  templateUrl: './poll-list.component.html',
  styleUrls: ['./poll-list.component.scss']
})
export class PollListComponent implements OnInit {
  polls: Poll[] = [];
  filter: 'all' | 'active' | 'passive' = 'all';
  loading = false;
  votingPollId: number | null = null;
  selectedOptions: { [pollId: number]: number[] } = {};

  get filteredPolls(): Poll[] {
    if (this.filter === 'active') return this.polls.filter(p => this.isActive(p));
    if (this.filter === 'passive') return this.polls.filter(p => !this.isActive(p));
    return this.polls;
  }

  // Voters panel (admin)
  votersLoading: { [pollId: number]: boolean } = {};
  voters: { [pollId: number]: PollVoter[] } = {};
  votersOpen: { [pollId: number]: boolean } = {};

  constructor(
    private pollService: PollService,
    public auth: AuthService,
    private notify: NotificationService,
    public i18n: TranslateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.pollService.getAll()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.polls = (res?.data as any) || [];
          this.polls.forEach(p => {
            this.selectedOptions[p.id] = p.hasVoted ? [...p.userVotedOptionIds] : [];
          });
        },
        error: (err) => this.notify.error(err?.error?.Message || this.i18n.instant('COMMON.ERROR'))
      });
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  isActive(poll: Poll): boolean {
    if (!poll.isActive) return false;
    if (poll.endsAt && new Date(poll.endsAt) < new Date()) return false;
    return true;
  }

  isExpired(poll: Poll): boolean {
    return !!poll.endsAt && new Date(poll.endsAt) < new Date();
  }

  toggleOption(poll: Poll, optionId: number): void {
    if (!this.isActive(poll)) return;
    if (!this.selectedOptions[poll.id]) this.selectedOptions[poll.id] = [];

    if (poll.allowMultipleChoice) {
      const idx = this.selectedOptions[poll.id].indexOf(optionId);
      if (idx > -1) {
        this.selectedOptions[poll.id].splice(idx, 1);
      } else {
        this.selectedOptions[poll.id].push(optionId);
      }
    } else {
      this.selectedOptions[poll.id] = [optionId];
    }
  }

  isOptionSelected(poll: Poll, optionId: number): boolean {
    return this.selectedOptions[poll.id]?.includes(optionId) ?? false;
  }

  canVote(poll: Poll): boolean {
    return this.isActive(poll) && (this.selectedOptions[poll.id]?.length ?? 0) > 0;
  }

  vote(poll: Poll): void {
    if (!this.canVote(poll)) return;
    this.votingPollId = poll.id;
    this.pollService.vote(poll.id, { optionIds: this.selectedOptions[poll.id] })
      .pipe(finalize(() => (this.votingPollId = null)))
      .subscribe({
        next: (res) => {
          this.notify.success(res?.data?.Message || this.i18n.instant('POLL.VOTE_SUCCESS'));
          this.load();
        },
        error: (err) => this.notify.error(err?.error?.Message || this.i18n.instant('COMMON.ERROR'))
      });
  }

  toggleActive(poll: Poll): void {
    this.pollService.update({
      id: poll.id,
      title: poll.title,
      description: poll.description,
      endsAt: poll.endsAt,
      isActive: !poll.isActive
    }).subscribe({
      next: () => {
        this.notify.success(this.i18n.instant('COMMON.UPDATE_SUCCESS'));
        poll.isActive = !poll.isActive;
      },
      error: (err) => this.notify.error(err?.error?.Message || this.i18n.instant('COMMON.ERROR'))
    });
  }

  deletePoll(poll: Poll): void {
    if (!confirm(this.i18n.instant('COMMON.CONFIRM_DELETE'))) return;
    this.pollService.deletePoll(poll.id).subscribe({
      next: () => {
        this.notify.success(this.i18n.instant('COMMON.DELETE_SUCCESS'));
        this.polls = this.polls.filter(p => p.id !== poll.id);
      },
      error: (err) => this.notify.error(err?.error?.Message || this.i18n.instant('COMMON.ERROR'))
    });
  }

  editPoll(poll: Poll): void {
    this.router.navigate(['/polls/edit', poll.id]);
  }

  createPoll(): void {
    this.router.navigate(['/polls/create']);
  }

  getProgressWidth(percentage: number): string {
    return `${percentage}%`;
  }

  toggleVoters(poll: Poll): void {
    const id = poll.id;
    if (this.votersOpen[id]) {
      this.votersOpen[id] = false;
      return;
    }
    this.votersOpen[id] = true;
    if (this.voters[id]) return;
    this.votersLoading[id] = true;
    this.pollService.getVoters(id)
      .pipe(finalize(() => (this.votersLoading[id] = false)))
      .subscribe({
        next: (res) => { this.voters[id] = (res?.data as any) || []; },
        error: (err) => this.notify.error(err?.error?.Message || this.i18n.instant('COMMON.ERROR'))
      });
  }
}
