import { React, useEffect, useState, useContext } from "react";
import PlayerIndicators from "../PlayerIndicators/PlayerIndicators";
import Assets from "../../../assets";
import { SwiperSlide, Swiper } from "swiper/react";
import { Pagination } from "swiper/modules";
import { getLevels } from "../../../services/levels/levels";
import { getUserActiveProcess } from "../../../services/user/user";
import "./HomeHeader.css";
import "swiper/css";
import "swiper/css/pagination";
import UserContext from "../../../UserContext";

const HomeHeader = ({ screenHeader }) => {
  const { userId, userParameters } = useContext(UserContext);
  const [levels, setLevels] = useState();
  const [activeProcess, setActiveProcess] = useState();
  const { Icons } = Assets;

  const getLevelByNumber = (number) => {
    return levels?.find((level) => level?.level === number);
  };

  const getUserLevelProgress = () => {
    if (userParameters?.level === 15) {
      return (
        getLevelByNumber(15)?.required_earned +
        " / " +
        getLevelByNumber(15)?.required_earned
      );
    }
    return (
      userParameters?.total_earned +
      " / " +
      getLevelByNumber(userParameters?.level + 1)?.required_earned
    );
  };

  useEffect(() => {
    getLevels().then((levels) => setLevels(levels));
    getUserActiveProcess(userId).then((activeProcess) => setActiveProcess(activeProcess));
  }, []);

  return (
    <div className="HomeHeader" style={{ borderRadius: screenHeader && "0" }}>
      <div className="HomeHeaderTopRow">
        <div className="HomeHeaderIncome">
          <div>
            <img src={Icons.balance} alt="Coin" />
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", marginLeft: 10 }}>
            <span style={{ fontSize: 20, paddingTop: 2, fontFamily: "Roboto", fontWeight: "lighter" }}>
              {userParameters?.coins}
            </span>
            
          </div>
        </div>
        <div className="HomeHeaderRespect">
          <img src={Icons.respect} alt="RespectIcon" />
          <span>{userParameters?.respect}</span>
        </div>
        <div className="HomeHeaderLevel">
          <span style={{ fontFamily: "Roboto", fontWeight: "100" }}>{userParameters?.level}</span>
          <span style={{ fontFamily: "Roboto", fontWeight: "100" }}>Уровень</span>
          <div
            className="HomeHeaderLevelCapacity"
            style={{
              width :
                (userParameters?.total_earned /
                  levels?.find(
                    (level) => level?.level === userParameters?.level + 1
                  )?.required_earned) *
                  100 +
                "%",
            }}
          />
        </div>
      </div>
      <div className="HomeHeaderBottomRow">
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
      </div>
    </div>
  );
};

export default HomeHeader;
