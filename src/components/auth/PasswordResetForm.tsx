/**
 * PasswordResetForm Component
 *
 * Handles password reset flow with two modes:
 * 1. Request mode: User enters email to request reset link
 * 2. Reset mode: User enters new password with token from URL
 *
 * Korean language for all user-facing text.
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, CheckCircle, Mail } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Password strength checker for client-side validation
function getPasswordStrength(password: string): {
  strength: "weak" | "medium" | "strong";
  score: number;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) {
    return { strength: "weak", score, color: "bg-destructive" };
  } else if (score <= 3) {
    return { strength: "medium", score, color: "bg-amber-500" };
  } else {
    return { strength: "strong", score, color: "bg-emerald-500" };
  }
}

// Request reset schema
const requestResetSchema = z.object({
  email: z.string().email("유효한 이메일을 입력해주세요"),
});

// Reset password schema
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "비밀번호는 8자 이상 입력해주세요")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)|(?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9])|(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])|(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])/,
        "비밀번호는 대문자, 소문자, 숫자, 특수문자 중 3가지 이상을 포함해야 합니다"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

type RequestResetFormData = z.infer<typeof requestResetSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Inner component that uses useSearchParams
function PasswordResetFormInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isRequestSuccess, setIsRequestSuccess] = useState(false);
  const [requestEmail, setRequestEmail] = useState("");

  // tRPC mutations
  const requestResetMutation = trpc.auth.requestPasswordReset.useMutation();
  const resetPasswordMutation = trpc.auth.resetPassword.useMutation();

  // Request mode form
  const requestForm = useForm<RequestResetFormData>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: {
      email: "",
    },
  });

  // Reset mode form
  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const [passwordValue, setPasswordValue] = useState("");
  const passwordStrength = getPasswordStrength(passwordValue);

  // Handle request reset
  const onRequestSubmit = async (data: RequestResetFormData) => {
    try {
      await requestResetMutation.mutateAsync({ email: data.email });
      setRequestEmail(data.email);
      setIsRequestSuccess(true);
      toast({
        title: "이메일 발송 완료",
        description: "비밀번호 재설정 링크를 이메일로 발송했습니다",
      });
    } catch (error) {
      console.error("Password reset request error:", error);
      toast({
        variant: "destructive",
        title: "요청 실패",
        description:
          error instanceof Error ? error.message : "비밀번호 재설정 요청 중 오류가 발생했습니다",
      });
    }
  };

  // Handle reset password
  const onResetSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast({
        variant: "destructive",
        title: "유효하지 않은 링크",
        description: "비밀번호 재설정 토큰이 없습니다",
      });
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        newPassword: data.password,
      });
      toast({
        title: "비밀번호 변경 완료",
        description: "비밀번호가 성공적으로 변경되었습니다. 로그인해주세요",
      });
      router.push("/login");
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        variant: "destructive",
        title: "재설정 실패",
        description:
          error instanceof Error ? error.message : "비밀번호 재설정 중 오류가 발생했습니다",
      });
    }
  };

  // Render request mode (no token)
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">비밀번호 찾기</CardTitle>
            <CardDescription>
              가입한 이메일 주소를 입력하면 비밀번호 재설정 링크를 발송해드립니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isRequestSuccess ? (
              <div className="flex flex-col items-center space-y-4 py-8 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <CheckCircle className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">이메일 발송 완료</h3>
                  <p className="text-sm text-muted-foreground">
                    {requestEmail}로 비밀번호 재설정 링크를 발송했습니다
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  이메일이 도착하지 않았나요? 스팸 폴더를 확인하거나 잠시 후 다시 시도해주세요
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setIsRequestSuccess(false);
                    requestForm.reset();
                  }}
                >
                  다시 시도
                </Button>
              </div>
            ) : (
              <Form {...requestForm}>
                <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-6">
                  <FormField
                    control={requestForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이메일</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="example@email.com"
                            disabled={requestResetMutation.isPending}
                            autoComplete="email"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          가입할 때 사용한 이메일 주소를 입력해주세요
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={requestResetMutation.isPending}
                  >
                    {requestResetMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        처리 중...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        재설정 링크 받기
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                로그인 페이지로 돌아가기
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render reset mode (with token)
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">비밀번호 재설정</CardTitle>
          <CardDescription>새로운 비밀번호를 입력해주세요</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...resetForm}>
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-6">
              <FormField
                control={resetForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>새 비밀번호</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={resetPasswordMutation.isPending}
                        autoComplete="new-password"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setPasswordValue(e.target.value);
                        }}
                      />
                    </FormControl>
                    {passwordValue && (
                      <div className="mt-2 space-y-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={cn(
                                "h-1 flex-1 rounded-full transition-colors",
                                level <= passwordStrength.score
                                  ? passwordStrength.color
                          : "bg-muted"
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          비밀번호 강도:{" "}
                          <span
                            className={cn(
                              passwordStrength.strength === "weak" && "text-destructive",
                              passwordStrength.strength === "medium" && "text-amber-500",
                              passwordStrength.strength === "strong" && "text-emerald-500"
                            )}
                          >
                            {passwordStrength.strength === "weak" && "약함"}
                            {passwordStrength.strength === "medium" && "보통"}
                            {passwordStrength.strength === "strong" && "강함"}
                          </span>
                        </p>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={resetForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호 확인</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={resetPasswordMutation.isPending}
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={resetPasswordMutation.isPending}>
                {resetPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  "비밀번호 변경"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              로그인 페이지로 돌아가기
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main component with Suspense boundary for useSearchParams
export function PasswordResetForm() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted/30">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <PasswordResetFormInner />
    </Suspense>
  );
}
