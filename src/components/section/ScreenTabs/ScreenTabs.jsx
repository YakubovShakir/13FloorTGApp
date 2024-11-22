import "./ScreenTabs.css"
import { useEffect, useState } from "react"
const ScreenTabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0)

  async function handleSwitchTab(index, callback) {
    setActiveTab(index)
    callback()
  }
  return (
    <div className="ScreenTabs">
      {tabs.map((tab, index) => (
        <div
          onClick={() => {
            handleSwitchTab(index, tab.callback)
          }}
          key={index}
          style={{ width: `${100 / tabs.length - 3}%` }}
          className={
            activeTab === index ? "ScreenActiveTab ScreenTab" : "ScreenTab"
          }
        >
          <img
            className={activeTab === index ? "scaleUpAnimation" : "grayscale-1"}
            src={tab.icon}
            alt="#"
          />
        </div>
      ))}
    </div>
  )
}

export default ScreenTabs
