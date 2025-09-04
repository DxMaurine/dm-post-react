import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader

const ImageCarousel = ({ images }) => {
  if (!images || images.length === 0) {
    return null; // Or a placeholder if no images
  }

  return (
    <div className="w-full h-full min-h-[200px] flex items-center justify-center overflow-hidden">
      <Carousel 
        showArrows={false} 
        showStatus={false} 
        showIndicators={false} 
        showThumbs={false}
        infiniteLoop={true}
        autoPlay={true}
        interval={5000} // Change image every 5 seconds
        transitionTime={500}
        stopOnHover={false}
        className="w-full h-full"
      >
        {images.map((image, index) => (
          <div key={index} className="w-full h-full flex items-center justify-center">
            <img 
              src={image} 
              alt={`Promo Image ${index + 1}`} 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default ImageCarousel;