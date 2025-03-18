import { useState, useEffect, useContext } from "react"
import Assets from "../../../assets"
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer"
import { getShopItems } from "../../../services/user/user"
import Button from "../../../components/simple/Button/Button"
import Modal from "../../../components/complex/Modals/Modal/Modal"
import { motion } from "framer-motion"
import UserContext, { useUser } from "../../../UserContext"
import FullScreenSpinner from "../../Home/FullScreenSpinner"
import FilterModal from "../../../components/complex/FilterModal/FilterModal"
import { SquareButton } from "../../../components/simple/SquareButton/SquareButton"
import { instance } from "../../../services/instance"
import { buyItemsForCoins } from '../../../services/user/user'
import WebApp from "@twa-dev/sdk"
import { useSettingsProvider } from "../../../hooks"
import { useNotification } from "../../../NotificationContext"
import { handleStarsPayment } from "../../../utils/handleStarsPayment"

const GridItem = ({
  id,
  productType,
  icon,
  title,
  price,
  available = true,
  respect = 100,
  equipped,
  clothesUnequip,
  clothesEquip,
  clothingId,
  type,
  isPrem = false,
  handleCoinsBuy,
  handleStarsBuy
}) => {
  // Определим стиль для неактивных элементов (если цена больше 0 и кнопка неактивна)
  const isDisabled = !available && price > 0;
  
  return (
    <div
      className="clothing-item-container"
      style={{
        borderRadius: "8px",
        borderBottom: "solid 1px rgba(117, 117, 117, 0.23)",
        background: "0% 0% / cover rgb(32, 32, 32)",
        padding: "10px",
          }}
    >
      <div
        className="clothing-item-top"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "rgba(0, 0, 0, 0.24) 0px 0px 8px 2px inset",
          borderBottom: isDisabled ? "solid 1px rgba(117, 117, 117, 0.23)" : "solid 1px rgba(117, 117, 117, 0.23)", // изменено
        background:"#00000082",
          borderRadius: "7px",
          backgroundImage:
            isDisabled
              ? "repeating-linear-gradient(45deg, #00000036, #00000036 2px, #3939390f 2px, #3939390f 6px)"
              : "repeating-linear-gradient(45deg, #00000036, #00000036 2px, #3939390f 2px, #3939390f 6px)", // изменено
          justifyContent: "center",
          
        }}
      >
        <div className="clothing-item-header">
          <div></div>
          <motion.div
            className="clothing-item-icon-wrapper"
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className="clothing-item-icon-container"
              style={{
                height: "100%",
                width: "100%",
                borderRadius: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: -5.5,
                position: "relative",
              }}
            >
              {equipped && (
                <img
                  className="clothing-item-shadow"
                  src={Assets.Layers.inventoryActiveShadow}
                  style={{
                    position: "absolute",
                    height: "100%",
                    width: "100%",
                    top: 0,
                    left: 0,
                    zIndex: 1,
                  }}
                />
              )}
              <img
                className="clothing-item-icon"
                src={icon}
                alt={title}
                style={{
                  height: "100%",
                  width: "100%",
                  position: "relative",
                  zIndex: 2,
                  filter: isDisabled ? "grayscale(100%)" : "none", // обесцвечиваем только если неактивно
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div
        className="clothing-item-bottom"
        style={{
          color:"#ffffff",
          paddingBottom: "12px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <p
          style={{
            padding: "10px 5px 10px 5px",
            height: "45px",
            textAlign: "center",
            fontWeight: "100",
            fontFamily: "Oswald",
            width: "100%",
          }}
        >
          {title}
        </p>

        <div
          className="clothing-item-respect"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 5,
            marginBottom: 10,
            height: 60,
            color: 'white'
          }}
        >
          {respect > 0 && (
            <>
              <img
                src={Assets.Icons.respect}
                height={22}
              />
              <p
                style={{
                  textAlign: "center",
                  fontWeight: "100",
                  fontFamily: "Oswald",
                  paddingLeft: 8,
                  fontSize: "20px",
                  paddingBottom: 4,
                  paddingRight: 2,
                }}
              >
                +
              </p>
              <p
                style={{
                  textAlign: "center",
                  fontWeight: "100",
                  fontFamily: "Oswald",
                  fontSize: "20px",
                  paddingBottom: 4,
                }}
              >
                {respect}
              </p>
            </>
          )}
        </div>

        {/* Кнопки действий */}
        {isPrem ? (
          <Button
            className="clothing-item-unequip-button"
            shadowColor={"#22c7a3"}
            width={"88%"}
            marginBottom={"5"}
            height={44}
            fontFamily={"Oswald"}
            fontWeight={"300"}
            text={price}
            icon={Assets.Icons.starsIcon}
            fontSize={14}
            borderColor={"rgb(34, 199, 163)"}
            color={"rgb(255, 255, 255)"}
            ownColor={
              "linear-gradient(to bottom, rgb(34 199 163 / 0%), rgb(34 199 163 / 24%))"
            }
            bgColor={
              "rgb(255, 118, 0)"
            }
            onClick={() => handleStarsBuy({ id, productType })}
          />
        ) : (
          <Button
            className="clothing-item-equip-button"
            shadowColor={"rgb(199, 80, 21)"}
            width={"88%"}
            color={"rgb(255, 255, 255)"}
            marginBottom={"5"}
            height={44}
            active={available}
            fontFamily={"Oswald"}
            fontWeight={"300"}
            icon={price > 0 ? Assets.Icons.balance : undefined}
            text={price === 0 ? 'Забрать' : price}
            fontSize={14}
            ownColor={
              "rgb(255, 118, 0)"
            }
            bgColor={
              "rgb(255, 118, 0)"
            }
            onClick={() => available || price === 0 ? handleCoinsBuy({ id, productType }) : null}
            style={isDisabled ? { filter: "grayscale(100%)" } : {}} // Серая кнопка
          />
        )}
      </div>
    </div>
  );
};


