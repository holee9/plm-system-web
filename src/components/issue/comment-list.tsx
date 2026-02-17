"use client";

import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { CommentItem, type CommentItemProps } from "~/components/issues/CommentItem";

interface Comment {
  id: string;
  content: string;
  createdAt: Date | string;
  author?: {
    id: string;
    name: string;
    initials: string;
    avatarUrl?: string;
  } | null;
}

interface CommentListProps {
  comments: Comment[];
  isLoading?: boolean;
  currentUserId?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
}

export function CommentList({
  comments,
  isLoading,
  currentUserId,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
}: CommentListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-16 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          id={comment.id}
          content={comment.content}
          createdAt={comment.createdAt}
          author={comment.author}
          currentUserId={currentUserId}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
