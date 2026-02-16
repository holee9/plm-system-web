"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { trpc } from "@/lib/trpc";

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "비밀번호는 최소 8자 이상이어야 합니다")
    .regex(/[A-Z]/, "비밀번호는 최소 하나의 대문자를 포함해야 합니다")
    .regex(/[a-z]/, "비밀번호는 최소 하나의 소문자를 포함해야 합니다")
    .regex(/[0-9]/, "비밀번호는 최소 하나의 숫자를 포함해야 합니다"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const token = searchParams.get("token");

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: (data) => {
      toast({ title: data.message, variant: "default" });
      setIsSuccess(true);
    },
    onError: (error) => {
      toast({ title: error.message || "비밀번호 재설정에 실패했습니다", variant: "destructive" });
      setIsLoading(false);
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      toast({ title: "유효하지 않은 재설정 링크입니다", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await resetPasswordMutation.mutateAsync({
        token,
        newPassword: values.newPassword,
      });
    } catch {
      // Error handled in mutation callback
    }
  };

  // Invalid token state
  if (!token) {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">유효하지 않은 링크</CardTitle>
          <CardDescription>
            이 재설정 링크는 유효하지 않거나 만료되었습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            비밀번호 재설정 링크가 올바르지 않습니다. 이메일 링크를 다시 확인하거나
            새로운 재설정 링크를 요청해주세요.
          </p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/forgot-password")} className="flex-1">
            새 링크 요청
          </Button>
          <Button onClick={() => router.push("/login")} className="flex-1">
            로그인
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold">비밀번호가 변경되었습니다</CardTitle>
          <CardDescription>
            새 비밀번호로 로그인할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            비밀번호가 성공적으로 재설정되었습니다. 새 비밀번호를 사용하여
            로그인하세요.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push("/login")} className="w-full">
            로그인하러 가기
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Form state
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">비밀번호 재설정</CardTitle>
        <CardDescription>
          새 비밀번호를 입력하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>새 비밀번호</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      autoComplete="new-password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호 확인</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      autoComplete="new-password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              비밀번호 변경
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground text-center w-full">
          비밀번호는 8자 이상이어야 하며 대문자, 소문자, 숫자를 포함해야 합니다
        </p>
      </CardFooter>
    </Card>
  );
}
