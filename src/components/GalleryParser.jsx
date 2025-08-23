import React, { useState, useEffect } from "react";
import { Download, Image, ChevronLeft, ChevronRight } from "lucide-react";

const GalleryParser = ({ htmlContent, onImagesParsed }) => {
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Парсинг HTML и извлечение изображений
  useEffect(() => {
    if (!htmlContent) {
      setImages([]);
      if (onImagesParsed) onImagesParsed([]);
      return;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");
      
      // Ищем все изображения в галерее
      const imageElements = doc.querySelectorAll('img');
      const extractedImages = Array.from(imageElements).map(img => ({
        src: img.src,
        alt: img.alt || 'Изображение товара'
      }));

      // Фильтруем дубликаты и невалидные URL
      const uniqueImages = extractedImages.filter((image, index, self) =>
        index === self.findIndex(img => img.src === image.src) &&
        image.src && 
        !image.src.startsWith('data:') && // исключаем data URI
        image.src !== 'https://' // исключаем пустые src
      );

      setImages(uniqueImages);
      if (onImagesParsed) onImagesParsed(uniqueImages);
    } catch (error) {
      console.error('Ошибка при парсинге изображений:', error);
      setImages([]);
      if (onImagesParsed) onImagesParsed([]);
    }
  }, [htmlContent, onImagesParsed]);

  // Функция для скачивания изображения
  const downloadImage = async (imageUrl, imageName = 'image') => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      
      // Извлекаем имя файла из URL или используем timestamp
      const fileName = imageUrl.split('/').pop() || `${imageName}_${Date.now()}.jpg`;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при скачивании изображения:', error);
      alert('Не удалось скачать изображение');
    }
  };

  // Навигация по изображениям в модальном окне
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Обработчики клавиш для навигации
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showModal) return;
      
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setShowModal(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  if (images.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Image className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Изображения не найдены</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Image className="w-5 h-5 text-purple-500" />
          <span>Галерея изображений ({images.length})</span>
        </h3>
        <button
          onClick={() => {
            // Скачиваем все изображения
            images.forEach((img, index) => {
              setTimeout(() => downloadImage(img.src, `image_${index + 1}`), index * 300);
            });
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Скачать все</span>
        </button>
      </div>

      {/* Сетка изображений */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {images.map((image, index) => (
          <div
            key={index}
            className="group relative bg-white rounded-lg border overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-24 object-cover"
              onClick={() => {
                setCurrentImageIndex(index);
                setShowModal(true);
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = e.target.parentNode.querySelector('.image-fallback');
                if (fallback) {
                  fallback.style.display = 'flex';
                }
              }}
            />
            
            {/* Запасной вариант если изображение не загрузилось */}
            <div className="image-fallback hidden w-full h-24 bg-gray-100 items-center justify-center">
              <Image className="w-8 h-8 text-gray-400" />
            </div>

            {/* Кнопка скачивания на hover */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadImage(image.src, `image_${index + 1}`);
              }}
              className="absolute top-2 right-2 bg-white/90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              title="Скачать изображение"
            >
              <Download className="w-3 h-3 text-gray-700" />
            </button>
          </div>
        ))}
      </div>

      {/* Модальное окно для просмотра изображения */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
          >
            ✕
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 text-white bg-black/50 rounded-full p-3 hover:bg-black/70"
            disabled={images.length <= 1}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="relative max-w-4xl max-h-full">
            <img
              src={images[currentImageIndex].src}
              alt={images[currentImageIndex].alt}
              className="max-w-full max-h-[80vh] object-contain"
            />
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>

          <button
            onClick={nextImage}
            className="absolute right-4 text-white bg-black/50 rounded-full p-3 hover:bg-black/70"
            disabled={images.length <= 1}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <button
            onClick={() => downloadImage(images[currentImageIndex].src, `image_${currentImageIndex + 1}`)}
            className="absolute bottom-4 right-4 text-white bg-blue-600 rounded-full p-3 hover:bg-blue-700 flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default GalleryParser;