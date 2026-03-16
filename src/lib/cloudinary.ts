// ─── src/lib/cloudinary.ts ───────────────────────────────────────────────────
// No npm package needed — uses the unsigned upload REST API directly

const CLOUD_NAME  = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET; // unsigned preset

export type CloudinaryResult = {
  secure_url: string;
  public_id:  string;
  width:      number;
  height:     number;
  format:     string;
  bytes:      number;
};

export async function uploadToCloudinary(
  file: File,
  folder = "zynhive/portfolio",
  onProgress?: (pct: number) => void,
): Promise<CloudinaryResult> {
  const formData = new FormData();
  formData.append("file",           file);
  formData.append("upload_preset",  UPLOAD_PRESET);
  formData.append("folder",         folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText) as CloudinaryResult);
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    });

    xhr.addEventListener("error",  () => reject(new Error("Network error during upload")));
    xhr.addEventListener("abort",  () => reject(new Error("Upload aborted")));

    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
    xhr.send(formData);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  // Unsigned deletion is not supported by Cloudinary — call your own backend/serverless fn
  // Or use the Cloudinary Admin API from a cloud function
  console.warn("Deletion must go through a signed server endpoint. publicId:", publicId);
}

export function getCloudinaryThumb(url: string, w = 800, h = 600): string {
  // Insert Cloudinary transformation into the URL
  return url.replace("/upload/", `/upload/w_${w},h_${h},c_fill,q_auto,f_auto/`);
}