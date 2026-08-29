import axios from 'axios';
import { User } from 'firebase/auth';
import { FIREBASE_FUNCTION_API_BASE_URL } from '../app-config';
import { normalizeMimeType } from './r2';

// Define interfaces for file object and upload result
export interface FileObject {
  id: string;
  file: File;
  dir?: string;
  fileName?: string;
  onFileName?: (nameOnly: string, ext: string) => string
}

export interface UploadResult {
  id: string;
  url: string;
  error?: string;
}

// Helper function to extract name and extension from file name
export function getNameExt(fileName: string): { name: string, ext: string } {
    const parts = fileName.split('.');
    const ext = parts.length > 1 ? parts.pop() || '' : '';
    return { name: parts.join('.'), ext };
}

/**
 * Sleeps for a specified number of milliseconds.
 * @param ms - The number of milliseconds to sleep.
 * @returns A promise that resolves after the specified time.
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Function to upload files to R2
export const uploadFilesToR2 = async (user: User, files: FileObject[], baseUrl: string, sleepMilli = 0): Promise<UploadResult[]> => {
  const uploadResults: UploadResult[] = [];

  for (const fileObj of files) {
    const { id, file, fileName, dir, onFileName } = fileObj;
    if(!file) {
      uploadResults.push({ id, url: '', });
      continue
    }
    const { name, ext } = getNameExt(file.name);
    const nameOfFile = onFileName ? onFileName(name, ext) : fileName || file.name;
    const fileType = normalizeMimeType(file.type);

    try {
      // Request presigned URL from backend
      const authToken = await user.getIdToken();
      const response = await axios.post(`${FIREBASE_FUNCTION_API_BASE_URL}/get-presigned-url`, {
        id,
        fileName: nameOfFile,
        fileType,
        dir,
      }, {
        headers: {
          Authorization: authToken
        },
      });

      const { presignedUrl } = response.data;

      console.log("imagesUploadResults.presignedUrl", presignedUrl)

      // Upload file to presigned URL
      const uploadResponse = await axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': fileType,
        },
      });

      if (uploadResponse.status === 200) {
        const formattedUrl = !baseUrl
          ? presignedUrl.split('?')[0]
          : `${baseUrl}${baseUrl.endsWith("/") ? "" : "/"}${dir || ""}${(dir || "").endsWith("/") ? "" : "/"}${nameOfFile}`;

        uploadResults.push({ id, url: formattedUrl });
      } else {
        uploadResults.push({ id, url: '', error: 'Upload failed' });
      }
    } catch (error: any) {
      //console.log("parsedSvg: error", id, error)
      uploadResults.push({ id, url: '', error: error.message });
    }

    // Sleep before the next request
    await sleep(sleepMilli);
  }

  return uploadResults;
};

/*
// Example usage with proper type annotations
document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  const uploadButton = document.getElementById('uploadButton');
  const resultsContainer = document.getElementById('results');

  uploadButton?.addEventListener('click', async () => {
    const files: FileObject[] = Array.from(fileInput.files || []).map((file, index) => ({
      id: `${index}-${file.name}`,
      file,
      fileName: `${generateRandomId(5)}-${getNameExt(file.name).name.toLowerCase()}.${getNameExt(file.name).ext}`,
      dir: "path/to/test",
    }));

    const uploadResults = await uploadFilesToR2(files, "http://r2.softbaker.com/");

    if (resultsContainer) {
      resultsContainer.innerHTML = ''; // Clear previous results

      uploadResults.forEach((result) => {
        const resultElement = document.createElement('div');
        if (result.error) {
          resultElement.textContent = `Error uploading ${result.id}: ${result.error}`;
        } else {
          resultElement.innerHTML = `Uploaded ${result.id} successfully. URL: <a href="${result.url}" target="_blank">${result.url}</a>`;
        }
        resultsContainer.appendChild(resultElement);
      });
    }
  });
});
*/
