import "./Modal.css"
import Button from "../../../simple/Button/Button"
import { motion } from "framer-motion"
import Assets from "../../../../assets"
import { createPortal } from "react-dom"
const Modal = ({ bottom, left, width, height, data, onClose, logoWidth, description = true }) => {
  const { Icons } = Assets;
  const modalContent = (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      className="Modal"
      style={{
        position: 'fixed',
        top: bottom ? 'auto' : '165.5px',
        bottom: bottom || 'auto',
        left: left || 0,
        width: width || '100vw',
        height: height || '100vh',
        zIndex: 99999,
        overflowY: 'auto',
      }}
    >
      
      <img
        className="ModalClose"
        onClick={() => onClose()}
        src={Icons.modalClose}
        alt="closeIcon"
      />
      <div className="ModalTitle">{data?.title}</div>

      <div className="ModalLogo" style={{  }}>
        <img src={data?.image} alt="ModalLogo" style={{ width: logoWidth || '17vmax' }}/>
      </div>
      <div className="ModalBody" style={{ }}>
        {data?.blocks?.map((block, index) => (
          <div key={index} className="ModalBodyBlock">
              <span
                className="progressFill"
                style={{
                  width: "100%",
                }}
              ></span>
            <div style={{ width: "60%" }}>
              <img
                style={{ marginRight: "5%" }}
                src={block?.icon}
                alt="ModalBlockIcon"
              />
              <span >{block?.text}</span>
            </div>
            <span style={{ color: block?.fillBackground }}>{block?.value}</span>
          </div>
        ))}
        {description && (
        <div style={{paddingTop: 16, width: '85%', textAlign: 'center' }}>
          <h4>{description}</h4>
        </div>
      )}
      </div>
      <div className="ModalFooter" style={{ marginTop: 10 }}>
        {data?.buttons?.map((button, index) => (
          <Button
            key={index}
            width={(Math.min(100 / data?.buttons.length - 2), 40) + "%"}
            height={44}
            color={"rgb(255, 255, 255)"}
            onClick={button.onClick}
            active={button?.active}
            text={button?.text}
            icon={button?.icon}
            bgColor={button?.bg}
            ownColor={button?.bg}
            shadowColor={button?.shadowColor}
            fontFamily={'Oswald'}
            fontWeight={'400'}
            fontSize={15}
          />
        ))}
      </div>
    </motion.div>
  )

  return createPortal(modalContent, document.body)
}

export default Modal
