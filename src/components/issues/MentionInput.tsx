"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Loader2, AtSign, X } from "lucide-react";

export interface MentionUser {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
}

interface MentionInputProps {
  projectId: string;
  content: string;
  onChange: (content: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  onUserSearch?: (query: string) => Promise<MentionUser[]> | MentionUser[];
}

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
    '<span class="text-primary font-semibold">@$1</span>'
  );
}

// Get current word from cursor position
function getCurrentWord(
  text: string,
  cursorPosition: number
): { word: string; startIndex: number } {
  let startIndex = cursorPosition;

  // Find the start of the current word (go back until we hit a space or @)
  while (startIndex > 0) {
    const char = text[startIndex - 1];
    if (char === " " || char === "\n") {
      break;
    }
    if (char === "@" && startIndex === cursorPosition) {
      // @ is at cursor, this is a new mention
      break;
    }
    startIndex--;
  }

  const word = text.slice(startIndex, cursorPosition);
  return { word, startIndex };
}

export function MentionInput({
  projectId,
  content,
  onChange,
  onSubmit,
  placeholder = "댓글을 입력하세요... @멘션을 사용할 수 있습니다",
  isLoading = false,
  disabled = false,
  onUserSearch,
}: MentionInputProps) {
  const [mentionQuery, setMentionQuery] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<MentionUser[]>([]);
  const [showMentionList, setShowMentionList] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionListRef = useRef<HTMLDivElement>(null);

  // Handle textarea input
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newCursorPosition = e.target.selectionStart;

    onChange(newValue);
    setCursorPosition(newCursorPosition);

    // Check if we're in a mention
    const { word, startIndex } = getCurrentWord(newValue, newCursorPosition);

    if (word.startsWith("@") && word.length > 1) {
      const query = word.slice(1); // Remove @
      setMentionQuery(query);
      setSelectedIndex(0);
      setShowMentionList(true);

      // Search for users
      if (onUserSearch) {
        setIsSearching(true);
        Promise.resolve(onUserSearch(query))
          .then((users) => {
            setFilteredUsers(users);
          })
          .finally(() => {
            setIsSearching(false);
          });
      }
    } else {
      setShowMentionList(false);
      setMentionQuery("");
      setFilteredUsers([]);
    }
  };

  // Insert mention
  const insertMention = useCallback(
    (user: MentionUser) => {
      const { word, startIndex } = getCurrentWord(content, cursorPosition);

      // Replace the @partial with @username
      const before = content.slice(0, startIndex);
      const after = content.slice(cursorPosition);
      const mentionText = `@${user.name}`;

      onChange(`${before}${mentionText} ${after}`);

      // Hide mention list
      setShowMentionList(false);
      setMentionQuery("");
      setFilteredUsers([]);

      // Focus textarea and move cursor after mention
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = startIndex + mentionText.length + 1;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    },
    [content, cursorPosition, onChange]
  );

  // Handle keyboard navigation in mention list
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMentionList || filteredUsers.length === 0) {
      // Handle Ctrl+Enter to submit
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && onSubmit) {
        e.preventDefault();
        onSubmit();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredUsers.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredUsers.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (filteredUsers[selectedIndex]) {
          insertMention(filteredUsers[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowMentionList(false);
        break;
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDownWrapper = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    handleKeyDown(e);
  };

  // Scroll selected item into view
  useEffect(() => {
    if (mentionListRef.current) {
      const selectedElement = mentionListRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      ) as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  // Close mention list when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mentionListRef.current &&
        !mentionListRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowMentionList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      {/* Mention Dropdown */}
      {showMentionList && (
        <Card
          ref={mentionListRef}
          className="absolute z-50 w-full max-h-60 mt-1 overflow-hidden"
          padding={0}
        >
          <ScrollArea className="max-h-60">
            {isSearching ? (
              <div className="p-4 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="py-1">
                {filteredUsers.map((user, index) => (
                  <button
                    key={user.id}
                    type="button"
                    data-index={index}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent transition-colors ${
                      index === selectedIndex ? "bg-accent" : ""
                    }`}
                    onClick={() => insertMention(user)}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-sm text-muted-foreground text-center">
                "{mentionQuery}"에 대한 검색 결과가 없습니다
              </div>
            )}
          </ScrollArea>
        </Card>
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInputChange}
          onKeyDown={handleKeyDownWrapper}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={4}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />

        {/* Character count and mention hint */}
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          {showMentionList && filteredUsers.length > 0 && (
            <span className="text-xs text-muted-foreground bg-background px-1">
              <kbd className="px-1 py-0.5 text-[10px] border rounded">↑↓</kbd>
              탐색{" "}
              <kbd className="px-1 py-0.5 text-[10px] border rounded">Enter</kbd>
              선택{" "}
              <kbd className="px-1 py-0.5 text-[10px] border rounded">Esc</kbd>
              취소
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {content.length}자
          </span>
        </div>
      </div>

      {/* Preview with highlighted mentions */}
      {content.includes("@") && (
        <Card className="mt-2 p-3 bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">미리보기:</p>
          <div
            className="text-sm whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: highlightMentions(content) }}
          />
        </Card>
      )}
    </div>
  );
}

// Component for rendering highlighted mentions in read-only mode
interface MentionTextProps {
  content: string;
}

export function MentionText({ content }: MentionTextProps) {
  return (
    <div
      className="text-sm whitespace-pre-wrap break-words"
      dangerouslySetInnerHTML={{ __html: highlightMentions(content) }}
    />
  );
}
