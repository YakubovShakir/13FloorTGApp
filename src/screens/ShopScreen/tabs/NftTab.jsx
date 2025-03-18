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
            height: 60
          }}
        >
          <img
            src={Assets.Icons.respect}
            height={22}
            style={isDisabled ? { filter: "grayscale(100%)" } : {}} // Серая иконка для неактивных элементов
          />
          <p
            style={{
              textAlign: "center",
              fontWeight: "100",
              fontFamily: "Oswald",
              paddingLeft: 8,
              fontSize: "20px",
              paddingBottom: 4,
              paddingRight: 2
            }}
          >+</p>
          <p
            style={{
              textAlign: "center",
              fontWeight: "100",
              fontFamily: "Oswald",
              fontSize: "20px",
            }}
          >
            {respect}
          </p>
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
  starsPrice,
  available = true,
  respect = 100,
  equipped,
  handleCoinsBuy,
  handleStarsBuy,
  clothingId,
  type,
  description
}) => {
  console.log(id)
  const isNftItem = id >= 9 && id <= 38; // Check if ID is in NFT range
  const showBuyNFT = isNftItem
  const { lang } = useSettingsProvider()

  const handleNftRedirect = () => {
    window.Telegram.WebApp.openLink("https://13thfloorgame.io"); // Simple redirect
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
      </div>

      <div
        className="clothing-item-bottom"
        style={{
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
            color: "white",
            textAlign: "center",
            fontWeight: "100",
            fontFamily: "Oswald",
            width: "90%",
          }}
        >
          {title}
        </p>
        <div
          className="clothing-item-respect"
          style={{
            height: "10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 5,
            marginBottom: 25,
            width: '90%'
          }}
        >
          {/* Description could go here if needed */}
        </div>

        {/* Button logic */}
        {isPrem ? (
          <Button
            className="clothing-item-equip-button"
            shadowColor={"#AF370F"}
            width={"88%"}
            marginBottom={"5"}
            color={"rgb(255, 255, 255)"}
            height={44}
            fontFamily={"Oswald"}
            fontWeight={"300"}
            text={price}
            icon={Assets.Icons.starsIcon}
            fontSize={14}
            borderColor={"rgb(34, 199, 163)"}
            ownColor={
              "linear-gradient(to bottom, rgb(34 199 163 / 0%), rgb(34 199 163 / 24%))"
            }
            bgColor={
              "linear-gradient(to bottom, rgb(34 199 163 / 0%), rgb(34 199 163 / 24%))"
            }
            onClick={() => handleStarsBuy({ id, productType })}
          />
        ) : showBuyNFT ? (
          <Button
            className="clothing-item-equip-button"
            shadowColor={"#AF370F"}
            width={"88%"}
            marginBottom={"5"}
            color={"rgb(255, 255, 255)"}
            height={44}
            fontFamily={"Oswald"}
            fontWeight={"300"}
            text={lang === 'en' ? "Buy NFT" : "Купить NFT"} // Hardcoded for quick fix
            fontSize={14}
            ownColor={
              "rgb(255, 118, 0)"
            }
            bgColor={
              "rgb(255, 118, 0)"
            }
            onClick={handleNftRedirect}
            active={true}
          />
        ) : (
          <Button
            className="clothing-item-equip-button"
            shadowColor={"rgb(199, 80, 21)"}
            width={"88%"}
            marginBottom={"5"}
            color={"rgb(255, 255, 255)"}
            height={44}
            active={available || price === 0}
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
          />
        )}
      </div>
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
        {items.map((item, index) => {
          if (item.category === "Shelf") {
            return (
              <GridItemShelf
              key={index}
              icon={item.image}
              title={item.name}
              price={item.price}
              respect={item.respect}
              equipped={item.equipped}
              available={item.available}
              handleCoinsBuy={handleCoinsBuy}
              handleStarsBuy={handleStarsBuy}
              clothingId={item.clothing_id}
              type={item.category}
              isPrem={item.isPrem}
              description={item.description}
              id={item.id}
              productType={item.productType}
            />
            )
          } else {
            return (
              <GridItem
                key={index}
                icon={item.image}
                title={item.name}
                price={item.price}
                respect={item.respect}
                equipped={item.equipped}
                available={item.available}
                handleCoinsBuy={handleCoinsBuy}
                handleStarsBuy={handleStarsBuy}
                clothingId={item.clothing_id}
                type={item.category}
                id={item.id}
                productType={item.productType}
              />
            )
          }
        })}
      </div>
    </div>
  )
}

