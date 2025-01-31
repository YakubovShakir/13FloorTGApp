import "./ItemCard.css";
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
      className="ItemCard"
       // Применяем обводку в зависимости от состояния
    >
      {ItemAmount && (
        <div className="ItemCardAmount" style={{ color: 'white' }}>{ItemAmount}</div>
      )}

      <div className="ItemData">
        <div className="WireframeGrid"></div> {/* Добавлено сюда */}
        {/* ItemIcon Section */}
        <div className="ItemIconContainer"
        style={{ border: borderStyle, backgroundImage: backgroundImageStyle }}
        >
          {/* {ItemTitle Section} */}
          <div className="ItemTitle">{ItemTitle}</div>
          <img
            loading="lazy"
            src={ItemIcon}
            alt="ItemIcon"
            className={isImageGrayscale ? 'inactive' : ''}  // Применяем 'inactive' если кнопка неактивна
          />
          <div className="ItemTitle" style={{ paddingTop: 8 }}>{ItemBottomAmount}</div>
        </div>

        {/* Right Section: ItemParams + ItemButtons */}
        <div className="ItemDetailsContainer"
        style={{ border: borderStyle,backgroundColor: backgroundColor }}

        
        >
          
          {/* ItemParams Section */}
          <div className="ItemCardParams">
            {ItemDescription && (
              <span className="ItemDescription">
                {ItemDescription}
              </span>
            )}
            {ItemParamsBlocks?.map((param, index) => (
              <div key={index} className="ItemCardParam">
                {param.map((block, blockIndex) => (
                  <span
                    className="ItemCardParamBlock"
                    
                    key={blockIndex}
                    style={{ width: param.length > 1 ? "50%" : "100%", marginTop: 5 , backgroundColor: backgroundColor}}
                    
                  >
                    {block?.fillPercent > 0 && (
                      <span
                        style={{
                          width: block?.fillPercent + "%",
                          background:
                            block?.fillBackground ||
                            "linear-gradient(90deg, rgba(233, 78, 27, 1) 0%, rgba(243, 117, 0, 1) 50%)",
                        }}
                      />
                    )}
                    <img src={block.icon} alt="paramIcon" />
                    <p>{block.value}</p><p style={{ color: '#22c7a3', paddingLeft: 8 }}>{block.adder > 0 && '+ ' + block.adder}</p>
                  </span>
                ))}
              </div>
            ))}
          </div>

          {/* ItemButtons Section */}
          <div className="ItemCardButtons">
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
      </div>
    </motion.div>
  );
};

export default ItemCard;
