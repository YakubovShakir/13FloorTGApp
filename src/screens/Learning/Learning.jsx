import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import "./FullscreenSlider.css"
import Assets from "../../assets"
import { useSettingsProvider } from "../../hooks"

const translations = {
    slideOne: {
      ru: "Добро пожаловать в приложение",
      en: "Welcome to the app",
    },
    slideTwo: {
      ru: "Создавайте и делитесь моментами",
      en: "Create and share moments",
    },
    slideThree: {
      ru: "Присоединяйтесь к сообществу",
      en: "Join the community",
    },
    slideFour: {
      ru: "Начните своё путешествие",
      en: "Start your journey",
    },
}

const Learning = () => {
  const { slideIndex = "0" } = useParams()
  const [currentSlide, setCurrentSlide] = useState(parseInt(slideIndex))
  const navigate = useNavigate()

  const { lang } = useSettingsProvider()

  const slides = [
    {
      image: Assets.BG.learn1,
      text: translations.slideOne[lang],
      redirect: true,
    },
    {
      image: Assets.BG.learn2,
      text: translations.slideTwo[lang],
    },
    {
      image: Assets.BG.learn3,
      text: translations.slideThree[lang],
    },
    {
      image: Assets.BG.learn4,
      text: translations.slideFour[lang],
    },
  ]

  useEffect(() => {
    setCurrentSlide(parseInt(slideIndex))
  }, [slideIndex])

  const handleSlideClick = () => {
    if (currentSlide === 0 && slides[0].redirect) {
      navigate("/personage-create")
      return
    }

    if (currentSlide < slides.length - 1) {
      navigate(`/learning/${currentSlide + 1}`)
    } else {
      navigate(`/`)
    }
  }

  return (
    <div className="slider-container">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`slide ${index === currentSlide ? "active" : ""}`}
          onClick={handleSlideClick}
        >
          <div
            className="slide-background"
            style={{
              backgroundImage: `url(${slide.image})`,
            }}
          />
          <div className="slide-content">
            <div className="slide-text">{slide.text}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Learning
