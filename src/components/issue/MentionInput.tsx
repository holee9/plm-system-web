/**
 * MentionInput Component
 * Textarea with @mention support for project members
 *
 * Korean language for user-facing text
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Loader2, User } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  projectId?: string;
  className?: string;
}

interface UserMention {
  id: string;
  username: string;
  name: string;
  email: string;
}

interface ParsedMentions {
  content: string;
  mentions: Array<{ userId: string; username: string; position: [number, number] }>;
}

/**
 * Parse mentions from content
 * Finds @username patterns and extracts user info
 */
export function parseMentions(content: string): ParsedMentions {
  const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
  const mentions: Array<{ userId: string; username: string; position: [number, number] }> = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push({
      userId: "", // Will be resolved by backend
      username: match[1],
      position: [match.index, match.index + match[0].length] as [number, number],
    });
  }

  return { content, mentions };
}

/**
 * Replace @mentions with display format
 */
export function formatMentionsWithUsers(
  content: string,
  users: Map<string, UserMention>
): string {
  return content.replace(/@([a-zA-Z0-9_-]+)/g, (match, username) => {
    const user = Array.from(users.values()).find(u => u.username === username);
    if (user) {
      return `@${user.username}`;
    }
    return match;
  });
}

export function MentionInput({
  value,
  onChange,
  onSubmit,
  placeholder = "댓글을 입력하세요... (@멘션 지원)",
  disabled = false,
  rows = 4,
  projectId,
  className,
}: MentionInputProps) {
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionStartPos, setMentionStartPos] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Search project members when @ is triggered
  const { data: members, isLoading: isLoadingMembers } = trpc.project.listMembers.useQuery(
    { projectId: projectId! },
    {
      enabled: showMentions && !!projectId,
      staleTime: 60000, // Cache for 1 minute
    }
  );

  // Get user IDs from members and fetch user details
  const memberUserIds = members?.map(m => m.userId) || [];
  const { data: users } = trpc.user.list.useQuery(
    { limit: 100 },
    {
      enabled: memberUserIds.length > 0,
      staleTime: 60000,
    }
  );

  // Combine members with user details
  const membersWithUsers = members?.map(member => {
    const userDetail = users?.find(u => u.id === member.userId);
    return {
      ...member,
      user: userDetail,
    };
  }) || [];

  // Filter members based on query
  const filteredMembers = membersWithUsers.filter(member => {
    if (!member.user) return false;
    if (!mentionQuery) return true;
    const query = mentionQuery.toLowerCase();
    return (
      member.user.name?.toLowerCase().includes(query) ||
      member.user.email?.toLowerCase().includes(query)
    );
  });

  /**
   * Handle textarea input changes
   * Detect @ pattern for mentions
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Get current cursor position
    const pos = e.target.selectionStart;
    setCursorPosition(pos);

    // Check if user is typing a mention
    const textBeforeCursor = newValue.substring(0, pos);
    const mentionMatch = textBeforeCursor.match(/@([a-zA-Z0-9_-]*)$/);

    if (mentionMatch) {
      // User is typing a mention
      setMentionQuery(mentionMatch[1]);
      setMentionStartPos(pos - mentionMatch[0].length);
      setShowMentions(true);
    } else {
      // Not typing a mention
      setShowMentions(false);
      setMentionQuery("");
      setMentionStartPos(null);
    }
  };

  /**
   * Handle keyboard navigation in mention list
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMentions) {
      // Allow Ctrl/Cmd + Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && onSubmit) {
        e.preventDefault();
        onSubmit();
      }
      return;
    }

    // Handle mention list navigation
    if (e.key === "Escape") {
      e.preventDefault();
      setShowMentions(false);
      return;
    }

    // Let Command component handle arrow keys and Enter
    if (["ArrowUp", "ArrowDown", "Enter", "Tab"].includes(e.key)) {
      // Command component will handle these
      return;
    }
  };

  /**
   * Insert selected mention into textarea
   */
  const insertMention = useCallback((member: { userId: string; user: { id: string; name: string | null; email: string | null } }) => {
    if (mentionStartPos === null) return;

    const beforeMention = value.substring(0, mentionStartPos);
    const afterMention = value.substring(cursorPosition);

    // Use email username (part before @) or name
    const username = member.user.email?.split("@")[0] || member.user.name || "user";

    const newValue = `${beforeMention}@${username} ${afterMention}`;
    onChange(newValue);

    // Close mention popover
    setShowMentions(false);
    setMentionQuery("");
    setMentionStartPos(null);

    // Focus textarea and set cursor after inserted mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = mentionStartPos + username.length + 2; // +2 for "@ "
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [value, cursorPosition, mentionStartPos, onChange]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        !showMentions
      ) {
        setShowMentions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMentions]);

  return (
    <div ref={triggerRef} className="relative">
      <Popover open={showMentions} onOpenChange={setShowMentions}>
        <PopoverTrigger asChild>
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={cn("resize-none", className)}
          />
        </PopoverTrigger>
        <PopoverContent
          className="w-64 p-0"
          align="start"
          sideOffset={4}
        >
          <Command>
            <CommandInput
              placeholder="멘션할 사용자 검색..."
              value={mentionQuery}
              onValueChange={setMentionQuery}
            />
            <CommandList>
              {isLoadingMembers ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : filteredMembers.length === 0 ? (
                <CommandEmpty>사용자를 찾을 수 없습니다</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredMembers.map((member) => {
                    if (!member.user) return null;
                    const username = member.user.email?.split("@")[0] || member.user.name || "user";
                    return (
                      <CommandItem
                        key={member.userId}
                        value={member.userId}
                        onSelect={() => insertMention(member)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="font-medium">{member.user.name || "이름 없음"}</span>
                          <span className="text-xs text-muted-foreground">@{username}</span>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/**
 * Extract mentioned user IDs from comment content
 * @param content - Comment content with @mentions
 * @param members - Project members to match usernames against
 * @param users - User list to match usernames against
 * @returns Array of mentioned user IDs
 */
export function extractMentionedUserIds(
  content: string,
  members: Array<{ userId: string }>,
  users: Array<{ id: string; email: string | null; name: string | null }>
): string[] {
  const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
  const mentionedIds = new Set<string>();
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    const username = match[1];

    // Find user by username (email part or name)
    const user = users.find(u => {
      const userEmail = u.email?.split("@")[0];
      return userEmail === username || u.name === username;
    });

    if (user && members.some(m => m.userId === user.id)) {
      mentionedIds.add(user.id);
    }
  }

  return Array.from(mentionedIds);
}
