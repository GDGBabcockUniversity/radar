export interface Signal {
  id: string;
  memberId: string;
  name: string;
  body: string;
  createdAt: string;
  replyCount: number;
}

export interface Reply {
  id: string;
  parentId: string;
  memberId: string;
  name: string;
  body: string;
  createdAt: string;
}
