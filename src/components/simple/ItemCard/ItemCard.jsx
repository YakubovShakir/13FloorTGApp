import "./ItemCard.css"
import { motion } from "framer-motion"
import Button from "../Button/Button"
import { span } from "framer-motion/client"

const ItemCard = ({
  ItemIcon,
  ItemTitle,
  ItemParamsBlocks,
  ItemButtons,
  ItemIndex,
  ItemDescription
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 * (ItemIndex + 1) }}
      className="ItemCard"
    >
      {/* ItemIcon Section */}
      <div style={{ width: "25%", display: "flex", alignItems: "center" }}>
        <img loading="lazy" src={ItemIcon} alt="ItemIcon" />
      </div>

      {/* ItemParams Section */}
      <div style={{ width: "60%" }}>
        <div style={{ textAlign: "center", height: "20%", fontSize: "3.5cqw" }}>
          {ItemTitle}
        </div>
        <div className="ItemCardParams">
          {ItemDescription && (
            <span style={{ fontSize: "3cqw", textAlign: "center"}}>
              {ItemDescription}
            </span>
          )}
          {ItemParamsBlocks.map((param, index) => (
            <div key={index} className="ItemCardParam">
              {param.map((block, blockIndex) => (
                <span
                  className="ItemCardParamBlock"
                  key={blockIndex}
                  style={{ width: `${90 / param.length}%` }}
                >
                  {block?.fillPercent && <span style={{width: block?.fillPercent+ "%"}}></span>}
                  <img src={block.icon} alt="paramIcon" />
                  <p style={{fontSize: "3cqw"}}>{block.value}</p>
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
            width="90%"
            height={`33%`}
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
