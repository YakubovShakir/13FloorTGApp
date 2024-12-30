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
  handleClothesEquip
} from "../../../services/user/user"
import formatTime from "../../../utils/formatTime"
import Button from "../../../components/simple/Button/Button"
import Modal from "../../../components/complex/Modals/Modal/Modal"
import { motion, AnimatePresence, complex } from "framer-motion"
import UserContext from "../../../UserContext"
import { FullScreenSpinner } from "../../Home/Home"
import FilterModal from "../../../components/complex/FilterModal/FilterModal"
import { SquareButton } from '../../../components/simple/SquareButton/SquareButton'

const GridItem = ({
  icon,
  title,
  price,
  available = true,
  respect,
  equipped,
  clothesUnequip,
  clothesEquip,
  clothingId,
  type,
  productType
}) => {
  return (
    <div
      className="clothing-item-container" // Основной контейнер элемента одежды
      style={{
        padding: "0rem",
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
          border: "solid 1px rgb(243, 117, 0)",
          margin: "7px 0px 7px 0px",
          borderRadius: "7px",
          backgroundImage: "repeating-linear-gradient(to right, transparent, transparent 19px, rgba(243, 117, 0, 0.3) 20px), repeating-linear-gradient(to bottom, transparent, transparent 19px, rgba(243, 117, 0, 0.3) 20px)",
          justifyContent: "center",

          
        }}
      >
        {/* Заголовок и Иконка */}
        <div className="clothing-item-header">
          <div
           
          >
           
          </div>
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
          
          border: "solid 1px rgb(243 117 0 / 18%)",
          
          borderRadius: "7px",
          backgroundColor: "rgb(67 14 7 / 48%)",
        }}
      >

<p
              style={{
                padding: "10px 5px 0px 5px",
                height: "45px",
                color: "white",
                textAlign: "center",
                fontWeight: "100",
                fontFamily: "Anonymous pro",
                width: "100%",
              }}
            >
              {title}
            </p>
        {/* Уровень уважения */}
        
        {respect !== undefined ? (
          <div
          className="clothing-item-respect"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          <img src={Assets.Icons.respect} height={22} />
          <p
            style={{
              color: "white",
              textAlign: "center",
              fontWeight: "100",
              fontFamily: "Anonymous pro",
              paddingLeft: 8,
              fontSize: "20px",
            }}
          >
           + {respect}
          </p>
        </div>
        ) : (  <div
          className="clothing-item-respect"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 10,
            marginBottom: 10,
            height: 22
          }}
        ></div>)}

        {/* Кнопки действий */}
        {equipped ? (
          <Button
            className="clothing-item-unequip-button"
            shadowColor={"rgba(243, 117, 0, 0)"}
            width={"88%"}
            marginBottom={"5"}
            height={44}
            active={equipped}
            fontFamily={"Anonymous pro"}
            fontWeight={"300"}
            text={"Используется"}
            fontSize={14}
            paddingTop={1}
            borderColor={"rgba(243, 117, 0, 0)"}
            color={"rgba(243, 117, 0, 1)"}
            ownColor={"rgb(166, 0, 243)"}
            bgColor={"rgba(126, 86, 49, 0)"}
            onClick={() => type === 'Accessory' || productType === 'shelf' ? clothesUnequip(clothingId, type, productType) : null}
          />
        ) : (
          <Button
            className="clothing-item-equip-button"
            shadowColor={"rgb(243, 117, 0"}
            width={"88%"}
            marginBottom={"5"}
            height={44}
            active={true}
            fontFamily={"Anonymous pro"}
            fontWeight={"300"}
            text={"Выбрать"}
            color={"rgb(255, 255, 255)"}
            fontSize={14}
            paddingTop={1}
            ownColor={"linear-gradient(rgb(18, 4, 2) 0%, rgba(243, 117, 0, 0.2) 100%)"}
            bgColor={"linear-gradient(rgb(18, 4, 2) 0%, rgba(243, 117, 0, 0.2) 100%)"}
            onClick={() => clothesEquip(clothingId, type, productType)}
          />
        )}
      </div>
    </div>
  );
};



const GridLayout = ({ setCurrentItem, items, clothesUnequip, clothesEquip }) => {
  return (
    <div
      style={{
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        paddingTop: 12,
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
            clothesEquip={clothesEquip}
            clothingId={item.clothing_id}
            type={item.category}
            productType={item.productType}
          />
        ))}
      </div>
    </div>
  )
}

const loadClothesFromData = (data, userPersonage) => {
  return data.clothes.map((item) => ({
    clothing_id: item.clothing_id,
    name: item.name["ru"],
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
    productType: 'clothes'
  }))
}

