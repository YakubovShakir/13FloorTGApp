import "./CareStore.css"
import { useState } from "react"
import IconButton from "../../simple/IconButton/IconButton"
import Assets from "../../../assets"
import Button from "../../simple/Button/Button"
import Modal from "../Modals/Modal/Modal"
const CareStore = () => {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(null)
  const [visibleFilterModal, setVIsibleFilterModal] = useState(false)
  const [activeLevelFilter, setActiveLevelFilter] = useState(null)
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(null)

  const filterLevels = [1, 2, 3, 4, 5, 6]
  const filterCategories = ["Кежуал", "Спорт", "NFT", "Ивент"]
  const filterModal = (
    <div className="CareStoreFilterModal">
      <div>
        <div className="CareStoreFilterModalBlock">
          <div>Уровень одежды</div>
          {filterLevels.map((level, index) => (
            <span
              key={index}
              onClick={() => setActiveLevelFilter(index)}
              style={{
                backgroundColor: index === activeLevelFilter && "#FCBA04",
              }}
            >
              Уровень {level}
            </span>
          ))}
        </div>
        <div className="CareStoreFilterModalBlock">
          <div>Категория</div>
          {filterCategories.map((cat, index) => (
            <span
              key={index}
              onClick={() => setActiveCategoryFilter(index)}
              style={{
                backgroundColor: index === activeCategoryFilter && "#FCBA04",
              }}
            >
              {cat}
            </span>
          ))}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          height: "10%",
        }}
      >
        <Button
          active={false}
          text={"Сбросить"}
          width={"45%"}
          height={"100%"}
        />
        <Button
          active={true}
          text={"Применить"}
          width={"45%"}
          height={"100%"}
        />
      </div>
    </div>
  )
  const { Icons } = Assets
  const categories = [
    { icon: Icons.filter, text: "Фильтры" },
    { icon: Icons.cap, text: "Голова" },
    { icon: Icons.jacket, text: "Тело" },
    { icon: Icons.pants, text: "Ноги" },
    { icon: Icons.storeShoes, text: "Обувь" },
    { icon: Icons.headphones, text: "Аксессуары" },
    { icon: Icons.broom, text: "Для дома" },
  ]

  const items = [
    {
      type: "pants",
      title: "Джинсы",
      tags: ["Тег1", "Тег2", "Тег3"],
      icon: Icons.jeans,
      rep: 200,
      cost: 400,
    },
    {
      type: "pants",
      title: "Джинсы",
      tags: ["Тег1", "Тег2", "Тег3"],
      icon: Icons.jeans,
      rep: 200,
      cost: 400,
    },
    {
      type: "pants",
      title: "Джинсы",
      tags: ["Тег1", "Тег2", "Тег3"],
      icon: Icons.jeans,
      rep: 200,
      cost: 400,
    },
    {
      type: "pants",
      title: "Джинсы",
      tags: ["Тег1", "Тег2", "Тег3"],
      icon: Icons.jeans,
      rep: 200,
      cost: 400,
    },
    {
      type: "pants",
      title: "Джинсы",
      tags: ["Тег1", "Тег2", "Тег3"],
      icon: Icons.jeans,
      rep: 200,
      cost: 400,
    },
    {
      type: "pants",
      title: "Джинсы",
      tags: ["Тег1", "Тег2", "Тег3"],
      icon: Icons.jeans,
      rep: 200,
      cost: 400,
    },
  ]
  return (
    <div className="CareStore">
      {visibleFilterModal && (
        <Modal
          title={"Фильтры"}
          width={"90%"}
          height={"70%"}
          left={"5%"}
          top={"10%"}
          data={() => filterModal}
          onClose={() => setVIsibleFilterModal(false)}
        />
      )}
      <div className="CareStoreCategories">
        {categories.map((cat, index) => (
          <IconButton
            key={index}
            color={"#2c1402"}
            icon={cat.icon}
            title={cat.text}
            onClick={() =>
              index === 0
                ? setVIsibleFilterModal(true)
                : setActiveCategoryIndex(index)
            }
            bgTextColor={index === activeCategoryIndex && "#FCBA04"}
          />
        ))}
      </div>
      <div className="CareStoreCollection">
        {items.map((item, index) => (
          <div key={index} className="CareStoreCollectionItem">
            <div className="CareStoreCollectionItemTitle">
              <span>{item.title}</span>
              <span>
                <img src={Icons.respect} alt="respect" />
                {item.rep}
              </span>
            </div>
            <div className="CareStoreCollectionItemTags">
              {item.tags.map((tag, index) => (
                <span key={index}>{tag}</span>
              ))}
            </div>
            <img
              className="CareStoreCollectionItemIMG"
              src={item.icon}
              alt="Icon"
            />
            <Button
              width={"90%"}
              height={"15%"}
              text={item.cost}
              icon={Icons.balance}
              bgColor={"#00C200"}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default CareStore
