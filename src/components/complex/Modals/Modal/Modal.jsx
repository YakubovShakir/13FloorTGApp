import "./Modal.css"
import Button from "../../../simple/Button/Button"
import { motion } from "framer-motion"
import Assets from "../../../../assets"
const Modal = ({ bottom, left, width, height, data, onClose }) => {
  const { Icons } = Assets
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      className="Modal"
      style={{ bottom: bottom, left: left, width: width, height: height, zIndex: 10 }}
    >
      
      <img
        className="ModalClose"
        onClick={() => onClose()}
        src={Icons.modalClose}
        alt="closeIcon"
      />
      <div className="ModalTitle">{data?.title}</div>

      <div className="ModalLogo">
        <img src={data?.image} alt="ModalLogo" />
      </div>
      <div className="ModalBody">
        {data?.blocks?.map((block, index) => (
          <div key={index} className="ModalBodyBlock">
            {block?.fillPercent && (
              <span
                className="progressFill"
                style={{
                  width: block?.fillPercent + "%",
                  background:
                    block?.fillBackground ||
                    "linear-gradient(90deg, rgba(233, 78, 27, 1) 0%, rgba(243, 117, 0, 1) 50%)",
                }}
              ></span>
            )}
            <div style={{ width: "70%" }}>
              <img
                style={{ marginRight: "5%" }}
                src={block?.icon}
                alt="ModalBlockIcon"
              />
              <span>{block?.text}</span>
            </div>
            <span>{block?.value}</span>
          </div>
        ))}
      </div>
      <div className="ModalFooter">
        {data?.buttons?.map((button, index) => (
          <Button
            key={index}
            width={(Math.min(100 / data?.buttons.length - 2), 40) + "%"}
            height={`70%`}
            onClick={button?.onClick && (() => button?.onClick())}
            active={button?.active}
            text={button?.text}
            icon={button?.icon}
            bgColor={button?.bg}
            ownColor={button?.bg}
            shadowColor={button?.shadowColor}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default Modal
