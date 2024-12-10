import "./ItemCard.css"
import { motion } from "framer-motion"
import Button from "../Button/Button"
import { span } from "framer-motion/client"
import { useEffect, useState } from "react"

const ItemCard = ({
  ItemIcon,
  ItemTitle,
  ItemParamsBlocks,
  ItemButtons,
  ItemIndex,
  ItemDescription,
  ItemAmount = undefined,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 * (ItemIndex + 1) }}
      className="ItemCard"
    >
      {ItemAmount !== undefined && (
        <div className="ItemCardAmount">{ItemAmount}</div>
      )}
      {/* {ItemTitle Section} */}
      <div className="ItemTitle">{ItemTitle}</div>

      <div className="ItemData">
        {/* ItemIcon Section */}
        <div style={{ width: "20%", display: "flex", alignItems: "center" }}>
          <img loading="lazy" src={ItemIcon} alt="ItemIcon" />
        </div>

        {/* ItemParams Section */}
        <div style={{ width: "70%" }}>
          <div className="ItemCardParams">
            {ItemDescription && (
              <span
                style={{
                  fontSize: "3.5cqw",
                  textAlign: "center",
                  padding: "0 5%",
                }}
              >
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
                    <p
                      style={{
                        fontSize: "4cqw",
                        fontFamily: "Roboto",
                        fontWeight: 300,
                      }}
                    >
                      {block.value}
                    </p>
                  </span>
                ))}
              </div>
            ))}
          </div>
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
              
              onClick={ItemButton?.onClick && (() => ItemButton?.onClick())}
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
    </motion.div>
  )
}

export default ItemCard
