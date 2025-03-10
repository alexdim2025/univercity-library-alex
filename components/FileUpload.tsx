"use client";

import { toast } from "sonner";
import {
  IKImage,
  ImageKitProvider,
  IKUpload
} from "imagekitio-next";
import config from "@/lib/config";
import ImageKit from "imagekit";
import { useState, useRef } from "react";
import Image from "next/image";

const { env: { imagekit: { publicKey, urlEndpoint } } } = config;
 
const authenticator = async () => { 
  try {
    const response = await fetch(`${config.env.apiEndpoint}/api/auth/imagekit`);

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(`Request failed with status: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    const { signature, expire, token } = data;

    return { signature, expire, token };

  } catch (error: any) { // can be type of any, because we don't know how it looks like.
    throw new Error(`Authentication request failed ${error.message}`);
  }
}

const FileUpload = ({
  onFileChange
}: {
  onFileChange: (filePath: string) => void
}) => {

  const ikUploadRef = useRef(null);
  const [file, setFile] = useState<{ filePath: string } | null>(null);

  const onError = (error: any) => { 
    console.log(error);

    toast("File upload failed", {
      description: `Your file could not be uploaded. Please try again.`,
      variant: "destructive",
    });
  }
  const onSuccess = (res: any) => {
    setFile(res);
    onFileChange(res.filePath);

    toast("File uploaded successfully", {
      description: `${res.filePath} has been uploaded successfully!`,
    });
  }

  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >

      <IKUpload
        className="hidden"
        ref={ikUploadRef}
        onError={onError}
        onSuccess={onSuccess}
        fileName="test-upload.png"
      />

      <button
        className="upload-btn"
        onClick={(e) => { 
          e.preventDefault();

          if (ikUploadRef.current) { 
            // @ts-ignore
            ikUploadRef.current?.click();
            // it is like we click this component IKUpload, but rather click nice looking button
          }
        }}
      >
        <Image
          src="/icons/upload.svg"
          alt="upload-icon"
          width={20}
          height={20}
          className="object-contain"
        />
        <p className="text-base text-light-100">Upload a File</p>

        {file && <p className="upload-filename" >{file.filePath}</p>}
      </button>

      {file && (
        <IKImage
          alt={file.filePath}
          path={file.filePath}
          width={500}
          height={300}
        />
      )}
      
    </ImageKitProvider>
  )
}

export default FileUpload