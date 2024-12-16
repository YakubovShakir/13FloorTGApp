import "./ScreenTabs.css";
import { useEffect, useState } from "react";

const ScreenTabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  async function handleSwitchTab(index, callback) {
    setActiveTab(index);
    callback();
  }

  return (
    <div className="ScreenTabs">
      {tabs.map((tab, index) => (
        <div
          onClick={() => handleSwitchTab(index, tab.callback)}
          key={index}
          style={{
            width: `${100 / tabs.length - 3}%`,
            alignItems: "center",
            display: "flex",
            flexDirection: "column", // Располагаем текст вертикально
            justifyContent: "center",
          }}
          className={
            activeTab === index ? "ScreenActiveTab ScreenTab" : "ScreenTab"
          }
        >
          {/* Оставляем только текст */}
          <span
            className={activeTab === index ? "tab-label-active" : "tab-label"}
          >
            {tab.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ScreenTabs;
