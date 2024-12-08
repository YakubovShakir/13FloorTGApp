import { useState, useEffect, useContext } from "react"
import Assets from "../../../assets"
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer"
import ItemCard from "../../../components/simple/ItemCard/ItemCard"
import { getFoods } from "../../../services/food/food"
import { getProcesses, startProcess } from "../../../services/process/process"
import { getParameters, getShopItems } from "../../../services/user/user"
import formatTime from "../../../utils/formatTime"
import Button from "../../../components/simple/Button/Button"
import Modal from "../../../components/complex/Modals/Modal/Modal"
import { motion, AnimatePresence } from 'framer-motion';
import UserContext from "../../../UserContext"
import { FullScreenSpinner } from "../../Home/Home"

const SquareButton = ({
  handlePress,
  assignedValue,
  selectedValue,
  imageSrc,
  size = 60,
  imageSize = 40
}) => {
  const isSelected =
    assignedValue && selectedValue && assignedValue === selectedValue;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 10 }}
      style={{
        backgroundColor: isSelected ? "#E94E1B" : "#453D3F",
        height: size + 5,
        width: size,
        borderRadius: 8,
        position: 'relative', // Ensure proper stacking
      }}
      onClick={handlePress}
    >
      {/* Persistent Shadow */}
      {isSelected &&
        <motion.div transition={{ type: "spring", stiffness: 300, damping: 10 }}>
          <img
            src={Assets.Layers.squareButtonShadow}
            width={42}
            height={42}
            style={{
              position: 'absolute',
              bottom: 0,
              left: -1,
              zIndex: 5,
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8
            }}
          />
        </motion.div>}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: 1,
          backgroundColor: "#595254"
        }}
        transition={{
          duration: 0.3,
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        style={{
          height: size + 2,
          width: size + 2,
          marginLeft: -2,
          marginTop: -2,
          borderRadius: 8,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <motion.img
          src={imageSrc}
          width={imageSize}
          height={imageSize}
          animate={{
            opacity: 1,
            rotate: 0,
            scale: isSelected ? 0.9 : 1,
            filter: isSelected ? 'brightness(0.8)' : 'brightness(1)'
          }}
          transition={{
            duration: 0.3,
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
          style={{
            position: 'relative',
            zIndex: 3
          }}
        />
      </motion.div>
    </motion.div>
  );
};

const GridItem = ({ icon, title, price, available = true, respect = 100 }) => {
  return (

    <div style={{
      padding: '1rem',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexDirection: 'column',
      }}>
    <div>
          <div style={{ height: 40, width: '100%', display: 'flex', justifyContent: 'center'}}>
            <p style={{ color: 'white', textAlign: 'center', fontWeight: '100', fontFamily: 'Roboto', width: '80%',  }}>{title}</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
            <img src={Assets.Icons.respect} height={13} />
            <p style={{ color: 'white', textAlign: 'center', fontWeight: '100', fontFamily: 'Roboto', paddingLeft: 8 }}>{respect}</p>
          </div>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div style={{
            height: '109px',
            width: '109px',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#534B4E',
            marginTop: -5.5
          }}>
            <img src={icon} alt={title} style={{ width: 109, height: 109 }} />
          </div>
        </motion.div>
        <Button width={109} height={44} active={available} icon={available ? Assets.Icons.balance : null} fontFamily={'Roboto'} fontWeight={'300'} text={available ? price : 'Недоступно'} fontSize={14} paddingTop={1} />
      </div>
    </div>

  );
};

const GridLayout = ({ setCurrentItem, items }) => {
  return (
    <div style={{ width: '100vw', display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', width: '95vw' }}>
        {items.map((item, index) => (
          <GridItem key={index} icon={item.image} title={item.name} price={item.price} respect={item.respect} available={item.available} />
        ))}
      </div>
    </div>
  );
};

const CoinsTab = ({ userId }) => {
  const [userEatingFoods, setUserEatingFoods] = useState(null)
  const [foods, setFoods] = useState(null)
  const [shopItems, setShopItems] = useState(null)
  const [filterTypeInUse, setFilterTypeInUse] = useState(null)
  const [currentItem, setCurrentItem] = useState(null)
  const [clothesItems, setClothesItems] = useState(null)
  const [shelfItems, setShelfItems] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const { userPersonage, userParameters } = useContext(UserContext)

  const BaseFilters = {
    // Uses Clothing
    Hat: 'Hat',
    Top: 'Top',
    Pants: 'Pants',
    Shoes: 'Shoes',
    Accessories: 'Accessory',
    // Uses ShelfItems
    Shelf: 'Shelf',
    Complex: 'Complex'
  }

  const TierFilters = [0, 1, 2, 3, 4, 5]

  useEffect(() => {
    console.log('Inside Coins tab')
    getShopItems(userId).then(data => {
      // TODO: localize
      const loadedClothesItems = data.clothing.map(item => ({ name: item.name['ru'], image: userPersonage.gender === 'male' ? item.male_icon : item.female_icon, price: item.price, respect: item.respect, tier: item.tier, tags: item.tag, category: item.type, available: userParameters.balance >= item.price }))
      setClothesItems(loadedClothesItems)
      console.log('Clothes Items', clothesItems)
    }).finally(() => setIsLoading(false))
    // getFoods().then((r) => setFoods(r))
    // getProcesses("food", userId).then((r) => setUserEatingFoods(r))
    // updateInformation()
  }, [])

  const applyFilter = (items) => {
    if(!filterTypeInUse || filterTypeInUse === BaseFilters.Complex || filterTypeInUse === BaseFilters.Shelf) {
      return items
    }

    if(filterTypeInUse === BaseFilters.Hat) {
      return items.filter(item => item.category === 'Hat')
    }

    if(filterTypeInUse === BaseFilters.Top) {
      return items.filter(item => item.category === 'Top')
    }

    if(filterTypeInUse === BaseFilters.Pants) {
      return items.filter(item => item.category === 'Pants')
    }

    if(filterTypeInUse === BaseFilters.Shoes) {
      return items.filter(item => item.category === 'Pants')
    }

    if(filterTypeInUse === BaseFilters.Accessories) {
      return items.filter(item => item.category === 'Accessory')
    }

    // if(filterTypeInUse === BaseFilters.Shelf) {
    //   return items.filter(item => item.category === 'Shelf')
    // }
  }

  if(isLoading) {
    return <FullScreenSpinner/>
  }

  return (
    <ScreenContainer withTab>
      <div style={{ width: '100vw', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '95vw', display: 'flex', justifyContent: 'space-around' }}>
          <SquareButton
            size={42}
            imageH={35}
            imageSrc={Assets.Icons.settingsIcon}
            assignedValue={BaseFilters.Complex}
            selectedValue={filterTypeInUse}
            handlePress={() => filterTypeInUse === BaseFilters.Complex ? setFilterTypeInUse(null) : setFilterTypeInUse(BaseFilters.Complex)}
          />
          <SquareButton
            size={42}
            imageSize={42}
            imageSrc={Assets.Icons.hairIcon}
            selectedValue={filterTypeInUse}
            assignedValue={BaseFilters.Hat}
            handlePress={() => filterTypeInUse === BaseFilters.Hat ? setFilterTypeInUse(null) : setFilterTypeInUse(BaseFilters.Hat)}
          />
          <SquareButton
            size={42}
            imageSize={30}
            imageSrc={Assets.Icons.bodyIcon}
            selectedValue={filterTypeInUse}
            assignedValue={BaseFilters.Top}
            handlePress={() => filterTypeInUse === BaseFilters.Top ? setFilterTypeInUse(null) : setFilterTypeInUse(BaseFilters.Top)}
          />
          <SquareButton
            size={42}
            imageSize={28}
            imageSrc={Assets.Icons.legsIcon}
            selectedValue={filterTypeInUse}
            assignedValue={BaseFilters.Pants}
            handlePress={() => filterTypeInUse === BaseFilters.Pants ? setFilterTypeInUse(null) : setFilterTypeInUse(BaseFilters.Pants)}
          />
          <SquareButton
            size={42}
            imageSize={35}
            imageSrc={Assets.Icons.shoesIcon}
            assignedValue={BaseFilters.Shoes}
            selectedValue={filterTypeInUse}
            handlePress={() => filterTypeInUse === BaseFilters.Shoes ? setFilterTypeInUse(null) : setFilterTypeInUse(BaseFilters.Shoes)}
          />
          <SquareButton
            size={42}
            imageSize={28}
            imageSrc={Assets.Icons.accIcon}
            selectedValue={filterTypeInUse}
            assignedValue={BaseFilters.Accessories}
            handlePress={() => filterTypeInUse === BaseFilters.Accessories ? setFilterTypeInUse(null) : setFilterTypeInUse(BaseFilters.Accessories)}
          />
          <SquareButton
            size={42}
            imageSize={30}
            imageSrc={Assets.Icons.homeIcon}
            selectedValue={filterTypeInUse}
            assignedValue={BaseFilters.Shelf}
            handlePress={() => filterTypeInUse === BaseFilters.Shelf ? setFilterTypeInUse(null) : setFilterTypeInUse(BaseFilters.Shelf)}
          />
        </div>
      </div>
      <GridLayout setCurrentItem={setCurrentItem} items={applyFilter(clothesItems)}/>
      {currentItem && <Modal width={'100vw'} bottom={'-25vh'} height={'100vh'} data={{ title: 'Lol' }} />}
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

export default CoinsTab
