export interface PlayerProfile {
  id: string;
  displayName: string;
  avatar: string; // emoji
  wins: number;
  losses: number;
  gamesPlayed: number;
  createdAt: string;
}

export const AVATAR_OPTIONS: string[] = [
  '🧔‍♂️', '👳‍♂️', '👴', '👵', '👨‍🦱', '🧕', '👩‍🦰', '🧑‍🦳', '🧑‍💼', '👨‍🎓',
  '👨‍🍳', '🧑‍🔧', '👷‍♂️', '🕵️‍♂️', '🧙‍♂️', '🦸‍♂️', '👮‍♂️', '🤵‍♂️', '🧑‍🚀', '🥷'
];

const STORAGE_KEY = 'iraqi_domino_profile';

export function getProfile(): PlayerProfile | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data) as PlayerProfile;
    if (parsed && typeof parsed === 'object' && parsed.id) {
      return parsed;
    }
    return null;
  } catch (error) {
    console.error('Failed to parse player profile from localStorage:', error);
    return null;
  }
}

export function saveProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save player profile to localStorage:', error);
  }
}

export function createProfile(displayName: string, avatar: string): PlayerProfile {
  const profile: PlayerProfile = {
    id: crypto.randomUUID(),
    displayName: displayName.trim() || 'لاعب',
    avatar: avatar || AVATAR_OPTIONS[0],
    wins: 0,
    losses: 0,
    gamesPlayed: 0,
    createdAt: new Date().toISOString(),
  };

  saveProfile(profile);
  return profile;
}

export function updateStats(won: boolean): void {
  const profile = getProfile();
  if (!profile) return;

  const updatedProfile: PlayerProfile = {
    ...profile,
    gamesPlayed: (profile.gamesPlayed || 0) + 1,
    wins: won ? (profile.wins || 0) + 1 : (profile.wins || 0),
    losses: !won ? (profile.losses || 0) + 1 : (profile.losses || 0),
  };

  saveProfile(updatedProfile);
}

export function hasProfile(): boolean {
  return getProfile() !== null;
}
