import "./Window.css"
import Assets from "../../../../assets"
import { useState } from "react"
const Window = ({ title, onClose, tabs=undefined, data=undefined}) => {
  const [activeTab, setActiveTab] = useState(tabs && Object.keys(tabs)[0])
  const { Icons } = Assets
  return ( 
    <div className="Window">
      <img
        onClick={() => onClose(false)}
        className="WindowClose"
        src={Icons.cancel}
        alt="#"
      />
      <div className="WindowTitle">{title}</div>
      <div className="WindowTaps">
        {tabs && Object.keys(tabs).map((tap, index) => (
          <div
            key={index}
            onClick={() => setActiveTab(`${tap}`)}
            style={{ width: `${100 / Object.keys(tabs).length}%` }}
            className={
              activeTab === `${tap}` ? "WindowTap WindowActiveTap" : "WindowTap"
            }
          >
            <img src={tabs[tap]} alt="#" />
          </div>
        ))}
      </div>
      <div className="WindowData" style={{ overflowY: "scroll", height: tabs ? "87%": "100%", borderTopLeftRadius: tabs ? "0" : "20px", borderTopRightRadius: tabs ? "0" : "20px"}}>
      {data[activeTab] || data}
      </div>
    </div>
  )
}

export default Window
