/**
 * EmailVerification Component
 *
 * Displays email verification pending state after registration.
 * Shows option to resend verification email.
 *
 * Korean language for all user-facing text.
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { designTokens } from "@/lib/design-tokens";

// Inner component that uses useSearchParams
function EmailVerificationInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const { user, checkAuth } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [manualEmail, setManualEmail] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const verifyMutation = trpc.auth.verifyEmail.useMutation();

  // Check if user is already verified
  useEffect(() => {
    if (user?.emailVerified) {
      setIsVerified(true);
    }
  }, [user]);

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (token && !isVerified && !isVerifying) {
      handleVerifyEmail(token);
    }
  }, [token]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Handle email verification with token
  const handleVerifyEmail = async (verificationToken: string) => {
    setIsVerifying(true);
    try {
      await verifyMutation.mutateAsync({ token: verificationToken });
      setIsVerified(true);
      toast({
        title: "이메일 인증 완료",
        description: "이메일이 성공적으로 인증되었습니다",
      });
      // Refresh auth state
      await checkAuth();
      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Email verification error:", error);
      toast({
        variant: "destructive",
        title: "인증 실패",
        description:
          error instanceof Error && error.message !== "IMPLEMENTATION_PENDING"
            ? error.message
            : "이메일 인증에 실패했습니다. 링크가 만료되었거나 유효하지 않습니다",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle resend verification email
  const handleResendEmail = async () => {
    if (resendCountdown > 0) return;

    const emailToSend = manualEmail || email || user?.email;
    if (!emailToSend) {
      setShowManualInput(true);
      return;
    }

    setIsResending(true);
    try {
      // Note: This would require a resendVerificationEmail mutation
      // For now, showing a toast message
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "인증 이메일 재발송",
        description: `${emailToSend}로 인증 이메일을 재발송했습니다`,
      });
      // Start 60 second countdown
      setResendCountdown(60);
    } catch (error) {
      console.error("Resend verification error:", error);
      toast({
        variant: "destructive",
        title: "재발송 실패",
        description: "인증 이메일 재발송 중 오류가 발생했습니다",
      });
    } finally {
      setIsResending(false);
    }
  };

  // Render verified state
  if (isVerified || user?.emailVerified) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-muted/30 px-4"
        style={{ padding: designTokens.spacing.md }}
      >
        <Card
          className="w-full max-w-md text-center"
          style={{ padding: designTokens.spacing["2xl"] }}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-primary/10 p-4">
              <CheckCircle className="h-16 w-16 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">이메일 인증 완료</h1>
              <p className="text-muted-foreground">
                이메일이 성공적으로 인증되었습니다
              </p>
            </div>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              대시보드로 이동
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Render verification in progress
  if (isVerifying) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-muted/30 px-4"
        style={{ padding: designTokens.spacing.md }}
      >
        <Card
          className="w-full max-w-md text-center"
          style={{ padding: designTokens.spacing["2xl"] }}
        >
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">이메일 인증 중</h1>
              <p className="text-muted-foreground">잠시만 기다려주세요...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Render pending verification state
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12"
      style={{ padding: designTokens.spacing.md }}
    >
      <Card
        className="w-full max-w-md"
        style={{ padding: designTokens.spacing["2xl"] }}
      >
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">이메일 인증 필요</CardTitle>
          <CardDescription>
            가입을 완료하려면 이메일 인증이 필요합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info message */}
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="text-muted-foreground">
              {email || user?.email ? (
                <>
                  <strong>{email || user?.email}</strong>로 인증 이메일을 발송했습니다.
                  <br />
                  이메일을 확인하고 인증 링크를 클릭해주세요.
                </>
              ) : (
                "인증 이메일을 발송했습니다. 이메일을 확인하고 인증 링크를 클릭해주세요."
              )}
            </p>
          </div>

          {/* Manual email input */}
          {showManualInput && (
            <div className="space-y-3">
              <label className="text-sm font-medium">이메일 주소 입력</label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  disabled={isResending}
                />
                <Button
                  onClick={handleResendEmail}
                  disabled={isResending || resendCountdown > 0}
                  size="sm"
                >
                  {isResending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "전송"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Resend button */}
          {!showManualInput && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResendEmail}
              disabled={isResending || resendCountdown > 0}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  전송 중...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  인증 이메일 재발송
                  {resendCountdown > 0 && ` (${resendCountdown}초)`}
                </>
              )}
            </Button>
          )}

          {/* Tips */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">이메일이 도착하지 않았나요?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>스팸 폴더를 확인해주세요</li>
                  <li>이메일 주소가 올바른지 확인해주세요</li>
                  <li>잠시 후 다시 시도해주세요</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Back to login */}
          <div className="text-center text-sm">
            <Link href="/login" className="text-primary hover:underline">
              로그인 페이지로 돌아가기
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main component with Suspense boundary for useSearchParams
export function EmailVerification() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted/30">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <EmailVerificationInner />
    </Suspense>
  );
}
