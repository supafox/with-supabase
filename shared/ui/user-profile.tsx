"use client"

import Image from "next/image"
import { useAtomValue } from "jotai"

import { profileAtom } from "@/lib/jotai/profile"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function UserAvatar({ className }: { className?: string }) {
  const profile = useAtomValue(profileAtom)

  const name = profile?.fullName || profile?.email || ""
  const url = profile?.avatarUrl

  const initials =
    (profile?.fullName || profile?.email || "")
      .trim()
      .split(/\s+/)
      .map((p) => p[0]?.toUpperCase())
      .join("")
      .slice(0, 2) || "U"

  return (
    <Avatar className={cn(className)}>
      {url && <AvatarImage src={url} alt={name} className="size-full" />}
      <AvatarFallback>
        <Image
          src={`https://avatar.vercel.sh/${initials}?rounded=60`}
          alt={name}
          width={32}
          height={32}
          className="size-full"
        />
      </AvatarFallback>
    </Avatar>
  )
}

export function UserEmail() {
  const profile = useAtomValue(profileAtom)

  return <>{profile?.email}</>
}

export function UserName() {
  const profile = useAtomValue(profileAtom)

  return <>{profile?.fullName || profile?.email}</>
}

export function UserDisplayName() {
  const profile = useAtomValue(profileAtom)

  return <>{profile?.username}</>
}
