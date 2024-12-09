import "./Modal.css"
import Button from "../../../simple/Button/Button"
import { motion } from "framer-motion"
import Assets from "../../../../assets"
const Modal = ({ bottom, left, width, height, data, onClose, logoWidth }) => {
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

      <div className="ModalLogo" style={{ marginTop: -30 }}>
        <img src={data?.image} alt="ModalLogo" style={{ width: logoWidth || '20vmax' }}/>
      </div>
      <div className="ModalBody" style={{ height: 200}}>
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
              <span >{block?.text}</span>
            </div>
            <span>{block?.value}</span>
          </div>
        ))}
      </div>
      <div className="ModalFooter" style={{ marginTop: 24 }}>
        {data?.buttons?.map((button, index) => (
          <Button
            key={index}
            width={(Math.min(100 / data?.buttons.length - 2), 40) + "%"}
            height={44}
            onClick={button?.onClick && (() => button?.onClick())}
            active={button?.active}
            text={button?.text}
            icon={button?.icon}
            bgColor={button?.bg}
            ownColor={button?.bg}
            shadowColor={button?.shadowColor}
            fontFamily={'Roboto'}
            fontWeight={'200'}
            fontSize={14}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default Modal
