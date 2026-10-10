/**
 * استخراج معرّف الملف من رابط مشاركة Google Drive.
 */
export function getGoogleDriveFileId(value: string) {
  try {
    const url = new URL(value);
    if (url.hostname !== 'drive.google.com' && url.hostname !== 'www.drive.google.com') {
      return undefined;
    }

    return (
      url.pathname.match(/^\/file\/d\/([^/]+)/)?.[1] ?? url.searchParams.get('id') ?? undefined
    );
  } catch {
    return undefined;
  }
}

/**
 * رابط الصورة بأبعادها الطبيعية.
 *
 * لا نضيف معامل `=w1600` لأن ذلك يُجبر المتصفح على تحميل نسخة مقلّصة،
 * فيبدو النص مكبّراً عند العرض بالحجم الطبيعي. بدون ذلك المعامل تُخدم
 * الصورة بأبعادها الأصلية.
 */
export function getGoogleDriveImageUrl(value: string) {
  const fileId = getGoogleDriveFileId(value);
  return fileId ? `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}` : value;
}
