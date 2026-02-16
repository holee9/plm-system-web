"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { trpc } from "@/lib/trpc";

const forgotPasswordSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const requestResetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: (data) => {
      toast({ title: data.message, variant: "default" });
      setIsSubmitted(true);

      // In development mode, log the token
      if (process.env.NODE_ENV === "development" && "resetToken" in data) {
        console.log("Password reset token:", data.resetToken);
        toast({ title: "개발 모드: 콘솔에서 재설정 토큰을 확인하세요", variant: "default" });
      }
    },
    onError: (error) => {
      toast({ title: error.message || "요청에 실패했습니다", variant: "destructive" });
      setIsLoading(false);
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await requestResetMutation.mutateAsync(values);
    } catch {
      // Error handled in mutation callback
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">이메일 전송 완료</CardTitle>
          <CardDescription>
            비밀번호 재설정 링크가 이메일로 발송되었습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            입력하신 이메일 주소로 비밀번호 재설정 링크를 보냈습니다.
            이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정하세요.
          </p>
          <p className="text-sm text-muted-foreground">
            이메일이 보이지 않으면 스팸 폴더를 확인해주세요.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setIsSubmitted(false);
              form.reset();
            }}
          >
            다시 시도
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">비밀번호 찾기</CardTitle>
        <CardDescription>
          이메일을 입력하면 비밀번호 재설정 링크를 보내드립니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@company.com"
                      type="email"
                      autoComplete="email"
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
              재설정 링크 받기
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Link href="/login" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          로그인으로 돌아가기
        </Link>
      </CardFooter>
    </Card>
  );
}
