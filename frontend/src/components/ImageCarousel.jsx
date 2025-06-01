import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../styles/components/imageCarousel.css';

const ImageCarousel = ({ images = [], spaceId }) => {
    // Asegurarse de que images es un array y tiene elementos válidos
    const validImages = Array.isArray(images) ? images.filter(img => img) : [];

    if (validImages.length === 0) {
        return (
            <div className="no-images-placeholder">
                No images available
            </div>
        );
    }

    const getImageUrl = (image) => {
        try {
            // Si es un objeto con URL, extraer el nombre del archivo de la URL
            if (image?.url) {
                if (image.url.startsWith('http')) {
                    return image.url;
                }
                return `http://localhost:5000${image.url}`;
            }
            
            // Si es una cadena, usar directamente como nombre de archivo
            if (typeof image === 'string') {
                return `http://localhost:5000/uploads/spaces/${spaceId}/gallery/${image}`;
            }

            // Si tiene filename u otros campos
            const filename = image?.filename || image?.name || 'default.jpg';
            return `http://localhost:5000/uploads/spaces/${spaceId}/gallery/${filename}`;
        } catch (error) {
            console.error('Error getting image URL:', error);
            return '/assets/defaultSpace.png';
        }
    };

    return (
        <div className="carousel-container">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                loop={validImages.length > 1}
                autoplay={validImages.length > 1 ? {
                    delay: 3000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true
                } : false}
                className="mySwiper"
            >
                {validImages.map((image, index) => {
                    const imageUrl = getImageUrl(image);
                    
                    return (
                        <SwiperSlide key={index}>
                            <div className="carousel-item">
                                <img
                                    src={imageUrl}
                                    alt={`Space view ${index + 1}`}
                                    className="carousel-image"
                                    onError={(e) => {
                                        console.error('Image failed to load:', {
                                            attemptedUrl: imageUrl,
                                            originalImage: image,
                                            spaceId
                                        });
                                        e.target.style.backgroundColor = '#f5f5f5';
                                        e.target.style.padding = '20px';
                                        e.target.src = '/assets/defaultSpace.png';
                                    }}
                                />
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
};

export default ImageCarousel; 