import { useState, useEffect, useContext } from "react"
import Assets from "../../../assets"
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer"
import ItemCard from "../../../components/simple/ItemCard/ItemCard"
import ActionCard from "../../../components/complex/ActionCard/ActionCard"
import { getFoods } from "../../../services/food/food"
import { getProcesses, startProcess } from "../../../services/process/process"
import {
  getParameters,
  getShopItems,
  getInventoryItems,
  handleClothesUnequip,
  handleClothesEquip,
} from "../../../services/user/user"
import formatTime from "../../../utils/formatTime"
import Button from "../../../components/simple/Button/Button"
import Modal from "../../../components/complex/Modals/Modal/Modal"
import { motion, AnimatePresence, complex } from "framer-motion"
import UserContext, { useUser } from "../../../UserContext"
import FullScreenSpinner from "../../Home/FullScreenSpinner"
import FilterModal from "../../../components/complex/FilterModal/FilterModal"
import { SquareButton } from "../../../components/simple/SquareButton/SquareButton"
import { useSettingsProvider } from "../../../hooks"

const translations = {
  equipped: {
    ru: "Используется",
    en: "Equipped",
  },
  choose: {
    ru: "Выбрать",
    en: "Choose",
  },
}

const GridItem = ({
  icon,
  title,
  respect = 0,
  equipped,
  clothesUnequip,
  clothesEquip,
  clothingId,
  type,
  productType,
}) => {
  const { lang } = useSettingsProvider()
  return (
    <div
      className="clothing-item-container" // Основной контейнер элемента одежды
      style={{
        borderRadius: "8px",
        border: "1px solid rgb(57, 57, 57)",
        background: "0% 0% / cover rgb(32, 32, 32)",
        padding: "10px",
      }}
    >
      <div
        className="clothing-item-top" // Верхний блок: Заголовок, Иконка и Тень
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
        {/* Заголовок и Иконка */}
        <div className="clothing-item-header">
          <div></div>
          {/* Иконка одежды и Тень активной одежды */}
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
              {/* Тень активной одежды */}
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
        className="clothing-item-bottom" // Нижний блок: Уровень уважения и Кнопки
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
            width: "100%",
          }}
        >
          {title}
        </p>
        {/* Уровень уважения */}

        <div
          className="clothing-item-respect"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 5,
            marginBottom: 10,
            height: 60,
            color: "white",
          }}
        >
          {respect > 0 && (
            <>
              <img src={Assets.Icons.respect} height={22} />
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
        {equipped ? (
          <Button
            className="clothing-item-unequip-button"
            shadowColor={"rgba(243, 117, 0, 0)"}
            width={"88%"}
            marginBottom={"5"}
            height={44}
            active={equipped}
            fontFamily={"Oswald"}
            fontWeight={"300"}
            text={translations.equipped[lang]}
            fontSize={14}
            paddingTop={1}
            borderColor={"rgba(243, 117, 0, 0)"}
            color={"rgb(10 255 186)"}
            ownColor={"rgb(166, 0, 243)"}
            bgColor={"rgba(126, 86, 49, 0)"}
            onClick={() =>
              productType === "shelf"
                ? clothesUnequip(clothingId, type, productType)
                : null
            }
          />
        ) : (
          <Button
            className="clothing-item-equip-button"
            shadowColor={"rgb(199, 80, 21)"}
            width={"88%"}
            marginBottom={"5"}
            height={44}
            active={true}
            fontFamily={"Oswald"}
            fontWeight={"300"}
            text={translations.choose[lang]}
            color={"rgb(255, 255, 255)"}
            fontSize={14}
            paddingTop={1}
            ownColor={"rgb(255, 118, 0)"}
            bgColor={"rgb(255, 118, 0)"}
            onClick={() => clothesEquip(clothingId, type, productType)}
          />
        )}
      </div>
    </div>
  )
}

const GridLayout = ({
  setCurrentItem,
  items,
  clothesUnequip,
  clothesEquip,
}) => {
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
          <GridItem
            key={index}
            icon={item.image}
            title={item.name}
            price={item.price}
            respect={item.respect}
            equipped={item.equipped}
            available={item.available}
            clothesUnequip={clothesUnequip}
            clothesEquip={item.equipped ? undefined : clothesEquip}
            clothingId={item.clothing_id}
            type={item.category}
            productType={item.productType}
          />
        ))}
      </div>
    </div>
  )
}

const loadClothesFromData = (data, userPersonage, lang) => {
  return data.clothes.map((item) => {
    return {
      clothing_id: item.clothing_id,
      name: item.name[lang],
      image:
        userPersonage.gender === "male" ? item.male_icon : item.female_icon,
      price: item.price,
      respect: item.respect,
      tier: item.tier,
      tags: item.tag,
      category: item.type,
      equipped: Object.values(data.currentlyUsedClothes).includes(
        item.clothing_id
      ),
      productType: "clothes",
    }
  })
}

