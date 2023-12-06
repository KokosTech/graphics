export const calculateHistogram = (pixelArr: number[]): number[] => {
  const hist: number[] = new Array(256).fill(0);

  for (const pixel of pixelArr) {
    hist[pixel]++;
  }

  return hist;
};

export const getPixelArrayFromImage = (
  image: ImageData
): {
  RpixelArr: number[];
  GpixelArr: number[];
  BpixelArr: number[];
} => {
  const pixelData = image?.data;

  if (!pixelData) {
    throw new Error("No pixel data");
  }

  const RpixelArr: number[] = [];
  const GpixelArr: number[] = [];
  const BpixelArr: number[] = [];

  for (let i = 0; i < pixelData.length; i += 4) {
    RpixelArr.push(pixelData[i]);
    GpixelArr.push(pixelData[i + 1]);
    BpixelArr.push(pixelData[i + 2]);
  }

  return {
    RpixelArr,
    GpixelArr,
    BpixelArr,
  };
};

export const getHistogramFromImage = (
  image: ImageData
): {
  Rhist: number[];
  Ghist: number[];
  Bhist: number[];
} => {
  // Get pixel array from image
  const { RpixelArr, GpixelArr, BpixelArr } = getPixelArrayFromImage(image);

  // Calculate and return histogram
  return {
    Rhist: calculateHistogram(RpixelArr),
    Ghist: calculateHistogram(GpixelArr),
    Bhist: calculateHistogram(BpixelArr),
  };
};
