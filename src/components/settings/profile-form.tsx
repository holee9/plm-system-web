"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User as UserIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";

const profileSchema = z.object({
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다").max(100),
  image: z.string().url("올바른 URL을 입력해주세요").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { data: user, isLoading: isLoadingUser, refetch: refetchUser } = trpc.user.me.useQuery();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      image: "",
    },
  });

  // Update form when user data loads
  if (user && !form.formState.isDirty) {
    form.reset({
      name: user.name || "",
      image: user.image || "",
    });
  }

  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: (data) => {
      toast({ title: data.message, variant: "default" });
      // Invalidate and refetch user data
      refetchUser();
      setIsLoading(false);
    },
    onError: (error) => {
      toast({ title: error.message || "프로필 업데이트에 실패했습니다", variant: "destructive" });
      setIsLoading(false);
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    setIsLoading(true);
    try {
      await updateProfileMutation.mutateAsync({
        name: values.name,
        image: values.image || undefined,
      });
    } catch {
      // Error handled in mutation callback
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (isLoadingUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>프로필</CardTitle>
          <CardDescription>사용자 정보를 관리하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>프로필</CardTitle>
        <CardDescription>사용자 정보를 관리하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={form.watch("image")} />
              <AvatarFallback className="text-xl">
                {form.watch("name") ? getInitials(form.watch("name")) : <UserIcon className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {user?.status && (
                <span className="text-xs text-muted-foreground">
                  상태: {user.status}
                </span>
              )}
            </div>
          </div>

          {/* Form Section */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름</FormLabel>
                    <FormControl>
                      <Input placeholder="홍길동" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>프로필 이미지 URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/avatar.jpg"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={isLoading || !form.formState.isDirty}
                >
                  취소
                </Button>
                <Button type="submit" disabled={isLoading || !form.formState.isDirty}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  저장
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