const loadShelfFromData = (data, lang) => {
  return data.shelf.map((item) => ({
    clothing_id: item.id,
    name: item.name[lang],
    image: item.link,
    price: item.price,
    respect: item.respect,
    tier: item.tier,
    tags: item.tag,
    category: item.type,
    equipped: Object.values(data.currentlyUsedShelf).includes(item.id),
    productType: "shelf",
  }))
}

const BaseFilters = {
  // Uses Clothing
  Hat: "Hat",
  Top: "Top",
  Pants: "Pants",
  Shoes: "Shoes",
  Accessories: "Accessory",
  // Uses ShelfItems
  Shelf: "Shelf",
  Complex: "Complex",
  Stars: "Stars",
}

const InventoryTab = ({ userId }) => {
  const [filterTypeInUse, setFilterTypeInUse] = useState(null)
  const [currentItem, setCurrentItem] = useState(null)
  const [clothesItems, setClothesItems] = useState(null)
  const [shelfItems, setShelfItems] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [currentComplexFilters, setCurrentComplexFilters] = useState([])
  const { userPersonage } = useContext(UserContext)
  const { lang } = useSettingsProvider()

  useEffect(() => {
    getInventoryItems(userId)
      .then((data) => {
        console.log(data)
        const loadedClothesItems = loadClothesFromData(
          data,
          userPersonage,
          lang
        )
        const loadedShelfItems = loadShelfFromData(data, lang)
        setClothesItems(
          loadedClothesItems.sort((a, b) => b.equipped - a.equipped)
        )
        setShelfItems(loadedShelfItems.sort((a, b) => b.equipped - a.equipped))
        setIsLoading(false)
      })
      .catch((err) => console.log(err))
  }, [])

  const clothesUnequip = async (clothing_id, type, productType) => {
    try {
      setIsLoading(true)
      await handleClothesUnequip(userId, clothing_id, type, productType)
    } catch (err) {
    } finally {
      getInventoryItems(userId)
        .then((data) => {
          // TODO: localize
          const loadedClothesItems = loadClothesFromData(
            data,
            userPersonage,
            lang
          )
          const loadedShelfItems = loadShelfFromData(data, lang)
          setClothesItems(
            loadedClothesItems.sort((a, b) => b.equipped - a.equipped)
          )
          setShelfItems(
            loadedShelfItems.sort((a, b) => b.equipped - a.equipped)
          )
        })
        .finally(() => setTimeout(() => setIsLoading(false), 1000))
    }
  }

  const { refreshData } = useUser()

  const clothesEquip = async (clothing_id, type, productType) => {
    try {
      setIsLoading(true)
      await handleClothesEquip(userId, clothing_id, type, productType)
    } catch (err) {
    } finally {
      getInventoryItems(userId)
        .then((data) => {
          // TODO: localize
          const loadedClothesItems = loadClothesFromData(
            data,
            userPersonage,
            lang
          )
          const loadedShelfItems = loadShelfFromData(data, lang)
          setClothesItems(
            loadedClothesItems
              .sort((a, b) => b.equipped - a.equipped)
              .map((item) => ({ ...item, isPrem: true }))
          )
          setShelfItems(
            loadedShelfItems.sort((a, b) => b.equipped - a.equipped)
          )
        })
        .then(() => refreshData())
        .finally(() => setTimeout(() => setIsLoading(false), 1000))
    }
  }

  const addComplexFilter = ({ filteredValue, filteredField }) => {
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
      console.log(tags, "TAGS")
      const filtered = items.filter((item) => {
        let shouldTake = false
        const isCorrectByTier =
          tiers.length > 0 ? tiers.includes(item.tier) : true
        const isCorrectByTags =
          tags.length > 0 ? item.tag?.some((tag) => tags.includes(tag)) : true

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
      return items.filter((item) => {
        console.log(item)
        item.isPrem === true
      })
    }
  }

  if (isLoading) {
    return
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
      )}
      <div
        style={{ width: "100vw", display: "flex", justifyContent: "center" }}
      >
        <div
          style={{
            background:
              "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 40%)",
            padding: "20px 0px 30px 0px",
            bottom: "0%",
            zIndex: "5",
            position: " fixed",
            width: "90vw",
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
            }}
          />
        </div>
      </div>
      {!isLoading && (
        <GridLayout
          setCurrentItem={setCurrentItem}
          items={applyFilter(
            [...clothesItems, ...shelfItems].sort(
              (a, b) => b.equipped - a.equipped
            )
          )}
          clothesUnequip={clothesUnequip}
          clothesEquip={clothesEquip}
          lang={lang}
        />
      )}
    </ScreenContainer>
  )
}

export default InventoryTab
