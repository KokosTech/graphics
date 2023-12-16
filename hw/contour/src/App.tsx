import { useState } from 'react'

import ImageContainer from './components/image'

import InputImage from './components/inputImage'
import './styles/app.css'

function App() {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement>()
  const [customImage, setCustomImage] = useState<HTMLImageElement>()

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
        setCustomImage(img);
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(selectedFile);
  };

  const onApply = () => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context || !originalImage) return

    canvas.width = originalImage.width
    canvas.height = originalImage.height

    context.drawImage(originalImage, 0, 0)

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const newData = getContourImage(imageData);

    if (!newData) return

    context.putImageData(newData, 0, 0)

    const img = new Image()
    img.src = canvas.toDataURL()
    setCustomImage(img)
  }

  const convertToGrayscale = (imageData: ImageData): ImageData => {
    const { data } = imageData
    const newData = new Uint8ClampedArray(data.length)

    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
      newData[i] = avg
      newData[i + 1] = avg
      newData[i + 2] = avg
      newData[i + 3] = data[i + 3]
    }

    return new ImageData(newData, imageData.width, imageData.height)
  }

  const thresholdBinary = (imageData: ImageData): number => {
    const { data } = imageData

    let sum = 0
    let count = 0
    let max = 0
    let min = 255

    for (let i = 0; i < data.length; i += 4) {
      const value = data[i]
      sum += value
      count += 1
      if (value > max) max = value
      if (value < min) min = value
    }

    const mean = sum / count
    const variance = data.reduce((acc, value) => acc + (value - mean) ** 2, 0) / count
    const standardDeviation = Math.sqrt(variance)
    const k = 0.2

    return mean + k * standardDeviation
  }

  const blackAndWhite = (imageData: ImageData, threshold: number): ImageData => {
    const { data } = imageData;
    const newData = new Uint8ClampedArray(data.length);

    for (let i = 0; i < data.length; i += 4) {
      const value = data[i]
      newData[i] = value > threshold ? 255 : 0
      newData[i + 1] = value > threshold ? 255 : 0
      newData[i + 2] = value > threshold ? 255 : 0
      newData[i + 3] = data[i + 3]
    }

    return new ImageData(newData, imageData.width, imageData.height)
  }

  // function comparePixels(p1: number[], p2: number[]): boolean {
  //   return p1[0] === p2[0] && p1[1] === p2[1];
  // }

  // function inBounds(y: number, x: number, width: number, height: number): boolean {
  //   return y >= 0 && y < height && x >= 0 && x < width;
  // }

  // function getDataIndex(x: number, y: number, width: number): number {
  //   return y * width + x;
  // }

  // // pavlidisAlgorithm
  // const getContours = (imageData: ImageData): number[][][] => {
  //   const { data, width, height } = imageData

  //   const contours: number[][][] = [];
  //   const visited: boolean[][] = [];

  //   for (let y = 0; y < height; y++) {
  //     visited.push([]);
  //     for (let x = 0; x < width; x++) {
  //       visited[y][x] = false;
  //     }
  //   }

  //   for (let y = 0; y < height; y++) {
  //     visited.push([]);
  //     for (let x = 0; x < width; x += 4) {
  //       const value = data[getDataIndex(x, y, width)];

  //       if (value !== 0 || (visited[y][x] !== undefined && visited[y][x])) {
  //         continue;
  //       }

  //       const start = [y, x];
  //       let current = [...start];
  //       const contour: number[][] = [start];

  //       visited[y][x] = true;

  //       const directions = [
  //         [[-1, 0], [-1, -1], [0, -1]],   // top
  //         [[0, -1], [1, -1], [1, 0]],      // left
  //         [[1, 0], [1, 1], [0, 1]],      // bottom
  //         [[0, 1], [-1, 1], [-1, 0]]    // right
  //       ];
  //       let direction = 0;

  //       do {
  //         const nextDirection = (direction + 1) % 4;
  //         const p1 = [current[0] + directions[nextDirection][0][0], current[1] + directions[nextDirection][0][1]];
  //         const p2 = [current[0] + directions[nextDirection][1][0], current[1] + directions[nextDirection][1][1]];
  //         const p3 = [current[0] + directions[nextDirection][2][0], current[1] + directions[nextDirection][2][1]];

  //         if (
  //           inBounds(p1[0], p1[1], width, height) &&
  //           data[getDataIndex(p1[1], p1[0], width)] === 0 &&
  //           !visited[p1[0]][p1[1]]
  //         ) {
  //           direction = nextDirection;
  //           current = p1;
  //         } else if (
  //           inBounds(p2[0], p2[1], width, height) &&
  //           data[getDataIndex(p2[1], p2[0], width)] === 0 &&
  //           !visited[p2[0]][p2[1]]
  //         ) {
  //           direction = nextDirection;
  //           current = p2;
  //         } else if (
  //           inBounds(p3[0], p3[1], width, height) &&
  //           data[getDataIndex(p3[1], p3[0], width)] === 0 &&
  //           !visited[p3[0]][p3[1]]
  //         ) {
  //           direction = nextDirection;
  //           current = p3;
  //         } else {
  //           direction = nextDirection;
  //         }

  //         if (!comparePixels(current, start) || (!comparePixels(contour[contour.length - 1], start) && contour.length === 1)) {
  //           contour.push(current);
  //           visited[current[0]][current[1]] = true;
  //         }
  //       } while (!comparePixels(current, start));

  //       contours.push(contour);
  //     }
  //   }
  //   return contours
  // }

  const inBounds = (shape: [number, number], pixel: [number, number]): boolean => {
    return 0 <= pixel[0] && pixel[0] < shape[0] && 0 <= pixel[1] && pixel[1] < shape[1];
  };

  const pavlidisAlgorithm = (imageData: ImageData): number[][][] => {
    const contours: number[][][] = [];
    const visited: Set<string> = new Set();

    const directions = [
      [[-1, -1], [-1, 0], [-1, 1]],
      [[-1, 1], [0, 1], [1, 1]],
      [[1, 1], [1, 0], [1, -1]],
      [[1, -1], [0, -1], [-1, -1]],
    ];

    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    for (let y = height - 1; y >= 0; y--) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        if (data[index] === 0 && !visited.has(`${y},${x}`)) {
          let validNeighbours = true;
          for (const neighbour of [[0 + y, -1 + x], [1 + y, 1 + x], [1 + y, -1 + x]]) {
            const neighbourIndex = (neighbour[0] * width + neighbour[1]) * 4;
            if (!inBounds([height, width], neighbour) || data[neighbourIndex] === 0) {
              validNeighbours = false;
              break;
            }
          }

          if (validNeighbours) {
            const start: [number, number] = [y, x];
            let current: [number, number] = start;
            const contour: [number, number][] = [current];
            visited.add(`${y},${x}`);
            let direction = 0;
            let rotation = 0;

            while (current[0] !== start[0] || current[1] !== start[1] || (contour[contour.length - 1][0] === start[0] && contour[contour.length - 1][1] === start[1] && contour.length === 1)) {
              const p1: [number, number] = [current[0] + directions[direction][0][0], current[1] + directions[direction][0][1]];
              const p2: [number, number] = [current[0] + directions[direction][1][0], current[1] + directions[direction][1][1]];
              const p3: [number, number] = [current[0] + directions[direction][2][0], current[1] + directions[direction][2][1]];

              const p1Index = (p1[0] * width + p1[1]) * 4;
              const p2Index = (p2[0] * width + p2[1]) * 4;
              const p3Index = (p3[0] * width + p3[1]) * 4;

              if (inBounds([height, width], p1) && data[p1Index] === 0 && !visited.has(`${p1[0]},${p1[1]}`)) {
                contour.push(p1);
                current = p1;
                visited.add(`${p1[0]},${p1[1]}`);
                rotation = 0;
                direction = (direction - 1 + 4) % 4;
              } else if (inBounds([height, width], p2) && data[p2Index] === 0 && !visited.has(`${p2[0]},${p2[1]}`)) {
                contour.push(p2);
                current = p2;
                visited.add(`${p2[0]},${p2[1]}`);
                rotation = 0;
              } else if (inBounds([height, width], p3) && data[p3Index] === 0 && !visited.has(`${p3[0]},${p3[1]}`)) {
                contour.push(p3);
                current = p3;
                visited.add(`${p3[0]},${p3[1]}`);
                rotation = 0;
              } else if (rotation < 3) {
                rotation += 1;
                direction = (direction + 1) % 4;
              } else {
                break;
              }
            }

            contours.push(contour);
          }
        }
      }
    }

    return contours;
  };


  const getContourImage = (imageData: ImageData): ImageData | null => {
    const grayscaleData = convertToGrayscale(imageData)
    const threshold = thresholdBinary(grayscaleData)
    const thresholdData = blackAndWhite(grayscaleData, threshold)
    console.log("Con prep")
    const contours = pavlidisAlgorithm(thresholdData)
    console.log("contours", contours)

    console.log("Contours", contours)
    const { width, height, data } = thresholdData

    // create a black image and draw contours on it
    const newData = new Uint8ClampedArray(data.length)

    for (let i = 0; i < data.length; i += 4) {
      newData[i] = 255
      newData[i + 1] = 255
      newData[i + 2] = 255
      newData[i + 3] = data[i + 3]
    }

    contours.forEach(contour => {
      contour.forEach(point => {
        const idx = (point.y * imageData.width + point.x) * 4;
        imageData.data[idx] = 0;
        imageData.data[idx + 1] = 0;
        imageData.data[idx + 2] = 0;
      });
    });

    return new ImageData(newData, width, height)
  }

  return (
    <>
      <h1>Custom Linear Image Filter</h1>
      <div className='app'>
        <div className='images-wrapper'>
          <div className='images'>
            <InputImage
              handleImageChange={handleImageChange}
            />
            {originalImage && (
              <div>
                <h2>Original Image</h2>
                <ImageContainer src={originalImage.src} width={512} alt="original image" />
              </div>
            )}
            {customImage && (
              <div>
                <h2>Processed Image</h2>
                <ImageContainer src={customImage.src} width={512} alt="Equalized Image" />
              </div>
            )}
          </div>
          <button
            className='apply-button'
            onClick={onApply}
          >
            Apply
          </button>
        </div>
      </div>
    </>
  )
}

export default App
