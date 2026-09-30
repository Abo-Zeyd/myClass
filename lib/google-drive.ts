export function getGoogleDriveFileId(value: string) {
  try {
    const url = new URL(value);
    if (url.hostname !== "drive.google.com" && url.hostname !== "www.drive.google.com") {
      return undefined;
    }

    return url.pathname.match(/^\/file\/d\/([^/]+)/)?.[1] ?? url.searchParams.get("id") ?? undefined;
  } catch {
    return undefined;
  }
}

export function getGoogleDriveImageUrl(value: string) {
  const fileId = getGoogleDriveFileId(value);
  return fileId
    ? `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}=w1600`
    : value;
}