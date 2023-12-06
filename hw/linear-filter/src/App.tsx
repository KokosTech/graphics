import { useState } from 'react'

import InputCustomFilter from './components/inputCustomFilter'
import ImageContainer from './components/image'

import { Filter } from './types/Filter'
import InputImage from './components/inputImage'

import './styles/app.css'
import { applyFilter } from './utils/applyFilter'

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

  const onApply = (filter: Filter) => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context || !originalImage) return

    canvas.width = originalImage.width
    canvas.height = originalImage.height

    context.drawImage(originalImage, 0, 0)

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const filteredData = applyFilter(imageData, filter)

    context.putImageData(filteredData, 0, 0)

    const img = new Image()
    img.src = canvas.toDataURL()
    setCustomImage(img)
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
        </div>
        <InputCustomFilter
          onApply={onApply}
        />
      </div>
    </>
  )
}

export default App
