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
  ItemAmount = undefined
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
    
      {/* ItemIcon Section */}
      <div style={{ width: "25%", display: "flex", alignItems: "center" }}>
        <img loading="lazy" src={ItemIcon} alt="ItemIcon" />
      </div>

      {/* ItemParams Section */}
      <div style={{ width: "60%" }}>
        <div style={{ textAlign: "center", height: "20%", fontSize: "4.5cqw", fontFamily: 'Roboto', fontWeight: 200 }}>
          {ItemTitle}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
          <div className="ItemCardParams" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Roboto', width: '80%' }}>
          {ItemDescription && (
            <span style={{ fontSize: "3cqw", textAlign: "center" }}>
              {ItemDescription}
            </span>
          )}
          <div style={{ marginTop: ItemDescription ? 10 : -5 }}>
          {ItemParamsBlocks.map((param, index) => (
            <div key={index} className="ItemCardParam" style={{ width: 160, justifyContent: 'space-between' }}>
              {param.map((block, blockIndex) => (
                <span
                  className="ItemCardParamBlock"
                  key={blockIndex}
                  style={{ width: param.length > 1 ? 75 : 180, marginTop: 5, }}
                >
                  {block?.fillPercent && (
                    <span
                      style={{
                        width: block?.fillPercent + '%',
                        background:
                          block?.fillBackground ||
                          "linear-gradient(90deg, rgba(233, 78, 27, 1) 0%, rgba(243, 117, 0, 1) 50%)",
                      }}
                    ></span>
                  )}
                  <img src={block.icon} alt="paramIcon"/>
                  <p style={{ fontSize: "3cqw", fontFamily: 'Roboto', fontWeight: 300 }}>{block.value}</p>
                </span>
              ))}
            </div>
          ))}
          </div>
        </div>
        </div>
      </div>

      {/* ItemButtons Section */}
      <div className="ItemCardButtons">
        {ItemButtons.map((ItemButton, index) => (
          <Button
            key={index}
            width="90%"
            height={44}
            fontSize={14}
            fontFamily={'Roboto'}
            fontWeight={300}
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
    </motion.div>
  )
}

export default ItemCard
