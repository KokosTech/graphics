import React, { useState, useRef } from "react";
import Histogram from "./components/Histogram";

import { equalize } from "./utils/equalize";

function HistogramEqualization() {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [equalizedImage, setEqualizedImage] = useState<HTMLImageElement | null>(null);
  const [originalHistogram, setOriginalHistogram] = useState<number[]>([]);
  const [equalizedHistogram, setEqualizedHistogram] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);

        const { equalizedImage, hist } = histogramEqualization(img);

        setEqualizedImage(equalizedImage);
        setOriginalHistogram(hist.original);
        setEqualizedHistogram(hist.equalized);
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(selectedFile);
  };

  const calculateHistogram = (pixelArr: number[]): number[] => {
    const hist: number[] = new Array(256).fill(0);

    for (const pixel of pixelArr) {
      hist[pixel]++;
    }

    return hist;
  };

  const histogramEqualization = (img: HTMLImageElement) => {
    const canvas = canvasRef.current || document.createElement("canvas");
    const context = contextRef.current || canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;

    context?.drawImage(img, 0, 0);

    const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
    const pixelData = imageData?.data;

    if (!pixelData) {
      console.warn("Pixel data is undefined");
      return {
        equalizedImage: img,
        hist: { original: [], equalized: [] },
      };
    }

   const RpixelArr: number[] = [];
    const GpixelArr: number[] = [];
    const BpixelArr: number[] = [];

    for (let i = 0; i < pixelData.length; i += 4) {
      RpixelArr.push(pixelData[i]);
      GpixelArr.push(pixelData[i + 1]);
      BpixelArr.push(pixelData[i + 2]);
    }

    // Calculate histogram
    const Rhist = calculateHistogram(RpixelArr);
    const Ghist = calculateHistogram(GpixelArr);
    const Bhist = calculateHistogram(BpixelArr);

    // Equalize histogram
    const { pixelArr: RpixelArrEq, hist: RhistEq } = equalize(Rhist, RpixelArr);
    const { pixelArr: GpixelArrEq, hist: GhistEq } = equalize(Ghist, GpixelArr);
    const { pixelArr: BpixelArrEq, hist: BhistEq } = equalize(Bhist, BpixelArr);

    // Update image data with equalized values
    for (let i = 0; i < pixelData.length; i += 4) {
      pixelData[i] = RpixelArrEq[i / 4];
      pixelData[i + 1] = GpixelArrEq[i / 4];
      pixelData[i + 2] = BpixelArrEq[i / 4];
    }

    context?.putImageData(imageData, 0, 0);

    const equalizedImage = new Image();
    equalizedImage.src = canvas.toDataURL();

    // Calculate equalized histogram from equalizedImage
    const equalizedImageData = context?.getImageData(0, 0, canvas.width, canvas.height);
    const equalizedPixelData = equalizedImageData?.data;

    if (!equalizedPixelData) {
      console.warn("Pixel data is undefined");
      return {
        equalizedImage: img,
        hist: { original: [], equalized: [] },
      };
    }

    const RpixelArrEqArr: number[] = [];
    const GpixelArrEqArr: number[] = [];
    const BpixelArrEqArr: number[] = [];

    for (let i = 0; i < equalizedPixelData.length; i += 4) {
      RpixelArrEqArr.push(equalizedPixelData[i]);
      GpixelArrEqArr.push(equalizedPixelData[i + 1]);
      BpixelArrEqArr.push(equalizedPixelData[i + 2]);
    }

    // Calculate histogram
    const RhistEqArr = calculateHistogram(RpixelArrEqArr);
    const GhistEqArr = calculateHistogram(GpixelArrEqArr);
    const BhistEqArr = calculateHistogram(BpixelArrEqArr);

    return {
      equalizedImage,
      hist: {
        original: [...Rhist, ...Ghist, ...Bhist],
        equalized: [...RhistEqArr, ...GhistEqArr, ...BhistEqArr],
      },
    };
  };

  return (
    <div>
      <input type="file" onChange={handleImageChange} />

      {originalImage && (
        <div>
          <h2>Original Image</h2>
          <img src={originalImage.src} width={512} alt="Original Image" />
          <Histogram
            histograms={[
              originalHistogram.slice(0, 256),
              originalHistogram.slice(256, 512),
              originalHistogram.slice(512),
            ]}
            width={256}
            height={256}
          />
        </div>
      )}

      {equalizedImage && (
        <div>
          <h2>Equalized Image</h2>
          <img src={equalizedImage.src} width={512} alt="Equalized Image" />
          <Histogram
            histograms={[
              equalizedHistogram.slice(0, 256),
              equalizedHistogram.slice(256, 512),
              equalizedHistogram.slice(512),
            ]}
            width={256}
            height={256}
          />
        </div>
      )}
    </div>
  );
}

export default HistogramEqualization;
