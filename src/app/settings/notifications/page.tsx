import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";
import { NotificationSettings } from "~/components/notification/notification-settings";

export default async function NotificationSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">알림 설정</h1>
        <p className="text-muted-foreground">
          알림 수신 채널, 카테고리, 빈도를 설정하세요
        </p>
      </div>

      <NotificationSettings />
    </div>
  );
}
