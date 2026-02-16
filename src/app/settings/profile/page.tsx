import { ProfileForm } from "@/components/settings/profile-form";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">프로필</h1>
        <p className="text-muted-foreground">사용자 정보를 관리하세요</p>
      </div>
      <ProfileForm />
    </div>
  );
}
