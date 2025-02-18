import "./ItemCardLeaderBoard.css"
import { motion } from "framer-motion"
import Button from "../Button/Button"
import { useEffect, useState } from "react"
import Assets from "../../../assets"
import { useSettingsProvider } from "../../../hooks"

const { Icons } = Assets
const { Images } = Assets
const ItemCard = ({
  ItemTitle,
  ItemParamsBlocks,
  ItemButtons,
  ItemIndex,
  ItemDescription,
  ItemAmount = undefined,
  ItemNumberLeader,
  ItemTotalEarned,
  ItemRespect,
  ItemGender,
  ItemUsername
}) => {
  // Определяем, активна ли хотя бы одна кнопка
  const isAnyButtonActive = ItemButtons.some((button) => button.active)

  const { lang } = useSettingsProvider()
  const translations = {
    anonUser: {
      en: 'Anonymous player',
      ru: 'Анонимный игрок'
    }
  }

  // Логика для установки обводки
  let borderStyle = "" // Стандартный цвет обводки (неактивная кнопка)
  let backgroundImageStyle = "" // Стиль фона
  let backgroundColor = "" // Цвет фона по умолчанию

  // Логика для обесцвечивания изображений
  const isImageGrayscale = !isAnyButtonActive // Если кнопка неактивна, изображение будет обесцвечено
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 * (ItemIndex + 1) }}
      className="ItemCardLeader"
      // Применяем обводку в зависимости от состояния
    >
      <div className="ItemDataLeader">
        <span className="ItemNuberLeader">{ItemNumberLeader}</span>
        <div className="WireframeGridLeader"></div> {/* Добавлено сюда */}
        {/* ItemIcon Section */}
        <div
          className="ItemIconContainerLeader"
          style={{ border: borderStyle, backgroundImage: backgroundImageStyle }}
        >
          {/* {ItemTitle Section} */}
          <div className="ItemTitleLeader"></div>
          <img
            loading="lazy"
            src={ItemGender === 'female' ? Images.womanAva : Images.manAva}
            alt="ItemIconLeader"
            className={isImageGrayscale ? "inactiveLeader" : ""} // Применяем 'inactive' если кнопка неактивна
          />
        </div>
        {/* Right Section: ItemParams + ItemButtons */}
        <div
          className="ItemDetailsContainerLeader"
          style={{ border: borderStyle, backgroundColor: backgroundColor }}
        >
          {ItemTitle === '' ? translations.anonUser[lang] : ItemTitle}
          {/* ItemParams Section */}
          <div className="ItemCardParamsLeader">
            {ItemDescription && (
              <span className="ItemDescriptionMoney">
                <img
                  src={Icons.balance}
                  alt="Coin"
                  style={{ width: "25px", marginRight: "10px" }}
                />
                {ItemTotalEarned}
              </span>
            )}
            {ItemDescription && (
              <span className="ItemDescriptionRespect">
                <img
                  src={Icons.respect}
                  alt="Coin"
                  style={{ width: "25px", marginRight: "5px" }}
                />
                {ItemRespect}
              </span>
            )}

            {ItemParamsBlocks?.map((param, index) => (
              <div key={index} className="ItemCardParamLeader">
                {param.map((block, blockIndex) => (
                  <span
                    className="ItemCardParamBlockLeader"
                    key={blockIndex}
                    style={{
                      width: param.length > 1 ? "50%" : "100%",
                      marginTop: 5,
                      backgroundColor: backgroundColor,
                    }}
                  >
                    {block?.fillPercent && (
                      <span
                        style={{
                          width: block?.fillPercent + "%",
                          background:
                            block?.fillBackground ||
                            "linear-gradient(90deg, rgba(233, 78, 27, 1) 0%, rgba(243, 117, 0, 1) 50%)",
                        }}
                      />
                    )}
                    <img src={Icons.balance} alt="Coin" />
                    <p>{block.value}</p>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* ItemButtons Section */}
        {/* <div className="ItemCardButtonsLeader">
            {ItemButtons.map((ItemButton, index) => (
              <Button
                key={index}
                width="100%"
                height={44}
                fontSize={16}
                fontFamily={"Anonymous pro"}
                color={ItemButton?.color || "rgb(255, 255, 255)"}
                onClick={() => {
                  if (ItemButton.icon === Assets.Icons.starsIcon) {
                    ItemButton?.onClick && ItemButton.onClick();
                  } else {
                    ItemButton?.onClick && ItemButton.onClick();
                  }
                }}
                active={ItemButton.active}
                text={ItemButton.text}
                icon={ItemButton.icon}
                bgColor={ItemButton?.bg}
                ownColor={ItemButton?.color}
                shadowColor={ItemButton?.shadowColor}
                borderColor={ItemButton?.borderColor}
              />
            ))}
          </div> */}
      </div>
    </motion.div>
  )
}

export default ItemCard
