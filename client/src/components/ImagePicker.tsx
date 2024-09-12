import { Button } from "@mui/material";
import { useState } from "react";
import ImageUploading, { ImageListType } from "react-images-uploading";
import imageCompression from "browser-image-compression";

interface ImagePickerProps {
  image: string | undefined;
  onChangeImage: (image: string | undefined) => void;
  buttonTitle: string;
}

async function compressAndConvertToBase64(file: File): Promise<string> {
  const options = {
    maxSizeMB: 0.5, // Max size in MB
    maxWidthOrHeight: 800, // Max width or height
    useWebWorker: true, // Use web worker for faster compression (optional)
  };

  try {
    const compressedFile = await imageCompression(file, options);
    const reader = new FileReader();
    reader.readAsDataURL(compressedFile);
    return new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert image to base64."));
        }
      };
      reader.onerror = () => {
        reject(new Error("Failed to read image file."));
      };
    });
  } catch (error) {
    console.error("Error compressing image:", error);
    throw error;
  }
}

function ImagePicker(props: ImagePickerProps) {
  const { image, onChangeImage, buttonTitle } = props;

  const maxNumber = 1;
  const acceptType = ["jpg", "jpeg"];

  const handleImageUpload = async (imageList: ImageListType) => {
    if (imageList && imageList.length > 0) {
      const base64Image = await compressAndConvertToBase64(
        imageList[0].file as File
      );
      onChangeImage(base64Image);
    } else {
      onChangeImage(undefined);
    }
  };

  return (
    <ImageUploading
      onChange={handleImageUpload}
      maxNumber={maxNumber}
      acceptType={acceptType}
      dataURLKey="data_url"
      value={[]}
    >
      {({ onImageUpload, isDragging, dragProps }) => (
        <div onClick={onImageUpload} {...dragProps} style={{ width: "100%", height: "auto", cursor: "pointer" }}>
          {image ? (
            <img src={image} style={{ width: "100%", height: "auto", cursor: "pointer" }} alt="uploaded"/>
          ) : (
            <div>
              <Button variant="contained" color="primary">
                {buttonTitle}
              </Button>
              {isDragging && <div>Drop here</div>}
            </div>
          )}
        </div>
      )}
    </ImageUploading>
  );
}

export default ImagePicker;
