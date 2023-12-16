import '../styles/image.css'

const ImageContainer = ({
    src,
    width,
    alt
}: {
    src: string,
    width: number,
    alt: string
}) => (
    <img className="image" src={src} width={width} alt={alt} />
)

export default ImageContainer;