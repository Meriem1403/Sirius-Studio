import type { UserProfile } from '../lib/auth/types'

export const FIXTURE_PROFILES: UserProfile[] = [
  {
    userId: 'fixture-client-1',
    phone: '+33 6 12 34 56 78',
    notificationPrefs: {
      email: true,
      sms: true,
      mockupReady: true,
      messages: true,
      quotes: true,
      statusUpdates: true,
    },
  },
  {
    userId: 'fixture-client-2',
    phone: '+33 6 98 76 54 32',
    notificationPrefs: {
      email: true,
      sms: true,
      mockupReady: true,
      messages: true,
      quotes: true,
      statusUpdates: true,
    },
  },
  {
    userId: 'fixture-admin-1',
    phone: '+33 6 11 22 33 44',
    notificationPrefs: {
      email: true,
      sms: false,
      mockupReady: true,
      messages: true,
      quotes: true,
      statusUpdates: true,
    },
  },
]

export function getDefaultPhone(userId: string) {
  return FIXTURE_PROFILES.find((p) => p.userId === userId)?.phone
}
