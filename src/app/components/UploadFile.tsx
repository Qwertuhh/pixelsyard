"use client";

import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import { useRef, useState } from "react";
import { SessionProvider } from "next-auth/react";

const UploadFile = () => {
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const abortController = new AbortController();

  /*
   * Authenticates and retrieves the necessary upload credentials from the server.
   *
   * This function calls the authentication API endpoint to receive upload parameters like signature,
   * expire time, token, and publicKey.
   *
   * @returns {Promise<{signature: string, expire: string, token: string, publicKey: string}>} The authentication parameters.
   * @throws {Error} Throws an error if the authentication request fails.
   */

  const authenticator = async () => {
    try {
      const response = await fetch("/api/upload-auth");
      console.log("Authentication response:", response);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Request failed with status ${response.status}: ${errorText}`
        );
      }
      console.log("Authentication response:", response);
      // Parse and destructure the response JSON for upload credentials.
      const data = await response.json();
      const { signature, expire, token, publicKey } = data;
      return { signature, expire, token, publicKey };
    } catch (error) {
      // Log the original error for debugging before rethrowing a new error.
      console.error("Authentication error:", error);
      throw new Error("Authentication request failed");
    }
  };

  /*
   * Handles the file upload process.
   *
   * This function:
   * - Validates file selection.
   * - Retrieves upload authentication credentials.
   * - Initiates the file upload via the ImageKit SDK.
   * - Updates the upload progress.
   * - Catches and processes errors accordingly.
   */
  const handleUpload = async () => {
    // Access the file input element using the ref
    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      alert("Please select a file to upload");
      return;
    }

    
    //? Extract the first file from the file input
    const file = fileInput.files[0];
    //? Validate the file size and type
    const fileSizeLimit = 10 * 1024 * 1024; // 10MB
    const fileTypeLimit = ["image/jpeg", "image/png"];
    const fileTypeError = "Only JPEG and PNG files are supported";
    const fileTooLargeError = `File too large, must be less than ${fileSizeLimit / (1024 * 1024)}MB`;

    if (file.size > fileSizeLimit) {
      alert(fileTooLargeError);
      return;
    }

    if (!fileTypeLimit.includes(file.type)) {
      alert(fileTypeError);
      return;
    }

    // Retrieve authentication parameters for the upload.
    let authParams;
    try {
      authParams = await authenticator();
    } catch (authError) {
      console.error("Failed to authenticate for upload:", authError);
      return;
    }
    const { signature, expire, token, publicKey } = authParams;

    try {
      const uploadResponse = await upload({
        expire,
        token,
        signature,
        publicKey,
        file,
        fileName: file.name,
        onProgress: (event) => {
          setProgress((event.loaded / event.total) * 100);
        },
        abortSignal: abortController.signal,
      });
      console.log("Upload response:", uploadResponse);
    } catch (error) {
      if (error instanceof ImageKitAbortError) {
        console.error("Upload aborted:", error.reason);
      } else if (error instanceof ImageKitInvalidRequestError) {
        console.error("Invalid request:", error.message);
      } else if (error instanceof ImageKitUploadNetworkError) {
        console.error("Network error:", error.message);
      } else if (error instanceof ImageKitServerError) {
        console.error("Server error:", error.message);
      } else {
        console.error("Upload error:", error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <SessionProvider refetchInterval={4 * 5}>
        <input
          type="file"
          ref={fileInputRef}
          className="mb-4 block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100
            focus:outline-none focus:ring-2 focus:ring-violet-200
            dark:file:bg-violet-900 dark:file:text-violet-300
            dark:hover:file:bg-violet-800
            dark:focus-visible:ring-violet-500"
        />
        <button
          type="button"
          onClick={handleUpload}
          className="bg-violet-500 text-white font-bold py-2 px-4 rounded-full hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-200"
        >
          Upload file
        </button>
        <br />
        <progress
          value={progress}
          max={100}
          className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700"
        ></progress>
        <span className="text-xs font-light">
          Upload progress: {Math.round(progress)}%
        </span>
      </SessionProvider>
    </div>
  );
};

export default UploadFile;
