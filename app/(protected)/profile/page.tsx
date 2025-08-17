import { UserProfile } from "@/features/user-profile/user-profile"

export default function ProfilePage() {
  return (
    <div className="container flex flex-1 flex-col gap-4 p-4">
      <div className="bg-muted/50 rounded-xl p-4">
        <UserProfile />
      </div>
    </div>
  )
}
