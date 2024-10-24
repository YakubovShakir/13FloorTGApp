import "./Modal.css"
import Assets from "../../../../assets"
import IconButton from "../../../simple/IconButton/IconButton"
const Modal = ({ top, left, width, height, onClose, title, data }) => {
  const { Icons } = Assets

  return (
    <div
      style={{ width: width, height: height, top: top, left: left }}
      className="Modal"
    >
     
      <div className="ModalTitle">{title.toUpperCase()}
   
        <IconButton 
          onClick={() => {
            onClose(false)
          }}
          icon={Icons.cancel}
        />
      </div>
      <div className="ModalData">{data()}</div>
    </div>
  )
}

export default Modal
