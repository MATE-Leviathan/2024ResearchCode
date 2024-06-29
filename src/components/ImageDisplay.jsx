// src/components/ImageDisplay.js
import React, { useEffect } from 'react';

const ImageDisplay = ({ imageArray }) => {
  useEffect(() => {
    const loadOpenCV = () => {
      if (window.cv) {
        onOpenCVReady();
      } else {
        const script = document.createElement('script');
        script.async = true;
        script.src = '%PUBLIC_URL%/opencv.js';
        script.onload = onOpenCVReady;
        document.body.appendChild(script);
      }
    };

    const onOpenCVReady = () => {
      console.log('OpenCV.js is ready');

      // Check if imageArray is defined and structured correctly
      if (!imageArray || !Array.isArray(imageArray)) {
        console.error('Invalid image array');
        return;
      }

      // Convert the array to Uint8Array
      const flatArray = imageArray.flat();
      const uint8Array = new Uint8Array(flatArray);

      // Decode the image using OpenCV.js
      const imgMat = window.cv.imdecode(uint8Array, window.cv.IMREAD_COLOR);

      if (imgMat.empty()) {
        console.error('Failed to decode the image');
        return;
      }

      // Display the image on a canvas
      const canvas = document.getElementById('canvasOutput');
      window.cv.imshow(canvas, imgMat);
      imgMat.delete();
    };

    loadOpenCV();
  }, [imageArray]);

  return (
    <div>
      <canvas id="canvasOutput"></canvas>
    </div>
  );
};

export default ImageDisplay;