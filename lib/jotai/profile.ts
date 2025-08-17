import { atom } from "jotai"

export type Profile = {
  username: string | null
  fullName: string | null
  email: string | null
  avatarUrl: string | null
}

export const profileAtom = atom<Profile | null>(null)
