import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import "./FullScreenSlider.css"
import Assets from "../../assets"
import { useSettingsProvider } from "../../hooks"

const translations = {
    slideOne: {
      ru: "Добро пожаловать в корпорацию 13 Floor! Мы предоставляем услуги симуляции реальности, и мы рады что вы обратились именно к нам! Сейчас вам предстоит создать собственного аватара, а после мы объясним вам азы взаимодействия с симуляцией.",
      en: "Welcome to the 13 Floor Corporation! We provide reality simulation services, and we are glad that you have contacted us! Now you have to create your own avatar, and after that we will explain to you the basics of interacting with the simulation.",
    },
    slideTwo: {
      ru: "Мы почти закончили. Теперь я познакомлю вас с нейроинтерфейсом. Ваши базовые потребности. Энергия, голод и счастье. Любое действие в симуляции расходует эти ресурсы. ",
      en: "We're almost done. Now I'm going to introduce you to the neural interface. Your basic needs. Energy, hunger and happiness. Any action in the simulation consumes these resources.",
    },
    slideThree: {
      ru: "Внимательно следите за ними, голодный и несчастный персонаж не сможет эффективно работать и будет меньше зарабатывать.",
      en: "Keep a close eye on them, a hungry and unhappy character will not be able to work effectively and will earn less.",
    },
    slideFour: {
      ru: "Монета отображает ваш баланс. Монеты пригодятся вам для развития вашего персонажа и покупки предметов. Респект отражает ваш социальный статус. Одевайтесь в новую одежду, украшайте квартиру чтобы повысить ваш уровень респекта.",
      en: "The coin displays your balance. Coins will be useful to you for developing your character and buying items. Respect reflects your social status. Dress up in new clothes, decorate your apartment to increase your respect level.",
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
