"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Calendar,
  User,
  MessageSquare,
  Activity,
  Edit2,
  Save,
  X,
  Trash2,
  Send,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import type { Issue } from "./issue-card";

// Helper function to format date relative to now
function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString();
}

const formSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  type: z.enum(["bug", "story", "task", "epic"]),
  priority: z.enum(["critical", "high", "medium", "low"]),
  status: z.enum(["todo", "inProgress", "inReview", "done"]),
  assigneeId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const STATUS_CONFIG = {
  todo: { label: "To Do", color: "bg-gray-500" },
  inProgress: { label: "In Progress", color: "bg-blue-500" },
  inReview: { label: "In Review", color: "bg-amber-500" },
  done: { label: "Done", color: "bg-green-500" },
} as const;

const PRIORITY_CONFIG = {
  critical: { label: "Critical", color: "bg-red-500" },
  high: { label: "High", color: "bg-orange-500" },
  medium: { label: "Medium", color: "bg-yellow-500" },
  low: { label: "Low", color: "bg-green-500" },
} as const;

const TYPE_CONFIG = {
  bug: { label: "Bug", color: "bg-red-500" },
  story: { label: "Story", color: "bg-blue-500" },
  task: { label: "Task", color: "bg-green-500" },
  epic: { label: "Epic", color: "bg-purple-500" },
} as const;

interface IssueDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issueId?: string;
  issue?: Issue;
  onSuccess?: () => void;
}

export function IssueDetailDialog({
  open,
  onOpenChange,
  issueId,
  issue: propIssue,
  onSuccess,
}: IssueDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");

  const utils = trpc.useUtils();

  // Fetch issue detail if issueId is provided
  const { data: issueDetail, isLoading } = trpc.issue.getDetail.useQuery(
    { id: issueId || "" },
    { enabled: !!issueId && !propIssue }
  );

  const issue = propIssue || issueDetail?.issue;

  const updateIssue = trpc.issue.update.useMutation({
    onSuccess: () => {
      toast.success("Issue updated successfully");
      setIsEditing(false);
      utils.issue.list.invalidate();
      utils.issue.getDetail.invalidate({ id: issueId || "" });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update issue");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const deleteIssue = trpc.issue.delete.useMutation({
    onSuccess: () => {
      toast.success("Issue deleted successfully");
      onOpenChange(false);
      utils.issue.list.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete issue");
    },
  });

  const addComment = trpc.issue.addComment.useMutation({
    onSuccess: () => {
      toast.success("Comment added");
      setNewComment("");
      utils.issue.getDetail.invalidate({ id: issueId || "" });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add comment");
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: issue?.title || "",
      description: issue?.description || "",
      type: issue?.type || "task",
      priority: issue?.priority || "medium",
      status: issue?.status || "todo",
      assigneeId: issue?.assignee?.name || "",
    },
  });

  useEffect(() => {
    if (issue) {
      form.reset({
        title: issue.title,
        description: issue.description || "",
        type: issue.type,
        priority: issue.priority,
        status: issue.status,
        assigneeId: issue.assignee?.name || "",
      });
    }
  }, [issue, form]);

  const onSubmit = async (values: FormValues) => {
    if (!issue?.id) return;

    setIsSubmitting(true);
    updateIssue.mutate({
      id: issue.id,
      ...values,
    });
  };

  const handleDelete = () => {
    if (issue?.id && confirm("Are you sure you want to delete this issue?")) {
      deleteIssue.mutate({ id: issue.id });
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !issue?.id) return;

    addComment.mutate({
      issueId: issue.id,
      content: newComment,
      authorId: "current-user-id", // TODO: Get from auth
    });
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px]">
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading issue details...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!issue) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={cn(TYPE_CONFIG[issue.type].color, "text-white")}>
                  {TYPE_CONFIG[issue.type].label}
                </Badge>
                <span className="text-sm text-muted-foreground">{issue.key}</span>
              </div>
              {isEditing ? (
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} className="text-xl font-semibold" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ) : (
                <DialogTitle className="text-xl">{issue.title}</DialogTitle>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">
              Comments{" "}
              {issueDetail?.comments ? `(${issueDetail.comments.length})` : ""}
            </TabsTrigger>
            <TabsTrigger value="activity">
              Activity{" "}
              {issueDetail?.activities ? `(${issueDetail.activities.length})` : ""}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Status, Priority, Type */}
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!isEditing}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!isEditing}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(PRIORITY_CONFIG).map(([key, { label }]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!isEditing}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(TYPE_CONFIG).map(([key, { label }]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={8}
                          disabled={!isEditing}
                          placeholder="Add a description..."
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Metadata */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Assignee: {issue.assignee?.name || "Unassigned"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Created {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {isEditing && (
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                )}
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4 mt-4">
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {issueDetail?.comments && issueDetail.comments.length > 0 ? (
                issueDetail.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">User</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No comments yet</p>
                </div>
              )}
            </div>

            {/* Add Comment */}
            <div className="flex gap-2 mt-4">
              <Textarea
                placeholder="Add a comment..."
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4 mt-4">
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {issueDetail?.activities && issueDetail.activities.length > 0 ? (
                issueDetail.activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div className="w-px bg-border flex-1 mt-1" />
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm">
                        <span className="font-medium">User</span> changed{" "}
                        <span className="font-medium">{activity.field}</span>
                        {activity.oldValue && (
                          <span>
                            {" from "}
                            <span className="line-through text-muted-foreground">
                              {activity.oldValue}
                            </span>
                          </span>
                        )}
                        {activity.newValue && (
                          <span>
                            {" to "}
                            <span className="font-medium">{activity.newValue}</span>
                          </span>
                        )}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No activity yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
