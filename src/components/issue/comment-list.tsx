"use client";

import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Comment {
  id: string;
  content: string;
  createdAt: Date | string;
  author?: {
    name: string;
    initials: string;
  } | null;
}

interface CommentListProps {
  comments: Comment[];
  isLoading?: boolean;
}

export function CommentList({ comments, isLoading }: CommentListProps) {
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
        <div key={comment.id} className="flex gap-3">
          {/* Author Avatar */}
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="text-xs">
              {comment.author?.initials || "?"}
            </AvatarFallback>
          </Avatar>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            {/* Author Header */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">
                {comment.author?.name || "알 수 없음"}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: ko,
                })}
              </span>
            </div>

            {/* Comment Text */}
            <div className="text-sm whitespace-pre-wrap break-words">
              {comment.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
