/** Largest side of an uploaded photo after resizing. Website heroes are shown up to ~1920px wide. */
const MAX_SIDE = 1920;
const QUALITY = 0.82;
export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

/**
 * Turns an uploaded file into a compressed JPEG data URL, so photos stay small
 * in browser storage. With the API in place, this becomes an upload to object storage.
 */
export async function fileToCompressedDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file (JPG, PNG or WebP).");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("That image is larger than 12 MB. Please choose a smaller one.");

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", QUALITY);
}

/** Photos that ship with the website, offered as a ready-made library. */
export const MEDIA_LIBRARY = [
  { src: "/media/driveo-journey-poster.jpg", label: "London at night, S-Class" },
  { src: "/media/london-thames-night.jpg", label: "Thames embankment" },
  { src: "/media/paris-hotel-evening.jpg", label: "Paris hotel, evening" },
  { src: "/media/fleet-business-2026.jpg", label: "E-Class (Business Class)" },
  { src: "/media/fleet-first-2026-front.jpg", label: "S-Class (First Class)" },
  { src: "/media/fleet-van-vle.jpg", label: "VLE (Business Van)" },
] as const;
