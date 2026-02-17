"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { MentionInput } from "./MentionInput";

interface CommentFormProps {
  onSubmit: (content: string, mentionedUserIds?: string[]) => Promise<void>;
  isLoading?: boolean;
  placeholder?: string;
  projectId?: string;
}

export function CommentForm({
  onSubmit,
  isLoading = false,
  placeholder = "댓글을 입력하세요... (@멘션 지원)",
  projectId,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("댓글 내용을 입력해주세요");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent("");
      toast.success("댓글이 등록되었습니다");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "댓글 등록에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <MentionInput
        value={content}
        onChange={setContent}
        onSubmit={handleSubmit}
        placeholder={placeholder}
        disabled={isLoading || isSubmitting}
        projectId={projectId}
      />
      <div className="flex items-center justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || isLoading || isSubmitting}
          size="sm"
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          댓글 작성
        </Button>
      </div>
    </div>
  );
}
