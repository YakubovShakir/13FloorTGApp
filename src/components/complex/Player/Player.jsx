import React, { useState, useEffect } from 'react'
import "./Player.css"
import Assets from "../../../assets"
import {
  RACES,
  GENDERS,
} from "../../../screens/PersonageCreation/PersonageCreation"

const preloadImages = (imageUrls) => {
  return Promise.all(
    imageUrls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(url)
        img.onerror = () => reject(url)
        img.src = url
      })
    })
  )
}

const getBases = (race, gender) => {
  const map = {
    [GENDERS.MALE]: {
      [RACES.WHITE]: Assets.Images.euMan,
      [RACES.BLACK]: Assets.Images.blackMan,
      [RACES.ASIAN]: Assets.Images.asianMan,
    },
    [GENDERS.FEMALE]: {
      [RACES.WHITE]: Assets.Images.euGirl,
      [RACES.BLACK]: Assets.Images.blackGirl,
      [RACES.ASIAN]: Assets.Images.asianGirl,
    },
  }

  if(race && gender) {
    return map[gender][race]
  }
}

const pullGenderedClothingImage = (gender, clothing) => {
  return gender === 'male' ? clothing.male_link : clothing.female_link
}

const Player = ({
  width,
  left,
  top,
  bottom,
  type = true,
  personage,
  clothing,
}) => {
  const { Images } = Assets;
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  console.log(clothing)
  useEffect(() => {
    // If no personage or type is null, skip preloading
    if (type === null || personage === null || JSON.stringify(personage) === JSON.stringify({})) {
      setImagesLoaded(true);
      return;
    }

    // Collect all image URLs to preload
    const imagesToPreload = [
      getBases(personage?.race, personage?.gender),
      ...(clothing?.hat ? [pullGenderedClothingImage(personage?.gender, clothing?.hat)] : []),
      ...(clothing?.top ? [pullGenderedClothingImage(personage?.gender, clothing?.top)] : []),
      ...(clothing?.pants ? [pullGenderedClothingImage(personage?.gender, clothing?.pants)] : []),
      ...(clothing?.shoes ? [pullGenderedClothingImage(personage?.gender, clothing?.shoes)] : []),
    ].filter(Boolean); // Remove any undefined URLs

    // Preload images
    preloadImages(imagesToPreload)
      .then(() => {
        setImagesLoaded(true);
      })
      .catch((failedUrl) => {
        console.error(`Failed to load image: ${failedUrl}`);
        setLoadingError(true);
      });
  }, [personage, clothing, type]);

  // Render placeholder if loading or error occurs
  if (!imagesLoaded || loadingError) {
    return (
      <div
        className="Player"
        style={{ width: `${width}`, aspectRatio: "0.3", left: left, top: top }}
      >
        <img className="PlayerAvatar" src={Images.missingGirl} alt="avatar" />
      </div>
    );
  }

  // Render actual player if images are loaded successfully
  return (
    <div
      className="Player"
      style={{
        width: `${width}`,
        aspectRatio: "0.3",
        left: left,
        bottom: bottom,
        position: "absolute",
        transform: "translate(-50%, -50%)", // Центрируем персонажа
      }}
    >
      {/* Shadow */}
      <div
        className="PlayerShadow"
        style={{
          position: "absolute",
          bottom: "8%", // Чуть ниже персонажа
          left: "58%",
          transform: "translateX(-59%)",
          width: `calc(${width} * 1.3)`, // Размер относительно ширины персонажа
          height: `calc(${width} * 0.3)`, // Пропорции тени
          background: "radial-gradient(circle, rgb(0 0 0 / 31%) 0%, rgba(0, 0, 0, 0) 68%)",
          borderRadius: "50%", // Круглая форма
          zIndex: "1", // Позади персонажа
          filter: "blur(2px)",
        }}
      />
      {/* Player Image */}
      <img
        className="PlayerAvatar"
        src={getBases(personage?.race, personage?.gender)}
        alt="avatar"
        style={{ position: "relative", zIndex: "2" }}
      />
      {clothing && (
        <>
          {clothing.hat && (
            <img
              className="PlayerHead"
              style={{ zIndex: "3" }}
              src={pullGenderedClothingImage(personage?.gender, clothing?.hat)}
              alt="Head"
            />
          )}
          {clothing.accessories && clothing.accessories.map((clothing, index) => 
              <img
                key={index}
                className="PlayerHead"
                style={{ zIndex: "2" }}
                src={pullGenderedClothingImage(personage?.gender, clothing?.accessories[index])}
                alt="Head"
            />
          )}
          {clothing.top && (
            <img 
              className="PlayerTop" 
              src={pullGenderedClothingImage(personage?.gender, clothing.top)} 
              alt="Top" 
            />
          )}
          {clothing.pants && (
            <img 
              className="PlayerLegs" 
              src={pullGenderedClothingImage(personage?.gender, clothing.pants)} 
              alt="Legs" 
            />
          )}
          {clothing.shoes && (
            <img 
              className="PlayerFeet" 
              src={pullGenderedClothingImage(personage?.gender, clothing.shoes)} 
              alt="Feet" 
            />
          )}
        </>
      )}
    </div>
  );
};

export default Player
