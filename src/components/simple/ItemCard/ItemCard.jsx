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
  ItemDescription,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 * (ItemIndex + 1) }}
      className="ItemCard"
      style={{ display: "flex", flexDirection: "column", width: "100%" }}
    >
      {/* ItemTitle Section */}
      <div style={{ textAlign: "center", width: "100%", fontSize: "5.5cqw",  }}>
        {ItemTitle}
      </div>

      {/* Main Content Section */}
      <div style={{ display: "flex", width: "100%" }}>
        {/* ItemIcon Section */}
        <div style={{ width: "25%", display: "flex", alignItems: "center", justifyContent: "center", padding: "10px"}}>
          <img loading="lazy" src={ItemIcon} alt="ItemIcon" />
        </div>

        {/* ItemParams Section */}
        <div style={{ width: "50%", textAlign: "center", paddingRight: "10px", alignContent: "center" }}>
          {ItemDescription && (
            <div style={{ fontSize: "5,5cqw", marginBottom: "1px" }}>
              {ItemDescription}
            </div>
          )}
          <div className="ItemCardParams"
          style={{  }}>
            {ItemParamsBlocks.map((param, index) => (
              <div key={index} className="ItemCardParam" style={{ display: "flex",  }}>
                {param.map((block, blockIndex) => (
                  <span
                    key={blockIndex}
                    className="ItemCardParamBlock"
                    style={{  width: `${100 / param.length}%` }}
                  >
                    {block?.fillPercent && (
                      <span style={{ display: "block", width: block?.fillPercent + "%" }}></span>
                    )}
                    <img src={block.icon} alt="paramIcon" />
                    <p style={{ fontSize: "11px", textAlign: "center" , flex: "1", paddingRight: "10%"  }}>{block.value}</p>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ItemButtons Section */}
        <div style={{ width: "25%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {ItemButtons.map((ItemButton, index) => (
            <Button
              key={index}
              width="90%"
              min-height="20px"
              height= "51px"
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
  );
};

export default ItemCard;
