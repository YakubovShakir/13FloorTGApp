import { useState, useEffect } from "react"
import Assets from "../../../assets"
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer"
import ItemCard from "../../../components/simple/ItemCard/ItemCard"
import { getFoods } from "../../../services/food/food"
import { getProcesses, startProcess } from "../../../services/process/process"
import { getParameters } from "../../../services/user/user"
import formatTime from "../../../utils/formatTime"
import Button from "../../../components/simple/Button/Button"
import Modal from "../../../components/complex/Modals/Modal/Modal"

const SquareButton = ({
  handlePress,
  assignedValue,
  selectedValue,
  imageSrc,
  size,
  imageSize
}) => {
  const isSelected =
    assignedValue && selectedValue && assignedValue === selectedValue

  return (

    <div
      style={{
        backgroundColor: isSelected ? "#E94E1B" : "#453D3F",
        height: size + 5,
        width: size,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
      }}
      onClick={handlePress}
    >
      <div
        style={{
          backgroundColor: "#595254",
          height: size + 2,
          width: size + 2,
          marginLeft: -2,
          marginTop: -2,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative', // Add relative positioning to the parent div
        }}
      >
        <img
          src={imageSrc}
          width={imageSize}
          height={imageSize}
          style={{
            position: 'relative',
            zIndex: 1 // Lower z-index for the main image
          }}
        />

        {isSelected === true && (
          <img
            src={Assets.Layers.squareButtonShadow}
            style={{
              position: "absolute",
              zIndex: 3, // Higher z-index to ensure it's on top
              left: 0, // Ensure it's centered
              right: 0,
              margin: 'auto', // Center the shadow horizontally
            }}
            width={size}
            height={size}
          />
        )}
      </div>
    </div>
  )
}

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
          <p style={{ color: 'white', textAlign: 'center', fontWeight: '100', fontFamily: 'Roboto' }}>{title}</p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 4 }}>
            <img src={Assets.Icons.respect} height={13} />
            <p style={{ color: 'white', textAlign: 'center', fontWeight: '100', fontFamily: 'Roboto' }}>{respect}</p>
          </div>
        </div>
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
        <Button width={109} height={44} active={available} icon={available ? Assets.Icons.balance : null} fontFamily={'Roboto'} fontWeight={'300'} text={available ? price : 'Недоступно'} fontSize={14} paddingTop={1} />
      </div>
    </div>
  );
};

const GridLayout = ({ setCurrentItem }) => {
  const items = [
    { icon: 'https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/clothes/0/Body/GrimeTank-m-icon.png', title: 'Синія Толстовка', price: 4500 },
    { icon: 'https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/clothes/0/Body/GrimeTank-m-icon.png', title: 'Майка Алкогольна', price: 200 },
    { icon: 'https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/clothes/0/Body/GrimeTank-m-icon.png', title: 'Синія Толстовка', price: 4500 },
    { icon: 'https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/clothes/0/Body/GrimeTank-m-icon.png', title: 'Майка Алкогольна', price: 200 },
    { icon: 'https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/clothes/0/Body/GrimeTank-m-icon.png', title: 'Майка Алкогольна', price: 200 },
  ];

  return (
    <div style={{ width: '100vw', display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', width: '95vw' }}>
        {items.map((item, index) => (
          <GridItem key={index} icon={item.icon} title={item.title} price={item.price} />
        ))}
      </div>
    </div>
  );
};

const CoinsTab = ({ userId, userParameters, setUserParameters }) => {
  const [userEatingFoods, setUserEatingFoods] = useState(null)
  const [foods, setFoods] = useState(null)
  const [shopItems, setShopItems] = useState(null)
  const [filterTypeInUse, setFilterTypeInUse] = useState(null)
  const [currentItem, setCurrentItem] = useState(null)

  const BaseFilters = {
    // Uses Clothing
    Hat: 'Hat',
    Top: 'Top',
    Pants: 'Pants',
    Shoes: 'Shoes',
    Accessories: 'Accessories',
    // Uses ShelfItems
    Shelf: 'Shelf',
    Complex: 'Complex'
  }

  const TierFilters = [0, 1, 2, 3, 4, 5]

  useEffect(() => {
    // getFoods().then((r) => setFoods(r))
    // getProcesses("food", userId).then((r) => setUserEatingFoods(r))
    // updateInformation()
  }, [])

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
      <GridLayout setCurrentItem={setCurrentItem} />
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