const CoinsTab = () => {
  const [userEatingFoods, setUserEatingFoods] = useState(null)
  const [foods, setFoods] = useState(null)
  const [shopItems, setShopItems] = useState(null)
  const [filterTypeInUse, setFilterTypeInUse] = useState(null)
  const [currentItem, setCurrentItem] = useState(null)
  const [clothesItems, setClothesItems] = useState(null)
  const [shelfItems, setShelfItems] = useState(null)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [currentComplexFilters, setCurrentComplexFilters] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const { userPersonage, userParameters } = useContext(UserContext)
  const { lang } = useSettingsProvider()

  const BaseFilters = {
    // User Clothing
    Hat: "Hat",
    Top: "Top",
    Pants: "Pants",
    Shoes: "Shoes",
    Accessories: "Accessory",
    // Uses ShelfItems
    Shelf: "Shelf",
    Complex: "Complex",
    Stars: "Stars"
  }
  
  useEffect(() => {
    getShopItems(userId)
      .then((data) => {
        // TODO: localize
        const loadedClothesItems = data.clothing.filter(c => c.requiredLevel <= userParameters.level).map((item) => ({
          id: item.clothing_id,
          name: item.name[lang],
          productType: 'clothes',
          image:
            userPersonage.gender === "male" ? item.male_icon : item.female_icon,
          price: item.price,
          respect: item.respect,
          tier: item.tier,
          tags: item.tag,
          category: item.type,
          available: userParameters.coins >= item.price && userParameters.level >= item.requiredLevel,
        }))
        const loadedShelfItems = data.shelf.map((item) => ({
          id: item.id,
          productType: 'shelf',
          name: item.name[lang],
          image: item.link,
          price: item.cost.stars || item.cost.coins,
          category: "Shelf",
          isPrem: item.cost.stars > 0,
          available: item.cost.stars > 0 || item.cost.coins === 0 || userParameters.coins >= item.cost.coins,
          description: item.description['ru'],
          respect: item.respect
        }))
        setClothesItems(loadedClothesItems)
        setShelfItems(loadedShelfItems)
        console.log("Clothes Items", clothesItems)
      })
      .finally(() => setIsLoading(false))
    // getFoods().then((r) => setFoods(r))
    // getProcesses("food", userId).then((r) => setUserEatingFoods(r))
    // updateInformation()
  }, [])

  const addComplexFilter = ({ filteredValue, filteredField }) => {
    console.log("filters", currentComplexFilters)
    setCurrentComplexFilters([
      ...currentComplexFilters,
      { filteredField, filteredValue },
    ])
  }

  const removeComplexFilter = ({ filteredValue, filteredField }) => {
    setCurrentComplexFilters(
      currentComplexFilters.filter(
        (filter) =>
          filter.filteredField !== filteredField ||
          filter.filteredValue !== filteredValue
      )
    )
  }

  const applyFilter = (items) => {
    if (!filterTypeInUse) {
      return items
    }

    if (filterTypeInUse === BaseFilters.Complex) {
      if (!currentComplexFilters || currentComplexFilters.length === 0) {
        return items
      }

      const tags = currentComplexFilters
        .filter((filter) => filter.filteredField === "tag")
        .map((filter) => filter.filteredValue)
      const tiers = currentComplexFilters
        .filter((filter) => filter.filteredField === "tier")
        .map((filter) => filter.filteredValue)

      console.log('@', tags)

      const filtered = items.filter((item) => {
        let shouldTake = false
        const isCorrectByTier =
          tiers.length > 0 ? tiers.includes(item.tier) : true

        const isCorrectByTags = tags.length > 0 ? item.tags?.some(tag => tags.includes(tag)) : true
      
        if (isCorrectByTier && isCorrectByTags) {
          shouldTake = true
        }

        return shouldTake
      })

      return filtered
    }

    if (filterTypeInUse === BaseFilters.Hat) {
      return items.filter((item) => item.category === "Hat")
    }

    if (filterTypeInUse === BaseFilters.Top) {
      return items.filter((item) => item.category === "Top")
    }

    if (filterTypeInUse === BaseFilters.Pants) {
      return items.filter((item) => item.category === "Pants")
    }

    if (filterTypeInUse === BaseFilters.Shoes) {
      return items.filter((item) => item.category === "Shoes")
    }

    if (filterTypeInUse === BaseFilters.Accessories) {
      return items.filter((item) => item.category === "Accessory")
    }

    if (filterTypeInUse === BaseFilters.Shelf) {
      return items.filter((item) => item.productType === "shelf")
    }

    if (filterTypeInUse === BaseFilters.Stars) {
      return items.filter((item) => item.isPrem === true)
    }
  }

  const { refreshData, userId } = useUser()

  const handleStarsBuy = async (item) => {
    try {
      await handleStarsPayment(userId, item.productType, item.id, lang)
      await refreshData()
      getShopItems(userId)
      .then((data) => {
        const loadedClothesItems = data.clothing.filter(c => c.requiredLevel <= userParameters.level).map((item) => ({
          id: item.clothing_id,
          name: item.name[lang],
          productType: 'clothes',
          image:
            userPersonage.gender === "male" ? item.male_icon : item.female_icon,
          price: item.price,
          respect: item.respect,
          tier: item.tier,
          tags: item.tag,
          category: item.type,
          available: userParameters.coins >= item.price && userParameters.level >= item.requiredLevel,
        }))
        const loadedShelfItems = data.shelf.map((item) => ({
          id: item.id,
          productType: 'shelf',
          name: item.name[lang],
          image: item.link,
          price: item.cost.stars || item.cost.coins,
          category: "Shelf",
          isPrem: item.cost.stars > 0,
          available: item.cost.stars > 0 || item.cost.coins === 0 || userParameters.coins >= item.cost.coins,
          description: item.description['ru']
        }))
        setClothesItems(loadedClothesItems)
        setShelfItems(loadedShelfItems)
        console.log("Clothes Items", clothesItems)
      })
      .finally(() => setIsLoading(false))
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleCoinsBuy = async (item) => {
    try {
      setIsLoading(true)
      await buyItemsForCoins(userId, item.id, item.productType)
      await refreshData()
      getShopItems(userId)
      .then((data) => {
        const loadedClothesItems = data.clothing.map((item) => ({
          id: item.clothing_id,
          name: item.name[lang],
          productType: 'clothes',
          image:
            userPersonage.gender === "male" ? item.male_icon : item.female_icon,
          price: item.price,
          respect: item.respect,
          tier: item.tier,
          tags: item.tag,
          category: item.type,
          available: userParameters.coins >= item.price && userParameters.level >= item.requiredLevel,
        }))
        const loadedShelfItems = data.shelf.map((item) => ({
          id: item.id,
          productType: 'shelf',
          name: item.name[lang],
          image: item.link,
          price: item.cost.stars || item.cost.coins,
          category: "Shelf",
          isPrem: item.cost.stars > 0,
          available: item.cost.stars > 0 || item.cost.coins === 0 || userParameters.coins >= item.cost.coins,
          description: item.description && item.description[lang],
          respect: item.respect
        }))
        setClothesItems(loadedClothesItems)
        setShelfItems(loadedShelfItems)
      })
      .finally(() => setIsLoading(false))
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading) {
    return <FullScreenSpinner />
  }

  return (
    <ScreenContainer withTab>
      {isFilterModalOpen && (
        <FilterModal
          baseStyles={{
            position: "fixed",
            height: "100vh",
            width: "100vw",
            backgroundColor: "black",
            zIndex: 10,
            top: 0,
            left: 0,
          }}
          addComplexFilter={addComplexFilter}
          removeComplexFilter={removeComplexFilter}
          setIsFilterModalOpen={setIsFilterModalOpen}
          currentComplexFilters={currentComplexFilters}
        />
      )}{" "}
      <div
        style={{ width: "100vw", display: "flex", justifyContent: "center" }}
      >
        <div
          style={{
            background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 40%)",
    padding: "20px 0px 30px 0px",
    bottom:"0%",
            zIndex: "5",
            position:" fixed",
            width: "95vw",
            display: "flex",
            justifyContent: "space-around",
          }}
        >
                   <SquareButton
            size={36}
            imageH={35}
            imageSrc={Assets.Icons.settingsIcon}
            assignedValue={true}
            selectedValue={currentComplexFilters.length > 0}
            handlePress={() => {
              setFilterTypeInUse(BaseFilters.Complex)
              setIsFilterModalOpen(true)
            }}
          />
          <SquareButton
            size={36}
            imageSize={42}
            imageSrc={Assets.Icons.hairIcon}
            selectedValue={filterTypeInUse}
            assignedValue={BaseFilters.Hat}
            handlePress={() =>
              filterTypeInUse === BaseFilters.Hat
                ? setFilterTypeInUse(null)
                : setFilterTypeInUse(BaseFilters.Hat)
            }
          />
          <SquareButton
            size={36}
            imageSize={30}
            imageSrc={Assets.Icons.bodyIcon}
            selectedValue={filterTypeInUse}
            assignedValue={BaseFilters.Top}
            handlePress={() =>
              filterTypeInUse === BaseFilters.Top
                ? setFilterTypeInUse(null)
                : setFilterTypeInUse(BaseFilters.Top)
            }
          />
          <SquareButton
            size={36}
            imageSize={28}
            imageSrc={Assets.Icons.legsIcon}
            selectedValue={filterTypeInUse}
            assignedValue={BaseFilters.Pants}
            handlePress={() =>
              filterTypeInUse === BaseFilters.Pants
                ? setFilterTypeInUse(null)
                : setFilterTypeInUse(BaseFilters.Pants)
            }
          />
          <SquareButton
            size={36}
            imageSize={35}
            imageSrc={Assets.Icons.shoesIcon}
            assignedValue={BaseFilters.Shoes}
            selectedValue={filterTypeInUse}
            handlePress={() =>
              filterTypeInUse === BaseFilters.Shoes
                ? setFilterTypeInUse(null)
                : setFilterTypeInUse(BaseFilters.Shoes)
            }
          />
          <SquareButton
            size={36}
            imageSize={28}
            imageSrc={Assets.Icons.accIcon}
            selectedValue={filterTypeInUse}
            assignedValue={BaseFilters.Accessories}
            handlePress={() =>
              filterTypeInUse === BaseFilters.Accessories
                ? setFilterTypeInUse(null)
                : setFilterTypeInUse(BaseFilters.Accessories)
            }
          />
          <SquareButton
            size={36}
            imageSize={30}
            imageSrc={Assets.Icons.homeIcon}
            selectedValue={filterTypeInUse}
            assignedValue={BaseFilters.Shelf}
            handlePress={() => {
              setCurrentComplexFilters([])
              filterTypeInUse === BaseFilters.Shelf
                ? setFilterTypeInUse(null)
                : setFilterTypeInUse(BaseFilters.Shelf)
            }
            }
          />
          <SquareButton
            size={36}
            imageSize={34}
            imageSrc={Assets.Icons.starsIcon}
            selectedValue={filterTypeInUse}
            assignedValue={BaseFilters.Stars}
            handlePress={() =>
              filterTypeInUse === BaseFilters.Stars
                ? setFilterTypeInUse(null)
                : setFilterTypeInUse(BaseFilters.Stars)
            }
          />
        </div>
      </div>
      <GridLayout
        setCurrentItem={setCurrentItem}
        items={applyFilter([...clothesItems, ...shelfItems])}
        handleCoinsBuy={handleCoinsBuy}
        handleStarsBuy={handleStarsBuy}
      />
      {currentItem && (
        <Modal
          width={"100vw"}
          bottom={"-25vh"}
          height={"100vh"}
          data={{ title: "Lol" }}
        />
      )}
    </ScreenContainer>
  )
}

export default NftTab
