import React, { useState, useRef } from "react";
import { Box, Button, Input, VStack, HStack, Text, Spinner, useToast } from "@chakra-ui/react";
import useImageUpload from "./hooks/useImageUpload";
import useMasking from "./hooks/useMasking";

const BACKEND_URL = "http://localhost:8000/inpaint"; // Update with your actual backend URL

const GenFill: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();

  const { image, handleImageUpload } = useImageUpload(canvasRef);
  const { startDrawing, stopDrawing, drawMask, clearMask } = useMasking(maskCanvasRef);

  const applyInpainting = async () => {
    if (!image || !prompt.trim()) {
      toast({ title: "Please upload an image and enter a prompt!", status: "warning", duration: 3000 });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      canvasRef.current?.toBlob((blob) => {
        if (blob) formData.append("image", blob, "image.png");
      }, "image/png");

      maskCanvasRef.current?.toBlob((blob) => {
        if (blob) formData.append("mask", blob, "mask.png");
      }, "image/png");

      formData.append("prompt", prompt);

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.image) {
        const img = new Image();
        img.src = "data:image/png;base64," + result.image;
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) ctx.drawImage(img, 0, 0);
      }
    } catch (error) {
      console.error("Error applying AI fill:", error);
      toast({ title: "Failed to apply AI fill", status: "error", duration: 3000 });
    }
    setLoading(false);
  };

  return (
    <VStack spacing={4} p={4} maxW="700px" mx="auto">
      <Text fontSize="2xl" fontWeight="bold">AI-Powered Generative Fill</Text>
      <Input type="file" accept="image/*" onChange={handleImageUpload} />

      {image && (
        <>
          <HStack spacing={4}>
            <canvas ref={canvasRef} className="border"></canvas>
            <canvas
              ref={maskCanvasRef}
              className="border"
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseMove={drawMask}
            ></canvas>
          </HStack>

          <Input
            placeholder="Describe the fill (e.g., 'A cute cat')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <HStack>
            <Button colorScheme="blue" onClick={applyInpainting} isDisabled={loading}>
              {loading ? <Spinner /> : "Apply AI Fill"}
            </Button>
            <Button colorScheme="gray" onClick={clearMask}>Clear Mask</Button>
          </HStack>
        </>
      )}
    </VStack>
  );
};

export default GenFill;