import React, { useState, useEffect } from 'react';
import "./Player.css";
import Assets from "../../../assets";
import {
  RACES,
  GENDERS,
} from "../../../screens/PersonageCreation/PersonageCreation";

// Helper functions remain the same
const preloadImages = (imageUrls) => {
  return Promise.all(
    imageUrls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(url);
        img.src = url;
      });
    })
  );
};

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
  };

  if(race && gender) {
    return map[gender][race];
  }
};

const getHand = (race) => {
  const map = {
    [RACES.WHITE]: Assets.Images.euroHand,
    [RACES.BLACK]: Assets.Images.blackHand,
    [RACES.ASIAN]: Assets.Images.asianHand,
  };
  return map[race];
};

const pullGenderedClothingImage = (gender, clothing) => {
  return gender === 'male' ? clothing.male_link : clothing.female_link;
};

const Player = ({
  width,
  left,
  top,
  bottom,
  type = true,
  personage = { gender: 'female' },
  clothing: initialClothing,
}) => {
  const [loadedImages, setLoadedImages] = useState({});
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [clothing, setClothing] = useState(initialClothing);

  useEffect(() => {
    setAllImagesLoaded(false);
    setLoadedImages({});

    if (type === null || personage === null || JSON.stringify(personage) === JSON.stringify({})) {
      setAllImagesLoaded(true);
      return;
    }

    const imagesToLoad = [
      getBases(personage?.race, personage?.gender),
      ...(clothing?.hat ? [pullGenderedClothingImage(personage?.gender, clothing?.hat)] : []),
      ...(clothing?.top ? [pullGenderedClothingImage(personage?.gender, clothing?.top)] : []),
      ...(clothing?.pants ? [pullGenderedClothingImage(personage?.gender, clothing?.pants)] : []),
      ...(clothing?.shoes ? [pullGenderedClothingImage(personage?.gender, clothing?.shoes)] : []),
      ...(clothing?.accessories ? [pullGenderedClothingImage(personage?.gender, clothing?.accessories)] : []),
      personage.race && getHand(personage?.race),
    ].filter(Boolean);

    const loadImage = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => ({ ...prev, [url]: true }));
          resolve(url);
        };
        img.onerror = () => reject(url);
        img.src = url;
      });
    };

    Promise.all(imagesToLoad.map(loadImage))
      .then(() => {
        setClothing(initialClothing);
        setAllImagesLoaded(true);
      })
      .catch((failedUrl) => {
        console.error(`Failed to load image: ${failedUrl}`);
        setLoadingError(true);
      });
  }, [personage, initialClothing, type]);

  const commonStyles = {
    width: `${width}`,
    aspectRatio: "0.3",
    left,
    bottom,
    position: "absolute",
    transform: "translate(-50%, -50%)",
  };

  const renderPlaceholder = () => (
    <div className="Player" style={commonStyles}>
      <div
        className="PlayerShadow"
        style={{
          position: "absolute",
          bottom: "-2%",
          left: "59%",
          transform: "translateX(-59%)",
          width: `calc(${width} * 1.3)`,
          height: `calc(${width} * 0.3)`,
          background: "radial-gradient(circle, rgb(0 0 0 / 31%) 0%, rgba(0, 0, 0, 0) 68%)",
          borderRadius: "50%",
          zIndex: "1",
          filter: "blur(2px)",
        }}
      />
      <img
        className="PlayerAvatar"
        src={personage?.gender === 'male' ? Assets.Images.missingMan : Assets.Images.missingGirl}
        alt="avatar"
        style={{
          opacity: 1,
          transition: "opacity 0.3s ease-in-out",
          position: "relative",
          zIndex: "2",
          width: "100%",
          height: "100%",
          objectFit: "contain"
        }}
      />
    </div>
  );

  if (!allImagesLoaded || loadingError) {
    return renderPlaceholder();
  }

  return (
    <div 
      className="Player" 
      style={{
        ...commonStyles,
        opacity: 1,
        transition: "opacity 0.3s ease-in-out"
      }}
    >
      <div
        className="PlayerShadow"
        style={{
          position: "absolute",
          bottom: "-2%",
          left: "59%",
          transform: "translateX(-59%)",
          width: `calc(${width} * 1.3)`,
          height: `calc(${width} * 0.3)`,
          background: "radial-gradient(circle, rgb(0 0 0 / 31%) 0%, rgba(0, 0, 0, 0) 68%)",
          borderRadius: "50%",
          zIndex: "1",
          filter: "blur(2px)",
        }}
      />
      <img
        className="PlayerAvatar"
        src={getBases(personage?.race, personage?.gender)}
        alt="avatar"
        style={{ zIndex: "2" }}
      />
      {clothing && (
        <>
          {clothing.hat && (
            <img
              className="PlayerHead"
              style={{ zIndex: "6" }}
              src={pullGenderedClothingImage(personage?.gender, clothing?.hat)}
              alt="Head"
            />
          )}
          {clothing.accessories && (
            <img
              className="PlayerHead"
              style={{ zIndex: 5 }}
              src={pullGenderedClothingImage(personage?.gender, clothing?.accessories)}
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
          {personage && personage?.gender === 'female' && personage?.race && (
            <img 
              className="PlayerFeet" 
              src={getHand(personage.race)} 
              alt="Hand" 
              style={{ zIndex: 4 }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Player;