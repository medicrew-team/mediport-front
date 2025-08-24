// types/post.ts

export interface Author {
  id: string;           // 백엔드 authorDto.id → user_id
  profileImage: string | null; // user_img 또는 null
  nickname: string;
  country: string;
  region: string;
}

export interface Comment {
  comment_id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
}

export interface PostType {
  board_id: number;
  title: string;
  content: string;
  view: number;
  createdAt: string;
  updatedAt: string;
  author: Author;
  commentCount: number;
  likeCount: number;
  comments: Comment[]; // 상세 조회 시 포함
  category?: string;   // CreateBoardDto / UpdateBoardDto와 연동 가능
}

// 요청 DTO용 타입
export interface CreateBoardDto {
  title: string;
  content: string;
  category: string;
}

export interface UpdateBoardDto {
  title: string;
  content: string;
  category: string;
}
