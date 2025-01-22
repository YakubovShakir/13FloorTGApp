import React, { useState, useEffect, useCallback } from 'react';
import "./Player.css";
import Assets from "../../../assets";
import {
  RACES,
  GENDERS,
} from "../../../screens/PersonageCreation/PersonageCreation";

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

  if (race && gender) {
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

const getFaceForSleep = (race, gender) => {
  const map = {
    [GENDERS.MALE]: {
      [RACES.WHITE]: Assets.Images.sleepEuMale,
      [RACES.BLACK]: Assets.Images.sleepAfroMale,
      [RACES.ASIAN]: Assets.Images.sleepAsianMale,
    },
    [GENDERS.FEMALE]: {
      [RACES.WHITE]: Assets.Images.sleepEuFemale,
      [RACES.BLACK]: Assets.Images.sleepAfroFemale,
      [RACES.ASIAN]: Assets.Images.sleepAsianFemale,
    },
  };

  if (race && gender) {
    return map[gender][race];
  }
}

const pullGenderedClothingImage = (gender, clothing) => {
  return gender === 'male' ? clothing.male_link : clothing.female_link;
};

const MAX_RETRIES = 10;
const RETRY_DELAY = 2000; // 2 seconds

const Player = ({
  sleep,
  training,
  work,
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
  const [retryCount, setRetryCount] = useState(0);
  const [clothing, setClothing] = useState(initialClothing);

  const loadImages = useCallback(async () => {
    setAllImagesLoaded(false);
    setLoadedImages({});
    setLoadingError(false);

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

    try {
      await Promise.all(imagesToLoad.map(loadImage));
      setClothing(initialClothing);
      setAllImagesLoaded(true);
      setRetryCount(0); // Reset retry count on success
    } catch (failedUrl) {
      console.error(`Failed to load image: ${failedUrl}. Attempt ${retryCount + 1} of ${MAX_RETRIES}`);
      setLoadingError(true);

      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          loadImages();
        }, RETRY_DELAY);
      } else {
        console.error('Max retries reached. Showing placeholder.');
      }
    }
  }, [personage, initialClothing, type, retryCount, clothing]);

  useEffect(() => {
    setRetryCount(0); // Reset retry count when props change
    loadImages();
  }, [personage, initialClothing, type, loadImages]);

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
      {loadingError && retryCount < MAX_RETRIES && (
        <div
          style={{
            position: 'absolute',
            bottom: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '12px',
            color: '#666',
            whiteSpace: 'nowrap'
          }}
        >
          Retrying... ({retryCount + 1}/{MAX_RETRIES})
        </div>
      )}
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
      {sleep && (

<img
className="PlayerHead"
style={{ zIndex: "6" }}
src={getFaceForSleep(personage?.race, personage?.gender)}
alt="Head"
/>
      )}
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