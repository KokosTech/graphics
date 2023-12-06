import '../styles/inputImage.css'

const InputImage = ({
    handleImageChange,
}: {
    handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}) => (
    <input className="inputImage" type="file" onChange={handleImageChange} />
)

export default InputImage