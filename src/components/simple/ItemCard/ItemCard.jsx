import "./ItemCard.css"
import { motion } from "framer-motion"
import Button from "../Button/Button"

const ItemCard = ({
  ItemIcon,
  ItemTitle,
  ItemParamsBlocks,
  ItemButtons,
  ItemIndex,
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
        <img src={ItemIcon} alt="ItemIcon" />
      </div>

      {/* ItemParams Section */}
      <div style={{ width: "50%" }}>
        <div style={{ textAlign: "center", height: "20%", fontSize: "5cqw" }}>
          {ItemTitle}
        </div>
        <div className="ItemCardParams">
          {ItemParamsBlocks.map((param, index) => (
            <div key={index} className="ItemCardParam">
              {param.map((block, blockIndex) => (
                <span
                  className="ItemCardParamBlock"
                  key={blockIndex}
                  style={{ width: `${90 / param.length}%` }}
                >
                  <img src={block.icon} alt="paramIcon" />
                  <p>{block.value}</p>
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
            height={`35%`}
            active={ItemButton.active}
            text={ItemButton.price}
            icon={ItemButton.icon}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default ItemCard
