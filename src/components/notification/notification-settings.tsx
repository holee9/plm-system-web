"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/trpc/react";
import { Switch } from "~/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// Form validation schema
const preferenceSchema = z.object({
  channel: z.enum(["in_app", "email", "push"]),
  category: z.enum(["issues", "projects", "plm"]),
  enabled: z.boolean().optional(),
  frequency: z.enum(["immediate", "hourly", "daily", "weekly"]).optional(),
  projectId: z.string().optional(),
});

type PreferenceFormData = z.infer<typeof preferenceSchema>;

interface NotificationSettingsProps {
  projectId?: string;
}

export function NotificationSettings({ projectId }: NotificationSettingsProps) {
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch user preferences
  const { data: preferences, isLoading } = api.notification.getPreferences.useQuery(
    { projectId },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  // Update preference mutation
  const updatePreference = api.notification.updatePreference.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["notification", "getPreferences"]] });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    },
    onError: (error) => {
      toast.error("설정 저장 실패", {
        description: error.message,
      });
    },
  });

  // Bulk update mutation
  const bulkUpdatePreferences = api.notification.bulkUpdatePreferences.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["notification", "getPreferences"]] });
      toast.success("모든 설정이 저장되었습니다");
    },
    onError: (error) => {
      toast.error("일괄 저장 실패", {
        description: error.message,
      });
    },
  });

  // Reset to defaults
  const resetPreferences = api.notification.resetPreferences.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["notification", "getPreferences"]] });
      toast.success("기본값으로 재설되었습니다");
    },
    onError: (error) => {
      toast.error("재설정 실패", {
        description: error.message,
      });
    },
  });

  const handleToggle = (
    channel: "in_app" | "email" | "push",
    category: "issues" | "projects" | "plm",
    enabled: boolean
  ) => {
    updatePreference.mutate({
      channel,
      category,
      enabled,
      projectId,
    });
  };

  const handleFrequencyChange = (
    channel: "in_app" | "email" | "push",
    category: "issues" | "projects" | "plm",
    frequency: "immediate" | "hourly" | "daily" | "weekly"
  ) => {
    updatePreference.mutate({
      channel,
      category,
      frequency,
      projectId,
    });
  };

  const handleResetToDefaults = () => {
    if (confirm("정말로 기본 설정으로 재설정하시겠습니까?")) {
      resetPreferences.mutate({ projectId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const globalPrefs = preferences?.global || [];
  const projectPrefs = preferences?.projectSpecific || [];

  // Build preference matrix
  const channels: Array<"in_app" | "email" | "push"> = ["in_app", "email", "push"];
  const categories: Array<"issues" | "projects" | "plm"> = ["issues", "projects", "plm"];

  const getPreference = (channel: typeof channels[number], category: typeof categories[number]) => {
    // Check project-specific first
    if (projectId) {
      const projectPref = projectPrefs.find(
        (p) => p.channel === channel && p.category === category
      );
      if (projectPref) return projectPref;
    }
    // Fall back to global
    return globalPrefs.find((p) => p.channel === channel && p.category === category);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">알림 설정</h3>
          <p className="text-sm text-muted-foreground">
            {projectId ? "프로젝트별 알림 설정" : "전체 알림 설정"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showSuccess && (
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              저장됨
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetToDefaults}
            disabled={resetPreferences.isPending}
          >
            {resetPreferences.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "기본값으로 재설정"
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="channels">채널별</TabsTrigger>
          <TabsTrigger value="categories">카테고리별</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <SettingsMatrix
            channels={channels}
            categories={categories}
            getPreference={getPreference}
            onToggle={handleToggle}
            onFrequencyChange={handleFrequencyChange}
            isUpdating={updatePreference.isPending}
          />
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          {channels.map((channel) => (
            <ChannelSettings
              key={channel}
              channel={channel}
              categories={categories}
              getPreference={getPreference}
              onToggle={handleToggle}
              onFrequencyChange={handleFrequencyChange}
              isUpdating={updatePreference.isPending}
            />
          ))}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {categories.map((category) => (
            <CategorySettings
              key={category}
              category={category}
              channels={channels}
              getPreference={getPreference}
              onToggle={handleToggle}
              onFrequencyChange={handleFrequencyChange}
              isUpdating={updatePreference.isPending}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Settings Matrix Component
interface SettingsMatrixProps {
  channels: Array<"in_app" | "email" | "push">;
  categories: Array<"issues" | "projects" | "plm">;
  getPreference: (channel: typeof channels[number], category: typeof categories[number]) => any;
  onToggle: (channel: typeof channels[number], category: typeof categories[number], enabled: boolean) => void;
  onFrequencyChange: (channel: typeof channels[number], category: typeof categories[number], frequency: "immediate" | "hourly" | "daily" | "weekly") => void;
  isUpdating: boolean;
}

function SettingsMatrix({
  channels,
  categories,
  getPreference,
  onToggle,
  onFrequencyChange,
  isUpdating,
}: SettingsMatrixProps) {
  const channelLabels: Record<string, string> = {
    in_app: "앱 내 알림",
    email: "이메일",
    push: "푸시 알림",
  };

  const categoryLabels: Record<string, string> = {
    issues: "이슈",
    projects: "프로젝트",
    plm: "PLM",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>알림 설정 매트릭스</CardTitle>
        <CardDescription>
          채널과 카테고리별로 알림을 설정하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2 border-b">카테고리</th>
                {channels.map((channel) => (
                  <th key={channel} className="text-center p-2 border-b min-w-[150px]">
                    {channelLabels[channel]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category}>
                  <td className="p-2 border-b font-medium">{categoryLabels[category]}</td>
                  {channels.map((channel) => {
                    const pref = getPreference(channel, category);
                    return (
                      <td key={channel} className="p-2 border-b">
                        <div className="flex flex-col items-center gap-2">
                          <Switch
                            checked={pref?.enabled ?? true}
                            onCheckedChange={(checked) => onToggle(channel, category, checked)}
                            disabled={isUpdating}
                          />
                          {pref?.enabled && (
                            <Select
                              value={pref?.frequency ?? "immediate"}
                              onValueChange={(value: any) => onFrequencyChange(channel, category, value)}
                              disabled={isUpdating}
                            >
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="immediate">즉시</SelectItem>
                                <SelectItem value="hourly">매시</SelectItem>
                                <SelectItem value="daily">매일</SelectItem>
                                <SelectItem value="weekly">매주</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// Channel Settings Component
interface ChannelSettingsProps {
  channel: "in_app" | "email" | "push";
  categories: Array<"issues" | "projects" | "plm">;
  getPreference: (channel: typeof channels[number], category: typeof categories[number]) => any;
  onToggle: (channel: typeof channels[number], category: typeof categories[number], enabled: boolean) => void;
  onFrequencyChange: (channel: typeof channels[number], category: typeof categories[number], frequency: "immediate" | "hourly" | "daily" | "weekly") => void;
  isUpdating: boolean;
}

function ChannelSettings({
  channel,
  categories,
  getPreference,
  onToggle,
  onFrequencyChange,
  isUpdating,
}: ChannelSettingsProps) {
  const channelLabels: Record<string, string> = {
    in_app: "앱 내 알림",
    email: "이메일",
    push: "푸시 알림",
  };

  const categoryLabels: Record<string, string> = {
    issues: "이슈",
    projects: "프로젝트",
    plm: "PLM",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{channelLabels[channel]}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((category) => {
          const pref = getPreference(channel, category);
          return (
            <div key={category} className="flex items-center justify-between">
              <Label>{categoryLabels[category]}</Label>
              <div className="flex items-center gap-4">
                <Switch
                  checked={pref?.enabled ?? true}
                  onCheckedChange={(checked) => onToggle(channel, category, checked)}
                  disabled={isUpdating}
                />
                {pref?.enabled && (
                  <Select
                    value={pref?.frequency ?? "immediate"}
                    onValueChange={(value: any) => onFrequencyChange(channel, category, value)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">즉시</SelectItem>
                      <SelectItem value="hourly">매시</SelectItem>
                      <SelectItem value="daily">매일</SelectItem>
                      <SelectItem value="weekly">매주</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// Category Settings Component
interface CategorySettingsProps {
  category: "issues" | "projects" | "plm";
  channels: Array<"in_app" | "email" | "push">;
  getPreference: (channel: typeof channels[number], category: typeof categories[number]) => any;
  onToggle: (channel: typeof channels[number], category: typeof categories[number], enabled: boolean) => void;
  onFrequencyChange: (channel: typeof channels[number], category: typeof categories[number], frequency: "immediate" | "hourly" | "daily" | "weekly") => void;
  isUpdating: boolean;
}

function CategorySettings({
  category,
  channels,
  getPreference,
  onToggle,
  onFrequencyChange,
  isUpdating,
}: CategorySettingsProps) {
  const categoryLabels: Record<string, string> = {
    issues: "이슈",
    projects: "프로젝트",
    plm: "PLM",
  };

  const channelLabels: Record<string, string> = {
    in_app: "앱 내 알림",
    email: "이메일",
    push: "푸시 알림",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{categoryLabels[category]}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {channels.map((channel) => {
          const pref = getPreference(channel, category);
          return (
            <div key={channel} className="flex items-center justify-between">
              <Label>{channelLabels[channel]}</Label>
              <div className="flex items-center gap-4">
                <Switch
                  checked={pref?.enabled ?? true}
                  onCheckedChange={(checked) => onToggle(channel, category, checked)}
                  disabled={isUpdating}
                />
                {pref?.enabled && (
                  <Select
                    value={pref?.frequency ?? "immediate"}
                    onValueChange={(value: any) => onFrequencyChange(channel, category, value)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">즉시</SelectItem>
                      <SelectItem value="hourly">매시</SelectItem>
                      <SelectItem value="daily">매일</SelectItem>
                      <SelectItem value="weekly">매주</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
