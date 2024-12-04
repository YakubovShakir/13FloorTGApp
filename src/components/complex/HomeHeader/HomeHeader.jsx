import { React, useEffect, useState, useContext } from "react"
import PlayerIndicators from "../PlayerIndicators/PlayerIndicators"
import Assets from "../../../assets"
import { SwiperSlide, Swiper } from "swiper/react"
import { Pagination } from "swiper/modules"
import { getLevels } from "../../../services/levels/levels"
import "./HomeHeader.css"
import "swiper/css"
import "swiper/css/pagination"
import UserContext from "../../../UserContext"

const HomeHeader = ({ screenHeader }) => {
  const { userId, userParameters } = useContext(UserContext)
  const [levels, setLevels] = useState()
  const { Icons } = Assets

  const player = {
    level: 2,
    balance: 100000,
    income: 100,
    experience: 500,
    experienceNextLevel: 1000,
    respect: 134344,
  }
  const getLevelByNumber = (number) => {
    return levels?.find((level) => level?.level === number)
  }
  const getUserLevelProgress = () => {
    if (userParameters?.level === 15) {
      return (
        getLevelByNumber(15)?.required_earned +
        " / " +
        getLevelByNumber(15)?.required_earned
      )
    }
    return (
      userParameters?.total_earned +
      " / " +
      getLevelByNumber(userParameters?.level + 1)?.required_earned
    )
  }
  useEffect(() => {
    getLevels().then((levels) => setLevels(levels))
  }, [])
  useEffect(() => {
    console.log(levels)
  }, [levels])
  return (
    <div className="HomeHeader" style={{ borderRadius: screenHeader && "0" }}>
      <Swiper
        pagination={true}
        modules={[Pagination]}
        className="HomeHeaderSwiper"
      >
        <SwiperSlide className="HomeHeaderSlide" style={{ display: "flex" }}>
          <PlayerIndicators
            indicators={[
              {
                icon: Icons.energy,
                percentFill:
                  (userParameters?.energy / userParameters?.energy_capacity) *
                  100,
                width: "30%",
              },
              {
                icon: Icons.hungry,
                percentFill: userParameters?.hungry,
                width: "30%",
              },
              {
                icon: Icons.happiness,
                percentFill: userParameters?.mood,
                width: "30%",
              },
            ]}
          />
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
                  (userParameters?.total_earned /
                    levels?.find(
                      (level) => level?.level === userParameters?.level + 1
                    )?.required_earned) *
                    100 +
                  "%",
              }}
            />
          </div>{" "}
        </SwiperSlide>
        <SwiperSlide className="HomeHeaderSlide" style={{ display: "flex" }}>
          <div className="HomeHeaderRespect">
            <img src={Icons.respect} alt="RespectIcon" />
            <span>{userParameters?.respect}</span>
          </div>
          {levels && (
            <div className="HomeHeaderExperience">
              <span>{userParameters?.level} уровень</span>
              <span>{getUserLevelProgress()}</span>
            </div>
          )}
        </SwiperSlide>
      </Swiper>
    </div>
  )
}

export default HomeHeader
