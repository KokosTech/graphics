import { Filter } from "../types/Filter"

export const applyFilter = (imageData: ImageData, filter: Filter) => {
  const { matrix, scale, offset } = filter

  const { width, height, data } = imageData

  const filteredData = new Uint8ClampedArray(width * height * 4)

  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % width
    const y = Math.floor(i / 4 / width)

    let red = 0
    let green = 0
    let blue = 0

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const rowIndex = y + row - 2
        const colIndex = x + col - 2

        if (rowIndex < 0 || rowIndex >= height || colIndex < 0 || colIndex >= width) {
          continue
        }

        const index = (rowIndex * width + colIndex) * 4

        red += data[index] * matrix[row * 5 + col]
        green += data[index + 1] * matrix[row * 5 + col]
        blue += data[index + 2] * matrix[row * 5 + col]
      }
    }


    filteredData[i] = (red / scale) + offset
    filteredData[i + 1] = (green / scale) + offset
    filteredData[i + 2] = (blue / scale) + offset
    filteredData[i + 3] = data[i + 3] // so we can preserve transparency 
  }

  return new ImageData(filteredData, width, height)
}