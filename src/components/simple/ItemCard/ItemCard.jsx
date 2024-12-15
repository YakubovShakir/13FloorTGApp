import "./ItemCard.css"
import { motion } from "framer-motion"
import Button from "../Button/Button"
import { useEffect, useState } from "react"
import Assets from "../../../assets"

const ItemCard = ({
  ItemIcon,
  ItemTitle,
  ItemParamsBlocks,
  ItemButtons,
  ItemIndex,
  ItemDescription,
  ItemAmount = undefined,
  isWaiting = false, // Это флаг ожидания
  handleStarsBuy
}) => {
  // Определяем, активна ли хотя бы одна кнопка
  const isAnyButtonActive = ItemButtons.some(button => button.active);

  // Логика для установки обводки
  let borderStyle = "1px solid #3B3537"; // Стандартный цвет обводки (неактивная кнопка)
  
  if (isWaiting) {
    borderStyle = "1px solid rgb(46, 199, 115)"; // Если в ожидании, зелёная обводка
  } else if (isAnyButtonActive) {
    borderStyle = "1px solid #f37500"; // Если хотя бы одна кнопка активна, оранжевая обводка
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 * (ItemIndex + 1) }}
      className="ItemCard"
      style={{ border: borderStyle }} // Применяем обводку в зависимости от состояния
    >
      {ItemAmount !== undefined && (
        <div className="ItemCardAmount">{ItemAmount}</div>
      )}
      {/* {ItemTitle Section} */}
      <div className="ItemTitle">{ItemTitle}</div>

      <div className="ItemData">
        {/* ItemIcon Section */}
        <div className="ItemIconContainer">
          <img
            loading="lazy"
            src={ItemIcon}
            alt="ItemIcon"
            className={isAnyButtonActive ? '' : 'inactive'}  // Применяем 'inactive' только если кнопка неактивна
          />
        </div>

        {/* Right Section: ItemParams + ItemButtons */}
        <div className="ItemDetailsContainer">
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
                    style={{ width: param.length > 1 ? "50%" : "100%", marginTop: 5 }}
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
                    <img src={block.icon} alt="paramIcon" />
                    <p>{block.value}</p>
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
                fontFamily={"Muller"}
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
                ownColor={ItemButton?.bg}
                shadowColor={ItemButton?.shadowColor}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ItemCard;
