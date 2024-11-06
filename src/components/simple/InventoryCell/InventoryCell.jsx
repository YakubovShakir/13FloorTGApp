import "./InventoryCell.css"

const InventoryCell = ({ width,aspectRatio, icon, active }) => {
  return (
    <div
      style={{ border: !active && "transparent",backgroundColor: !active && "transparent" , maxWidth: width,width:width, aspectRatio: aspectRatio, backgroundImage: `url(${icon})` }}
      className="InventoryCell"
    >
    </div>
  )
}

export default InventoryCell
