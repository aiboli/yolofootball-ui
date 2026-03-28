export async function readJsonSafely(response) {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}

export function getApiMessage(data, fallbackMessage) {
  if (typeof data === "string" && data.trim().length > 0) {
    return data.trim();
  }

  if (data && typeof data === "object") {
    if (typeof data.message === "string" && data.message.trim().length > 0) {
      return data.message.trim();
    }

    if (typeof data.error === "string" && data.error.trim().length > 0) {
      return data.error.trim();
    }
  }

  return fallbackMessage;
}
