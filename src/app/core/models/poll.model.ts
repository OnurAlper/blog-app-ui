export interface PollOption {
  id: number;
  optionText: string;
  orderIndex: number;
  voteCount: number;
  percentage: number;
}

export interface Poll {
  id: number;
  title: string;
  description?: string;
  createdByAdminId: number;
  createdByAdminName: string;
  createdAt: string;
  endsAt?: string;
  isActive: boolean;
  allowMultipleChoice: boolean;
  totalVoters: number;
  hasVoted: boolean;
  userVotedOptionIds: number[];
  options: PollOption[];
}

export interface CreatePollDto {
  title: string;
  description?: string;
  endsAt?: string;
  allowMultipleChoice: boolean;
  options: string[];
}

export interface UpdatePollDto {
  id: number;
  title: string;
  description?: string;
  endsAt?: string;
  isActive: boolean;
}

export interface VotePollDto {
  optionIds: number[];
}

export interface PollVoter {
  userId: number;
  userName: string;
  userFullName: string;
  votedOptions: string[];
  votedAt: string;
}
