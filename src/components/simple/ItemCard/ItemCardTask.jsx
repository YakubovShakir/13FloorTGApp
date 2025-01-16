import "./ItemCardTask.css";
import { motion } from "framer-motion";
import Button from "../Button/Button";
import { useEffect, useState } from "react";
import Assets from "../../../assets";

const ItemCard = ({
  ItemIcon,
  ItemTitle,
  ItemParamsBlocks,
  ItemButtons,
  ItemIndex,
  ItemDescription,
  ItemAmount = undefined,
  ItemBottomAmount,
  isWaiting = false, // Это флаг ожидания
  handleStarsBuy
}) => {
  // Определяем, активна ли хотя бы одна кнопка
  const isAnyButtonActive = ItemButtons.some(button => button.active);

// Логика для установки обводки
let borderStyle = ""; // Стандартный цвет обводки (неактивная кнопка)
let backgroundImageStyle = ""; // Стиль фона
let backgroundColor = ""; // Цвет фона по умолчанию

if (isWaiting) {
  borderStyle = "1px solid rgb(46, 199, 115)"; // Если в ожидании, зелёная обводка
  backgroundImageStyle = ""; // Если в ожидании, не применяем фоновый стиль
} else if (isAnyButtonActive) {
  borderStyle = ""; // Если хотя бы одна кнопка активна, оранжевая обводка
  backgroundImageStyle = ""; // Если кнопка активна, не применяем фоновый стиль
} else {
  // При обесцвечивании (когда кнопка неактивна)
  // borderStyle = "1px solid rgb(57, 57, 57)"; // Стиль обводки для обесцвеченного состояния
  // backgroundImageStyle = "repeating-linear-gradient(to right, transparent, transparent 19px, rgb(99 89 80 / 30%) 20px), repeating-linear-gradient(to bottom, transparent, transparent 19px, rgb(103 93 84 / 30%) 20px)"; // Стиль фона при обесцвечивании
  // backgroundColor = "#2525257a"
}

// Логика для обесцвечивания изображений
const isImageGrayscale = !isAnyButtonActive; // Если кнопка неактивна, изображение будет обесцвечено
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 * (ItemIndex + 1) }}
      className="ItemCardTask"
       // Применяем обводку в зависимости от состояния
    >
      {ItemAmount && (
        <div className="ItemCardAmountTask" style={{ color: 'white' }}>{ItemAmount}</div>
      )}

      <div className="ItemDataTask">
        <div className="WireframeGridTask"></div> {/* Добавлено сюда */}
        {/* ItemIcon Section */}
        <div className="ItemIconContainerTask"
        style={{ border: borderStyle, backgroundImage: backgroundImageStyle }}
        >
          {/* {ItemTitle Section} */}
          <div className="ItemTitleTask"></div>
          <img
            loading="lazy"
            src={ItemIcon}
            alt="ItemIconTask"
            className={isImageGrayscale ? 'inactiveTask' : ''}  // Применяем 'inactive' если кнопка неактивна
          />
          <div className="ItemTitleTask" style={{ paddingTop: 8 }}>{ItemBottomAmount}</div>
        </div>

        {/* Right Section: ItemParams + ItemButtons */}
        <div className="ItemDetailsContainerTask"
        style={{ border: borderStyle,backgroundColor: backgroundColor }}

        
        >
          
          {/* ItemParams Section */}
          <div className="ItemCardParamsTask">
          {ItemTitle}
            {ItemDescription && (
              <span className="ItemDescriptionTask">
                {ItemDescription}
              </span>
            )}
            {ItemParamsBlocks?.map((param, index) => (
              <div key={index} className="ItemCardParamTask">
                {param.map((block, blockIndex) => (
                  <span
                    className="ItemCardParamBlockTask"
                    
                    key={blockIndex}
                    style={{ width: param.length > 1 ? "50%" : "100%", marginTop: 5 , backgroundColor: backgroundColor}}
                    
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
                    <img src={block.icon} alt="paramIconTask" />
                    <p>{block.value}</p>
                  </span>
                ))}
              </div>
            ))}
          </div>

          
        </div>

{/* ItemButtons Section */}
<div className="ItemCardButtonsTask">
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
          </div>
        
      </div>
    </motion.div>
  );
};

export default ItemCard;
