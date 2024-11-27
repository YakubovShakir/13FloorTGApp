import { React, useEffect, useState, useContext} from "react"
import PlayerLogo from "../PlayerLogo/PlayerLogo"
import PlayerIndicators from "../PlayerIndicators/PlayerIndicators"
import IconButton from "../../simple/IconButton/IconButton"
import Assets from "../../../assets"
import { SwiperSlide, Swiper } from "swiper/react"
import { Pagination } from "swiper/modules"
import { getParameters } from "../../../api/user"

import "./HomeHeader.css"
import "swiper/css"
import "swiper/css/pagination"
import UserContext from "../../../UserContext"

const HomeHeader = ({ screenHeader }) => {
  const {userId, userParameters} = useContext(UserContext)

  const { Icons } = Assets
  
  
  const player = {
    level: 2,
    balance: 100000,
    income: 100,
    experience: 500,
    experienceNextLevel: 1000,
    respect: 134344,
  }


  useEffect(()=> console.log("userpa",userParameters), [userParameters])
  return (
    <div className="HomeHeader" style={{ borderRadius: screenHeader && "0" }}>
      <Swiper
        pagination={true}
        modules={[Pagination]}
        className="HomeHeaderSwiper"
      >
        <SwiperSlide className="HomeHeaderSlide" style={{ display: "flex" }}>
          <PlayerIndicators indicators={[ {
      icon: Icons.energy,
      percentFill: (userParameters?.energy / userParameters?.energy_capacity) * 100,
      width: "30%",
    },
    {
      icon: Icons.hungry,
      percentFill: (userParameters?.hungry),
      width: "30%",
    },
    {
      icon: Icons.happiness,
      percentFill: (userParameters?.mood),
      width: "30%",
    },]} />
          <div className="HomeHeaderIncome">
            <div>
              <img src={Icons.balance} alt="Coin" />
            </div>
            <div>
              <span>{userParameters?.coins}</span>
              <span>{player.income}/ч</span>
            </div>
          </div>
          <div className="HomeHeaderLevel">
            <span>{userParameters?.level}</span>
            <span>Уровень</span>
            <div
              className="HomeHeaderLevelCapacity"
              style={{
                height:
                  (userParameters?.experience / player.experienceNextLevel) * 100 + "%",
              }}
            />
          </div>{" "}
        </SwiperSlide>
        <SwiperSlide className="HomeHeaderSlide" style={{ display: "flex" }}>
          <div className="HomeHeaderRespect">
            <img src={Icons.respect} alt="RespectIcon" />
            <span>{userParameters?.respect}</span>
          </div>
          <div className="HomeHeaderExperience">
            <span>{userParameters?.level} уровень</span>
            <span>
              {userParameters?.experience} / {player.experienceNextLevel}
            </span>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  )
}

export default HomeHeader
