import { React, useState } from "react"
import PlayerLogo from "../PlayerLogo/PlayerLogo"
import PlayerIndicators from "../PlayerIndicators/PlayerIndicators"
import IconButton from "../../simple/IconButton/IconButton"
import Assets from "../../../assets"
import { SwiperSlide, Swiper } from "swiper/react"
import { Pagination } from "swiper/modules"
import "./HomeHeader.css"
import "swiper/css"
import "swiper/css/pagination"

const HomeHeader = ({ screenHeader }) => {
  const { Icons } = Assets

  const player = {
    level: 1,
    balance: 100000,
    income: 100,
    experience: 500,
    experienceNextLevel: 1000,
    respect: 134344,
  }

  const indicators = [
    {
      icon: Icons.energy,
      percentFill: 55,
      width: "30%",
    },
    {
      icon: Icons.hungry,
      percentFill: 45,
      width: "30%",
    },
    {
      icon: Icons.happiness,
      percentFill: 90,
      width: "30%",
    },
  ]
  return (
    <div className="HomeHeader" style={{ borderRadius: screenHeader && "0" }}>
      <Swiper
        pagination={true}
        modules={[Pagination]}
        className="HomeHeaderSwiper"
      >
        <SwiperSlide className="HomeHeaderSlide" style={{ display: "flex" }}>
          <PlayerIndicators indicators={indicators} />
          <div className="HomeHeaderIncome">
            <div>
              <img src={Icons.balance} alt="Coin" />
            </div>
            <div>
              <span>{player.balance}</span>
              <span>{player.income}/ч</span>
            </div>
          </div>
          <div className="HomeHeaderLevel">
            <span>{player.level}</span>
            <span>Уровень</span>
            <div
              className="HomeHeaderLevelCapacity"
              style={{
                height:
                  (player.experience / player.experienceNextLevel) * 100 + "%",
              }}
            />
          </div>{" "}
        </SwiperSlide>
        <SwiperSlide className="HomeHeaderSlide" style={{ display: "flex" }}>
          <div className="HomeHeaderRespect">
            <img src={Icons.respect} alt="RespectIcon" />
            <span>{player.respect}</span>
          </div>
          <div className="HomeHeaderExperience">
            <span>{player.level} уровень</span>
            <span>
              {player.experience} / {player.experienceNextLevel}
            </span>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  )
}

export default HomeHeader
