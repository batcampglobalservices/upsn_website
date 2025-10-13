import React, { useState, useEffect } from "react";
import img_1 from "../assets/img/img1.jpg";
import img_2 from "../assets/img/img2.jpg";
import img_3 from "../assets/img/img3.jpg";
import img_4 from "../assets/img/img4.jpg";
import AOS from "aos";
import "aos/dist/aos.css";

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);

  const texts = [
    "Freedom Within, Control",
    "Knowledge is Power",
    "Discipline Builds Leaders",
  ];

  const slides = [
    { src: img_1, alt: "Slide 1" },
    { src: img_2, alt: "Slide 2" },
    { src: img_3, alt: "Slide 3" },
    { src: img_4, alt: "Slide 4" },
  ];

  // Auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  // Typewriter Effect (Looping through phrases)
  useEffect(() => {
    const i = loopNum % texts.length;
    const fullText = texts[i];

    const handleTyping = () => {
      if (isDeleting) {
        setTypedText(fullText.substring(0, typedText.length - 1));
        setTypingSpeed(50);
      } else {
        setTypedText(fullText.substring(0, typedText.length + 1));
        setTypingSpeed(100);
      }

      if (!isDeleting && typedText === fullText) {
        setTimeout(() => setIsDeleting(true), 1000); // pause before deleting
      } else if (isDeleting && typedText === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [typedText, isDeleting]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => setCurrentSlide(index);

  return (
    <div className="relative w-full h-[60vh] sm:h-[75vh] md:h-[100vh] overflow-hidden">
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-in-out z-10"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <img
              src={slide.src}
              alt={slide.alt}
              className="w-full h-[60vh] sm:h-[75vh] md:h-[100vh] object-cover"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/1920x1080?text=Image+Not+Found";
              }}
            />
          </div>
        ))}
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center px-4 z-20">
        <h1
          data-aos="fade-up"
          className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-6 max-w-3xl leading-tight font-[monospace]"
        >
          {typedText}
          <span className="border-r-4 border-white animate-pulse ml-1"></span>
        </h1>

        <button
          data-aos="fade-up"
          data-aos-delay="200"
          className="px-5 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg text-white font-semibold border-2 border-white rounded-2xl hover:bg-white hover:text-black transition-all duration-500"
        >
          Get Started
        </button>
      </div>

      {/* Prev Button */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 sm:p-3 rounded-full transition-all z-30"
      >
        <svg
          className="w-4 h-4 sm:w-6 sm:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next Button */}
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-2 sm:right-4 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 sm:p-3 rounded-full transition-all z-30"
      >
        <svg
          className="w-4 h-4 sm:w-6 sm:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 sm:space-x-3 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
              currentSlide === index
                ? "bg-white"
                : "bg-gray-400 hover:bg-gray-300"
            } transition-all`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
