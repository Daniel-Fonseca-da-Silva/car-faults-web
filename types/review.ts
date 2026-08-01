export interface Review {
  id: string;
  userId: string;
  knownIssueId: string;
  rating: number;
  comment: string | null;
  userName: string | null;
  userAvatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
