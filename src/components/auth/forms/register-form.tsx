"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { trpc } from "@/lib/trpc";

const registerSchema = z.object({
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다").max(100),
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutation = trpc.auth.register.useMutation();

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      // Step 1: Register user
      const registerResult = await registerMutation.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (registerResult.success) {
        toast({ title: "회원가입이 완료되었습니다. 자동 로그인합니다...", variant: "default" });

        // Step 2: Auto-login with credentials
        const signInResult = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        if (signInResult?.error) {
          toast({
            title: "자동 로그인에 실패했습니다",
            description: "수동으로 로그인해주세요",
            variant: "destructive",
          });
          router.push("/login");
          return;
        }

        if (signInResult?.ok) {
          toast({ title: "로그인되었습니다", variant: "default" });
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: error.message || "회원가입에 실패했습니다",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
        <CardDescription>
          정보를 입력하여 새 계정을 만드세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="홍길동"
                      autoComplete="name"
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호</FormLabel>
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
              계정 만들기
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <p className="text-xs text-muted-foreground text-center">
          가입 시 서비스 약관과 개인정보 처리방침에 동의하게 됩니다
        </p>
        <div className="text-sm text-muted-foreground text-center">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            로그인
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
