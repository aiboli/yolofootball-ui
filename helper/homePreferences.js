const STORAGE_KEY = "yolofootball-home-preferences";

const defaultPreferences = {
  favoriteTeams: [],
  favoriteLeagues: [],
};

const sanitizeArray = (value) =>
  Array.isArray(value)
    ? value.filter((item) => typeof item === "string" && item.trim().length > 0)
    : [];

export function getDefaultHomePreferences() {
  return {
    ...defaultPreferences,
  };
}

export function readHomePreferences() {
  if (typeof window === "undefined") {
    return getDefaultHomePreferences();
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return getDefaultHomePreferences();
    }

    const parsedValue = JSON.parse(rawValue);
    return {
      favoriteTeams: sanitizeArray(parsedValue?.favoriteTeams),
      favoriteLeagues: sanitizeArray(parsedValue?.favoriteLeagues),
    };
  } catch (error) {
    return getDefaultHomePreferences();
  }
}

export function saveHomePreferences(preferences) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedPreferences = {
    favoriteTeams: sanitizeArray(preferences?.favoriteTeams),
    favoriteLeagues: sanitizeArray(preferences?.favoriteLeagues),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedPreferences));
}

export function togglePreference(currentList = [], value) {
  if (!value) {
    return currentList;
  }

  return currentList.includes(value)
    ? currentList.filter((item) => item !== value)
    : [...currentList, value];
}
