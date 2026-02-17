/**
 * SessionManager Component
 *
 * Displays and manages active user sessions.
 * Allows users to view and revoke their active sessions.
 */

"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import type { Session } from "@/stores/auth-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Laptop, Monitor, Smartphone, Globe, LogOut } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

// Get device icon based on device string
function getDeviceIcon(deviceInfo: string) {
  if (!deviceInfo) return <Globe className="h-5 w-5" />;

  const ua = deviceInfo.toLowerCase();
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
    return <Smartphone className="h-5 w-5" />;
  }
  if (ua.includes("tablet") || ua.includes("ipad")) {
    return <Monitor className="h-5 w-5" />;
  }
  return <Laptop className="h-5 w-5" />;
}

// Get device name from device string
function getDeviceName(deviceInfo: string): string {
  if (!deviceInfo) return "알 수 없는 기기";

  const ua = deviceInfo.toLowerCase();
  if (ua.includes("iphone")) return "iPhone";
  if (ua.includes("ipad")) return "iPad";
  if (ua.includes("android")) return "Android";
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("mac")) return "Mac";
  if (ua.includes("linux")) return "Linux";
  if (ua.includes("chrome")) return "Chrome";
  if (ua.includes("safari")) return "Safari";
  if (ua.includes("firefox")) return "Firefox";

  return "알 수 없는 기기";
}

// Get browser name from device string
function getBrowserName(deviceInfo: string): string {
  if (!deviceInfo) return "";

  const ua = deviceInfo.toLowerCase();
  if (ua.includes("chrome") && !ua.includes("edg")) return "Chrome";
  if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("edg")) return "Edge";
  if (ua.includes("opr") || ua.includes("opera")) return "Opera";

  return "";
}

interface SessionCardProps {
  session: Session;
  onRevoke: (sessionId: string) => void;
  isRevoking: boolean;
}

function SessionCard({ session, onRevoke, isRevoking }: SessionCardProps) {
  const deviceIcon = getDeviceIcon(session.device);
  const deviceName = getDeviceName(session.device);
  const browserName = getBrowserName(session.device);
  const lastActive = formatDistanceToNow(new Date(session.lastActive), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-primary/10 p-3 text-primary">
          {deviceIcon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{deviceName}</span>
            {browserName && (
              <span className="text-sm text-muted-foreground">{browserName}</span>
            )}
            {session.isCurrent && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                현재 세션
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <span>마지막 활동: {lastActive}</span>
            {session.ipAddress && <span>IP: {session.ipAddress}</span>}
          </div>
        </div>
      </div>
      {!session.isCurrent && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRevoke(session.id)}
          disabled={isRevoking}
        >
          {isRevoking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export function SessionManager() {
  const { getSessions, revokeSession, revokeAllSessions } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    setIsLoading(true);
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (error) {
      console.error("Failed to load sessions:", error);
      toast({
        variant: "destructive",
        title: "세션 로딩 실패",
        description: "활성 세션을 불러오지 못했습니다",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRevokeSession(sessionId: string) {
    setIsRevoking(sessionId);
    try {
      await revokeSession(sessionId);
      setSessions(sessions.filter((s) => s.id !== sessionId));
      toast({
        title: "세션 종료",
        description: "선택한 기기에서 로그아웃했습니다",
      });
    } catch (error) {
      console.error("Failed to revoke session:", error);
      toast({
        variant: "destructive",
        title: "세션 종료 실패",
        description: "세션을 종료하지 못했습니다",
      });
    } finally {
      setIsRevoking(null);
    }
  }

  async function handleRevokeAllSessions() {
    if (!confirm("정말로 모든 기기에서 로그아웃하시겠습니까?")) {
      return;
    }

    setIsRevokingAll(true);
    try {
      await revokeAllSessions();
      // Keep only current session
      setSessions(sessions.filter((s) => s.isCurrent));
      toast({
        title: "모든 세션 종료",
        description: "다른 모든 기기에서 로그아웃했습니다",
      });
    } catch (error) {
      console.error("Failed to revoke all sessions:", error);
      toast({
        variant: "destructive",
        title: "세션 종료 실패",
        description: "모든 세션을 종료하지 못했습니다",
      });
    } finally {
      setIsRevokingAll(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>활성 세션</CardTitle>
            <CardDescription>
              현재 로그인된 모든 기기와 세션을 관리하세요
            </CardDescription>
          </div>
          {sessions.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRevokeAllSessions}
              disabled={isRevokingAll}
            >
              {isRevokingAll ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                "모든 기기에서 로그아웃"
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            활성 세션이 없습니다
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onRevoke={handleRevokeSession}
                isRevoking={isRevoking === session.id}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
