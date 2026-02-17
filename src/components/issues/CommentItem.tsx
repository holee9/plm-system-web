"use client";

import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Edit2 } from "lucide-react";

// Highlight mentions in text
function highlightMentions(text: string): string {
  // Escape HTML entities first
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Highlight mentions (@username)
  return escaped.replace(
    /@(\w+(?:\s+\w+)*)/g,
    '<span class="text-primary font-semibold bg-primary/10 px-1 rounded">@$1</span>'
  );
}

export interface CommentItemProps {
  id: string;
  content: string;
  createdAt: Date | string;
  author?: {
    id: string;
    name: string;
    initials: string;
    avatarUrl?: string;
  } | null;
  currentUserId?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
}

export function CommentItem({
  id,
  content,
  createdAt,
  author,
  currentUserId,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
}: CommentItemProps) {
  const isOwner = author?.id === currentUserId;

  return (
    <div className="flex gap-3 group">
      {/* Author Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="text-xs">
          {author?.initials || "?"}
        </AvatarFallback>
      </Avatar>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        {/* Author Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">
            {author?.name || "알 수 없음"}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(createdAt), {
              addSuffix: true,
              locale: ko,
            })}
          </span>

          {/* Actions Menu */}
          {(isOwner || canEdit || canDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && (
                  <DropdownMenuItem
                    onClick={() => onEdit?.(id, content)}
                    className="gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    수정
                  </DropdownMenuItem>
                )}
                {(isOwner || canDelete) && (
                  <DropdownMenuItem
                    onClick={() => onDelete?.(id)}
                    className="gap-2 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    삭제
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Comment Text with Highlighted Mentions */}
        <div
          className="text-sm whitespace-pre-wrap break-words"
          dangerouslySetInnerHTML={{ __html: highlightMentions(content) }}
        />
      </div>
    </div>
  );
}
