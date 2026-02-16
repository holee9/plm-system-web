/**
 * RegisterForm Component
 *
 * User registration form with email/password authentication.
 * Includes password strength indicator, terms acceptance, and validation.
 *
 * Korean language for all user-facing text.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Loader2 } from "lucide-react";

// Password strength checker
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
    return { strength: "medium", score, color: "bg-warning" };
  } else {
    return { strength: "strong", score, color: "bg-success" };
  }
}

// Form schema
const registerSchema = z
  .object({
    name: z.string().min(2, "이름은 2자 이상 입력해주세요"),
    email: z.string().email("유효한 이메일을 입력해주세요"),
    password: z
      .string()
      .min(8, "비밀번호는 8자 이상 입력해주세요")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)|(?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9])|(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])|(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])/,
        "비밀번호는 대문자, 소문자, 숫자, 특수문자 중 3가지 이상을 포함해야 합니다"
      ),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "이용약관에 동의해주세요",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = trpc.auth.register.useMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const passwordStrength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await registerMutation.mutateAsync({
        email: data.email,
        password: data.password,
        name: data.name,
      });
      toast({
        title: "회원가입 성공",
        description: "이메일 인증 링크를 발송했습니다",
      });
      router.push("/login");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "회원가입 실패",
        description:
          error instanceof Error
            ? error.message
            : "회원가입 중 오류가 발생했습니다",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">회원가입</CardTitle>
          <CardDescription>새 계정을 만들어보세요</CardDescription>
        </CardHeader>
        <CardContent>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="홍길동"
                      disabled={isSubmitting || registerMutation.isPending}
                      autoComplete="name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="example@email.com"
                      disabled={isSubmitting || registerMutation.isPending}
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      disabled={isSubmitting || registerMutation.isPending}
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
                            className={`h-1 flex-1 rounded-full ${
                              level <= passwordStrength.score
                                ? passwordStrength.color
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        비밀번호 강도:{" "}
                        <span
                          className={
                            passwordStrength.strength === "weak"
                              ? "text-destructive"
                              : passwordStrength.strength === "medium"
                                ? "text-warning"
                                : "text-success"
                          }
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

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호 확인</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      disabled={isSubmitting || registerMutation.isPending}
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Terms Checkbox */}
            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting || registerMutation.isPending}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal">
                      <Link
                        href="/terms"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        이용약관
                      </Link>
                      과{" "}
                      <Link
                        href="/privacy"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        개인정보처리방침
                      </Link>
                      에 동의합니다
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || registerMutation.isPending}
            >
              {isSubmitting || registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  가입 중...
                </>
              ) : (
                "회원가입"
              )}
            </Button>
          </form>
        </Form>

        {/* Login Link */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">이미 계정이 있으신가요? </span>
          <Link href="/login" className="text-primary hover:underline">
            로그인
          </Link>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
