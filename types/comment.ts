export interface Comment {
  id: string;
  userId: string;
  knownIssueId: string;
  body: string;
  imageUrl: string | null;
  userName: string | null;
  userAvatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
