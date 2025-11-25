import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../styles/components/imageCarousel.css';

const ImageCarousel = ({ images = [], spaceId }) => {
    // Ensure 'images' is a valid array and filter out empty entries
    const validImages = Array.isArray(images) ? images.filter(img => img) : [];

    // If there are no valid images, display a placeholder
    if (validImages.length === 0) {
        return (
            <div className="no-images-placeholder">
                No images available
            </div>
        );
    }

    // Helper function to generate the full image URL
    const getImageUrl = (image) => {
        try {
            // If it's an object with a 'url' field
            if (image?.url) {
                // Use full external URL if available
                if (image.url.startsWith('http')) {
                    return image.url;
                }
                // Otherwise prepend backend base URL
                return `${image.url}`;
            }

            // If it's a string, treat it as a filename
            if (typeof image === 'string') {
                return `/uploads/spaces/${spaceId}/gallery/${image}`;
            }

            // Try to use other possible filename fields
            const filename = image?.filename || image?.name || 'default.jpg';
            return `/uploads/spaces/${spaceId}/gallery/${filename}`;
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
                                        // Display a default image and basic styling on error
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