const loadShelfFromData = (data) => {
  return data.shelf.map(item => ({
    clothing_id: item.id,
    name: item.name["ru"],
    image: item.link,
    price: item.price,
    respect: item.respect,
    tier: item.tier,
    tags: item.tag,
    category: item.type,
    equipped: Object.values(data.currentlyUsedShelf).includes(
      item.id
    ),
    productType: 'shelf'
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
}

const InventoryTab = ({ userId }) => {
  const [filterTypeInUse, setFilterTypeInUse] = useState(null)
  const [currentItem, setCurrentItem] = useState(null)
  const [clothesItems, setClothesItems] = useState(null)
  const [shelfItems, setShelfItems] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [currentComplexFilters, setCurrentComplexFilters] = useState([])
  console.log('sss', currentComplexFilters)
  const { userPersonage, userParameters } = useContext(UserContext)

  useEffect(() => {
    getInventoryItems(userId)
      .then((data) => {
        // TODO: localize
        const loadedClothesItems = loadClothesFromData(data, userPersonage)
        const loadedShelfItems = loadShelfFromData(data)
        console.log(loadedShelfItems)
        setClothesItems(
          loadedClothesItems.sort((a, b) => b.equipped - a.equipped)
        )
        setShelfItems(
          loadedShelfItems.sort((a, b) => b.equipped - a.equipped)
        )
      })
      .finally(() => setIsLoading(false))
  }, [])

  const clothesUnequip = async (clothing_id, type, productType) => {
    try {
      setIsLoading(true)
      await handleClothesUnequip(userId, clothing_id, type, productType)
    } catch(err) {
      
    } finally {
      getInventoryItems(userId)
      .then((data) => {
        // TODO: localize
        const loadedClothesItems = loadClothesFromData(data, userPersonage)
        const loadedShelfItems = loadShelfFromData(data)
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

  const clothesEquip = async (clothing_id, type, productType) => {
    try {
      setIsLoading(true)
      await handleClothesEquip(userId, clothing_id, type, productType)
    } catch(err) {
      
    } finally {
      getInventoryItems(userId)
      .then((data) => {
        // TODO: localize
        const loadedClothesItems = loadClothesFromData(data, userPersonage)
        const loadedShelfItems = loadShelfFromData(data)
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

  const addComplexFilter = ({ filteredValue, filteredField }) => {
    console.log('filters', currentComplexFilters)
    setCurrentComplexFilters([...currentComplexFilters, { filteredField, filteredValue }]);
  };
  
  const removeComplexFilter = ({ filteredValue, filteredField }) => {
    setCurrentComplexFilters(
      currentComplexFilters.filter(
        (filter) => filter.filteredField !== filteredField || filter.filteredValue !== filteredValue
      )
    );
  };


  const applyFilter = (items) => {
    if (
      !filterTypeInUse
    ) {
      return items
    }

    if(filterTypeInUse === BaseFilters.Complex) {
      if(!currentComplexFilters || currentComplexFilters.length === 0) {
        return items
      }

      const tags = currentComplexFilters.filter(filter => filter.filteredField === 'tag').map(filter => filter.filteredValue)
      const tiers = currentComplexFilters.filter(filter => filter.filteredField === 'tier').map(filter => filter.filteredValue)

      const filtered = items.filter(item => {
        let shouldTake = false
        const isCorrectByTier = tiers.length > 0 ? tiers.includes(item.tier) : true
        const isCorrectByTags = tags.length > 0 ? item.tags.some(tag => tags.includes(tag)) : true

        if(isCorrectByTier && isCorrectByTags){
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
  }

  if (isLoading) {
    return <FullScreenSpinner />
  }

  return (
    <ScreenContainer withTab>
      {isFilterModalOpen && <FilterModal baseStyles={{ position: 'fixed', height: '100vh', width: '100vw', backgroundColor: 'black', zIndex: 10, top: 0, left: 0 }} addComplexFilter={addComplexFilter} removeComplexFilter={removeComplexFilter} setIsFilterModalOpen={setIsFilterModalOpen} currentComplexFilters={currentComplexFilters} />}
      <div
        style={{ width: "100vw", display: "flex", justifyContent: "center" }}
      >
        <div
          style={{
            width: "90vw",
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          <SquareButton
            size={42}
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
            size={42}
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
            size={42}
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
            size={42}
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
            size={42}
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
            size={42}
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
            size={42}
            imageSize={30}
            imageSrc={Assets.Icons.homeIcon}
            selectedValue={filterTypeInUse}
            assignedValue={BaseFilters.Shelf}
            handlePress={() =>
              {
                setCurrentComplexFilters([])
                filterTypeInUse === BaseFilters.Shelf
                  ? setFilterTypeInUse(null)
                  : setFilterTypeInUse(BaseFilters.Shelf) 
              }
            }
          />
        </div>
      </div>
      <GridLayout
        setCurrentItem={setCurrentItem}
        items={applyFilter([...clothesItems, ...shelfItems].sort((a, b) => b.equipped - a.equipped))}
        clothesUnequip={clothesUnequip}
        clothesEquip={clothesEquip}
      />
      {currentItem && (
        <Modal
          width={"100vw"}
          bottom={"-25vh"}
          height={"100vh"}
          data={{ title: "Lol" }}
        />
      )}
      {/* {foods?.map((food, index) => (
        <ItemCard
          key={index}
          ItemIcon={food?.link}
          ItemTitle={food?.name}
          ItemParamsBlocks={getItemFoodParams(food)}
          ItemButtons={getItemFoodButton(food)}
          ItemIndex={index}
        />
      ))} */}
    </ScreenContainer>
  )
}

export default InventoryTab