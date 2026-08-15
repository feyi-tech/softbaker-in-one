import { useState, RefObject } from "react";

export default function useImageUpload(canvasRef: RefObject<HTMLCanvasElement>) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) return;
      const img = new Image();
      img.onload = () => {
        setImage(img);
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) ctx.drawImage(img, 0, 0);
        }
      };
      img.src = e.target.result as string;
    };
    reader.readAsDataURL(file);
  };

  return { image, handleImageUpload };
}