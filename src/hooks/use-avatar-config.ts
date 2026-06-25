import { useCallback, useSyncExternalStore } from 'react';

import { DEFAULT_AVATAR } from '../_mock';
import type { AvatarConfig } from '../types';

const STORAGE_KEY = 'personal-avatar-assistant.avatar-config';

let cachedAvatar: AvatarConfig | null = null;
const listeners = new Set<() => void>();

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normaliseAvatarConfig(value: unknown): AvatarConfig {
  const input =
    value && typeof value === 'object' ? (value as Partial<AvatarConfig>) : {};

  return {
    name: typeof input.name === 'string' ? input.name : DEFAULT_AVATAR.name,
    gender:
      input.gender === 'female' ||
      input.gender === 'male' ||
      input.gender === 'nonbinary' ||
      input.gender === 'unspecified'
        ? input.gender
        : DEFAULT_AVATAR.gender,
    appearanceId:
      typeof input.appearanceId === 'string'
        ? input.appearanceId
        : DEFAULT_AVATAR.appearanceId,
    voiceId:
      typeof input.voiceId === 'string' ? input.voiceId : DEFAULT_AVATAR.voiceId,
    personalityTone:
      input.personalityTone === 'friendly' ||
      input.personalityTone === 'professional' ||
      input.personalityTone === 'playful'
        ? input.personalityTone
        : DEFAULT_AVATAR.personalityTone,
  };
}

function readAvatarConfig(): AvatarConfig {
  if (!canUseStorage()) return DEFAULT_AVATAR;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_AVATAR;

  try {
    return normaliseAvatarConfig(JSON.parse(raw));
  } catch {
    return DEFAULT_AVATAR;
  }
}

function getSnapshot() {
  cachedAvatar ??= readAvatarConfig();
  return cachedAvatar;
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

function writeAvatarConfig(nextAvatar: AvatarConfig) {
  cachedAvatar = nextAvatar;
  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAvatar));
  }
  emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cachedAvatar = readAvatarConfig();
    listener();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }

  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

export function updateAvatarConfig(patch: Partial<AvatarConfig>) {
  const nextAvatar = normaliseAvatarConfig({ ...getSnapshot(), ...patch });
  writeAvatarConfig(nextAvatar);
  return nextAvatar;
}

export function resetAvatarConfig() {
  cachedAvatar = DEFAULT_AVATAR;
  if (canUseStorage()) {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  emitChange();
}

export function useAvatarConfig() {
  const avatar = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_AVATAR);
  const updateAvatar = useCallback((patch: Partial<AvatarConfig>) => {
    updateAvatarConfig(patch);
  }, []);
  const resetAvatar = useCallback(() => resetAvatarConfig(), []);

  return { avatar, updateAvatar, resetAvatar };
}
