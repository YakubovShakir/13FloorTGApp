import "./CareScreen.css"
import { useEffect, useState } from "react"
import HomeHeader from "../../components/complex/HomeHeader/HomeHeader"
import burger from "./assets/img/burger.png"
import Menu from "../../components/complex/Menu/Menu"
import foodTab from "./assets/img/foodTab.png"
import store from "./assets/img/store.png"
import boost from "./assets/img/boost.png"
import greenArrowUp from "./assets/img/greenArrowUp.png"
import Button from "../../components/simple/Button/Button"
import Assets from "../../assets"

import Screen from "../../components/section/Screen/Screen"
import ScreenBody from "../../components/section/ScreenBody/ScreenBody"
import ScreenTabs from "../../components/section/ScreenTabs/ScreenTabs"
import ScreenContainer from "../../components/section/ScreenContainer/ScreenContainer"
const CareScreen = () => {
  const [activeTab, setActiveTab] = useState(null)
  const { Icons } = Assets
  const tabs = [ {icon: foodTab, callback: () => console.log("foodTab") },
    {icon: boost, callback: () => console.log("BoostTab")} ,
    {icon: store, callback: () => console.log("StoreTab")} 
  ]
  const playerBalance = 1000

  const FoodList = [
    {
      name: "Бургер",
      icon: burger,
      recoveryParameters: {
        oneTime: {
          hungry: 5,
          happiness: 5,
        },
        reusable: {
            hungry: 5,
            happiness: 5,
        }
      },
      cooldown: 540,
      price: 400,
    },
    {
        name: "Бургер",
        icon: burger,
        recoveryParameters: {
          oneTime: {
            hungry: 5,
            happiness: 5,
          },
  
        },
        cooldown: 540,
        price: 400,
      },
      {
        name: "Бургер",
        icon: burger,
        recoveryParameters: {
          oneTime: {
            hungry: 5,
            happiness: 5,
          },
  
        },
        cooldown: 540,
        price: 400,
      },
      {
        name: "Бургер",
        icon: burger,
        recoveryParameters: {
          oneTime: {
            hungry: 5,
            happiness: 5,
          },
  
        },
        cooldown: 540,
        price: 400,
      },
      {
        name: "Бургер",
        icon: burger,
        recoveryParameters: {
          oneTime: {
            hungry: 5,
            happiness: 5,
          },
  
        },
        cooldown: 540,
        price: 400,
      },
  ]
  const BoostList = [{}]
  return (
    <Screen>
      <HomeHeader screenHeader />
      <ScreenBody >
        <ScreenTabs tabs={tabs}/>
        <ScreenContainer withTab>
        {FoodList.map((food, index) => (
            <div key={index} className="CareFoodCard">
              <div style={{ width: "25%", display: "flex", alignItems: "center"}}>
                <img src={food.icon} alt="FoodCardIcon" />
              </div>
              <div style={{ width: "50%" }}>
                <div style={{ textAlign: "center", height: "20%", fontSize: "5cqw"}}>{food.name}</div>
                <div className="CareFoodCardParams">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-around",
                      alignItems: "center",
                      width: food?.recoveryParameters?.reusable?.happiness ? "100%" : "48%"
                    }}
                  >
                    {food.recoveryParameters.oneTime && (
                      <span style={{width: food?.recoveryParameters?.reusable?.hungry ? "45%" : "100%"}}>
                        <img src={Icons.hungry} alt="IconHungry" />
                        {food.recoveryParameters.oneTime.hungry + "%"}
                      </span>
                    )}
                    {food.recoveryParameters.reusable && (
                      <span style={{width: food?.recoveryParameters?.reusable?.hungry? "45%" : "100%"}}>
                        <img src={Icons.hungry} alt="IconHungry"  className="CareFoodCardReusableIcon" />
                        <img src={greenArrowUp} alt="IconUp"  />
                        {food.recoveryParameters.reusable.hungry + "%"}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-around",
                      alignItems: "center",
                      width: food.recoveryParameters.reusable?.hungry ? "100%" : "48%"
                    }}
                  >
                    {food.recoveryParameters.oneTime && (
                      <span style={{width: food.recoveryParameters.reusable?.happiness ? "45%" : "100%"}}>
                        <img src={Icons.happiness} alt="IconHappiness" />
                        {food.recoveryParameters.oneTime.happiness + "%"}
                      </span>
                    )}
                    {food.recoveryParameters.reusable && (
                      <span style={{width: food.recoveryParameters.reusable?.happiness ? "45%" : "100%"}}>
                        <img src={Icons.happiness} alt="IconHappiness" className="CareFoodCardReusableIcon"/>
                        <img src={greenArrowUp} alt="IconUp"  />
                        {food.recoveryParameters.reusable.happiness + "%"}
                      </span>
                    )}
                  </div>
                  <div className="CareFoodCardParametersCooldown">
                    <img src={Icons.clock} alt="Clock" />
                    <span>{food.cooldown}</span>
                  </div>
                </div>
              </div>
              <div style={{width: "25%", display: "flex", alignItems: "center", justifyContent: "center"}}>
              <Button
                width="90%"
                height={"35%"}
                active={playerBalance >= food.price}
                text={food.price}
                icon={Icons.balance}
              />
              </div>

            </div>
          ))}
        </ScreenContainer>
        </ScreenBody>
      <Menu screenMenu activeName={"care"}/>
      </Screen>
  )
}

export default CareScreen