const GridItemShelf = ({
  id,
  productType,
  icon,
  title,
  isPrem,
  price,
  respect,
  available = true,
  handleCoinsBuy,
  handleStarsBuy,
}) => {
  const { lang } = useSettingsProvider();

  const handleNftRedirect = () => {
    window.Telegram.WebApp.openLink("https://13thfloorgame.io");
  };

  return (
    <div
      className="clothing-item-container"
      style={{
        borderRadius: "8px",
        border: "1px solid rgb(57, 57, 57)",
        background: "0% 0% / cover rgb(32, 32, 32)",
        padding: "10px",
      }}
    >
      <div
        className="clothing-item-top"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexDirection: "column",
          overflow: "hidden",
          borderBottom: "solid 1px rgba(117, 117, 117, 0.23)",
          boxShadow: "rgba(0, 0, 0, 0.24) 0px 0px 8px 2px inset",
          background: "#00000082",
          borderRadius: "7px",
          backgroundImage:
            "repeating-linear-gradient(45deg, #00000036, #00000036 2px, #3939390f 2px, #3939390f 6px)",
          justifyContent: "center",
        }}
      >
        <motion.div
          className="clothing-item-icon-wrapper"
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div
            className="clothing-item-icon-container"
            style={{
              height: "100%",
              width: "100%",
              borderRadius: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: -5.5,
              position: "relative",
            }}
          >
            <img
              src={icon}
              alt={title}
              style={{
                width: "100%",
                position: "relative",
                zIndex: 2,
              }}
            />
          </div>
        </motion.div>
      </div>

      <div
          className="clothing-item-respect"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 5,
            marginBottom: 10,
            height: 60,
            color: 'white'
          }}
        >
          {respect > 0 && (
            <>
              <img
                src={Assets.Icons.respect}
                height={22}
              />
              <p
                style={{
                  textAlign: "center",
                  fontWeight: "100",
                  fontFamily: "Oswald",
                  paddingLeft: 8,
                  fontSize: "20px",
                  paddingBottom: 4,
                  paddingRight: 2,
                }}
              >
                +
              </p>
              <p
                style={{
                  textAlign: "center",
                  fontWeight: "100",
                  fontFamily: "Oswald",
                  fontSize: "20px",
                  paddingBottom: 4,
                }}
              >
                {respect}
              </p>
            </>
          )}
        </div>

        <Button
          className="clothing-item-equip-button"
          shadowColor={"#AF370F"}
          width={"88%"}
          marginBottom={"5"}
          color={"rgb(255, 255, 255)"}
          height={44}
          fontFamily={"Oswald"}
          fontWeight={"300"}
          text={lang === "en" ? "Buy NFT" : "Купить NFT"}
          fontSize={14}
          ownColor={"rgb(255, 118, 0)"}
          bgColor={"rgb(255, 118, 0)"}
          onClick={handleNftRedirect}
          active={true}
        />
      </div>
  );
};

const GridLayout = ({ items, handleCoinsBuy, handleStarsBuy }) => {
  return (
    <div
      style={{
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        paddingBottom: 55,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1rem",
          width: "90vw",
        }}
      >
        {items.map((item, index) => (
          <GridItemShelf
            key={index}
            icon={item.image}
            title={item.name}
            price={item.price}
            respect={item.respect}
            available={item.available}
            handleCoinsBuy={handleCoinsBuy}
            handleStarsBuy={handleStarsBuy}
            description={item.description}
            id={item.id}
            productType={item.productType}
            isPrem={item.isPrem}
          />
        ))}
      </div>
    </div>
  );
};

const NftTab = () => {
  const [shelfItems, setShelfItems] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userPersonage, userParameters } = useContext(UserContext);
  const { lang } = useSettingsProvider();
  const { userId } = useUser();

  useEffect(() => {
    getShopItems(userId)
      .then((data) => {
        const loadedShelfItems = data.shelf
          .filter((item) => item.id >= 9 && item.id <= 38) // Фильтруем только NFT
          .map((item) => ({
            id: item.id,
            productType: "shelf",
            name: item.name[lang],
            image: item.link,
            price: item.cost.stars || item.cost.coins,
            category: "Shelf",
            isPrem: item.cost.stars > 0,
            available:
              item.cost.stars > 0 ||
              item.cost.coins === 0 ||
              userParameters.coins >= item.cost.coins,
            description: item.description["ru"],
            respect: item.respect,
          }));
        setShelfItems(loadedShelfItems);
      })
      .catch((err) => {
        console.error("Error fetching shop items:", err);
        setShelfItems([]); // Устанавливаем пустой массив в случае ошибки
      })
      .finally(() => setIsLoading(false));
  }, [userId, lang, userParameters.coins]);

  const handleStarsBuy = async (item) => {
    try {
      setIsLoading(true);
      await handleStarsPayment(userId, item.productType, item.id, lang);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoinsBuy = async (item) => {
    try {
      setIsLoading(true);
      await buyItemsForCoins(userId, item.id, item.productType);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <FullScreenSpinner />;
  }

  return (
    <ScreenContainer withTab>
      <GridLayout
        items={shelfItems || []}
        handleCoinsBuy={handleCoinsBuy}
        handleStarsBuy={handleStarsBuy}
      />
    </ScreenContainer>
  );
};

export default NftTab;