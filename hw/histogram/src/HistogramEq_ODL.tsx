import React, { useState, useEffect } from "react";
import Histogram from "./components/Histogram";

function HistogramEqualization() {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(
    null
  );
  const [equalizedImage, setEqualizedImage] = useState<HTMLImageElement | null>(
    null
  );
  const [originalHistogram, setOriginalHistogram] = useState<number[]>(
    new Array(256).fill(0)
  );
  const [equalizedHistogram, setEqualizedHistogram] = useState<number[]>(
    new Array(256).fill(0)
  );

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        setEqualizedHistogram(hist);
      };
      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(selectedFile);
  };

  const equalize = (
    subPixelArr: number[],
    subPixelHist: number[],
  ) => {
    const c0 = 0;
    const cmax = 255;

    const cn: number[] = new Array(256).fill(0);
    const p0 = 0;
    const pmax = subPixelArr.length;
    const hmid = pmax / (cmax + 1);
    let rver = 0;
    let hsum = 0;

    for (let c = c0; c <= cmax; c++) {
      const lc = rver;

      hsum += subPixelHist[c];

      while (hsum > hmid) {
        rver++;
        hsum -= hmid;
      }

      const rc = rver;

      cn[c] = (lc + rc) / 2;
    }

    const newSubPixelArr: number[] = [];

    for (let p = p0; p < pmax; p++) {
      newSubPixelArr[p] = cn[subPixelArr[p]];
    }

    console.log(newSubPixelArr);
    console.log(subPixelArr);

    // log the difference between the original and equalized image
    // for (let i = 0; i < subPixelArr.length; i++) {
    //   if(subPixelArr[i] !== newSubPixelArr[i]) {
    //     console.log(i, subPixelArr[i], newSubPixelArr[i]);
    //   }
    // }

    return { subPixelArr, subPixelHist };
  }

  const histogramEqualization = (img: HTMLImageElement) => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    
    const context = canvas.getContext("2d");
    context?.drawImage(img, 0, 0);

    const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
    const pixelData = imageData?.data;

    // Check if pixelData is defined before flattening the image data into an array
    if (!pixelData) {
      throw new Error("Pixel data is undefined");
    }

    const RpixelArr: number[] = [];
    const GpixelArr: number[] = [];
    const BpixelArr: number[] = [];
  
    for (let i = 0; i < pixelData.length; i += 4) {
      const RpixelValue = pixelData[i];
      RpixelArr.push(RpixelValue);

      const GpixelValue = pixelData[i + 1];
      GpixelArr.push(GpixelValue);

      const BpixelValue = pixelData[i + 2];
      BpixelArr.push(BpixelValue);
    }

    // Calculate histogram for each channel
    const Rhist: number[] = new Array(256).fill(0);
    const Ghist: number[] = new Array(256).fill(0);
    const Bhist: number[] = new Array(256).fill(0);

    for (let i = 0; i < RpixelArr.length; i++) {
      const RpixelValue = RpixelArr[i];
      Rhist[RpixelValue]++;

      const GpixelValue = GpixelArr[i];
      Ghist[GpixelValue]++;

      const BpixelValue = BpixelArr[i];
      Bhist[BpixelValue]++;
    }

    // Histogram equalization and create new image data
    const { subPixelArr: RsubPixelArr, subPixelHist: RsubPixelHist } = equalize(RpixelArr, Rhist);
    const { subPixelArr: GsubPixelArr, subPixelHist: GsubPixelHist } = equalize(GpixelArr, Ghist);
    const { subPixelArr: BsubPixelArr, subPixelHist: BsubPixelHist } = equalize(BpixelArr, Bhist);

    const newImageData = context?.createImageData(canvas.width, canvas.height);
    const newPixelData = newImageData?.data;

    // Check if newPixelData is defined before flattening the image data into an array
    if (!newPixelData) {
      throw new Error("New pixel data is undefined");
    }

    // Update image data with equalized values
    for (let i = 0; i < newPixelData.length; i += 4) {
      newPixelData[i] = RsubPixelArr[i / 4];
      newPixelData[i + 1] = GsubPixelArr[i / 4];
      newPixelData[i + 2] = BsubPixelArr[i / 4];
      newPixelData[i + 3] = 255;
    }

    // update the pixels in the canvas
    const nnewImageData = new ImageData(newPixelData, canvas.width, canvas.height);
    context?.putImageData(nnewImageData, 0, 0);

    // create new image with equalized values
    const equalizedImage = new Image();
    equalizedImage.src = canvas.toDataURL();


    return {
      equalizedImage,
      hist: RsubPixelHist,
    };
  };

  useEffect(() => {
    if (originalImage) {
      const originalCanvas = document.createElement("canvas");
      originalCanvas.width = originalImage.width;
      originalCanvas.height = originalImage.height;
      const originalContext = originalCanvas.getContext("2d");
      originalContext?.drawImage(originalImage, 0, 0);

      const originalImageData = originalContext?.getImageData(
        0,
        0,
        originalCanvas.width,
        originalCanvas.height
      );
      const originalPixelData = originalImageData?.data;

      if (originalPixelData) {
        const hist: number[] = new Array(256).fill(0);

        for (let i = 0; i < originalPixelData.length; i += 4) {
          const pixelValue = originalPixelData[i];
          hist[pixelValue]++;
        }

        setOriginalHistogram(hist);
      }
    }
  }, [originalImage]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          maxHeight: "100vh",
          overflow: "scroll",
          backgroundColor: "rgb(50, 50, 50)",
          padding: "2rem 1rem",
          borderRadius: "1rem",
        }}
      >
        <input type="file" onChange={handleImageChange} />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          maxHeight: "100vh",
          maxWidth: "100vw",
          overflow: "scroll",
          width: "100%",
          gap: "2rem",
        }}
      >
        {originalImage && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              maxHeight: "100vh",
              maxWidth: "100vw",
              overflow: "scroll",
              width: "100%",
              backgroundColor: "rgb(50, 50, 50)",
              padding: "1rem",
              borderRadius: "1rem",
              gap: "0.5rem",
            }}
          >
            <h2
              style={{
                margin: 0,
              }}
            >
              Original Image (Grayscale)
            </h2>
            <img
              src={originalImage.src}
              alt="Original Image"
              style={{
                maxWidth: "600px",
                maxHeight: "600px",
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: "1rem",
              }}
            />
            <Histogram hist={originalHistogram} width={256} height={256} />
          </div>
        )}
        {equalizedImage && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              maxHeight: "100vh",
              maxWidth: "100vw",
              overflow: "scroll",
              width: "100%",
              backgroundColor: "rgb(50, 50, 50)",
              padding: "1rem",
              borderRadius: "1rem",
              gap: "0.5rem",
            }}
          >
            <h2
              style={{
                margin: 0,
              }}
            >
              Equalized Image (Grayscale)
            </h2>
            <img
              src={equalizedImage.src}
              alt="Equalized Image"
              style={{
                maxWidth: "600px",
                maxHeight: "600px",
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: "1rem",
              }}
            />
            <Histogram hist={equalizedHistogram} width={256} height={256} />
          </div>
        )}
      </div>
    </div>
  );
}

export default HistogramEqualization;
