import defaultImg from '../assets/defaultProfile.png';
import { useState } from 'react';

const Avatar = ({ src, size = 80 }) => {
    // State to hold the current image source, defaulting to provided src or fallback image
    const [imgSrc, setImgSrc] = useState(src || defaultImg);

    // Handler to update the image source to default image if loading the original fails
    const handleError = () => {
        setImgSrc(defaultImg);
    };

    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid #ccc',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f0f0f0',
            }}
        >
            <img
                src={imgSrc}
                alt="Avatar"
                onError={handleError} // Calls handleError on image load failure
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
            />
        </div>
    );
};

export default Avatar;
