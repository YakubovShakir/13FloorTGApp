import { useState, useEffect } from "react"
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer"
import Assets from "../../../assets"
import ItemCard from "../../../components/simple/ItemCard/ItemCard"
import sleepIcon from "./../../../assets/IMG/icons/sleepIcon.png"
import {
  getProcesses,
  startProcess,
  getActiveProcess,
  stopProcess,
} from "../../../services/process/process"
import { getParameters } from "../../../services/user/user"
import { getLevels } from "../../../services/levels/levels"
import { getBoosts } from "../../../services/boost/boost"
import { updateProcessTimers } from "../../../utils/updateTimers"
import formatTime from "../../../utils/formatTime"
import countPercentage from "../../../utils/countPercentage"

const BoostTab = ({ userId, userParameters, setUserParameters }) => {
  const [boosts, setBoosts] = useState(null)
  const [levels, setLevels] = useState(null)
  const [activeProcess, setActiveProcess] = useState(null)

  const { Icons } = Assets

  const handleStartSleep = async () => {
    await startProcess("sleep", userId)

    const sleepProcess = await getActiveProcess(userId)
    setActiveProcess(sleepProcess)
  }
  const handleStopSleep = async () => {
    await stopProcess(userId)
    setActiveProcess(null)
  }

  const getItemSleepParams = () => {
    const userSleepDuration = levels?.find(
      (level) => level?.level === userParameters?.level
    )?.sleep_duration
    return [
      [
        {
          icon: Icons.clock,
          value:
            activeProcess?.type === "sleep" && (activeProcess?.duration || activeProcess?.seconds)
              ? formatTime(activeProcess?.duration, activeProcess?.seconds)
              : userSleepDuration,
          fillPercent:
            activeProcess?.type === "sleep" && activeProcess?.duration
              ? countPercentage(
                  activeProcess?.duration * 60,
                  userSleepDuration * 60
                )
              : null,
        },
      ],
      [
        {
          icon: Icons.boosterArrow,
          value: "Усилений нет",
        },
      ],
    ]
  }

  const getItemSleepButton = () => {
    return [
      {
        text: activeProcess?.type === "sleep" ? "Стоп" : "Начать",
        active: true,
        bg:
          activeProcess?.type === "sleep"
            ? "linear-gradient(90deg, rgba(233,27,27,1) 0%, rgba(119,1,1,1) 100%)"
            : "linear-gradient(180deg, rgba(233,78,27,1) 0%, rgba(243,117,0,1) 100%)",
        shadowColor: "#AF370F",
        onClick:
          activeProcess?.type === "sleep"
            ? () => handleStopSleep()
            : () => handleStartSleep(),
      },
    ]
  }
  useEffect(() => {
    getBoosts().then((r) => setBoosts(r))
    getActiveProcess(userId).then((process) => setActiveProcess(process))
    getLevels().then((levels) => setLevels(levels))
  }, [])

  useEffect(() => {
    if (activeProcess?.type === "sleep") {
      const updater = updateProcessTimers(activeProcess, setActiveProcess)

      return () => clearInterval(updater)
    }
  }, [activeProcess])
  return (
    <ScreenContainer withTab>
      <ItemCard
        ItemIcon={sleepIcon}
        ItemTitle={"Долгий сон"}
        ItemParamsBlocks={getItemSleepParams()}
        ItemButtons={getItemSleepButton()}
        ItemIndex={0}
      />
      {boosts?.map((boost, index) => (
        <ItemCard
          key={index}
          ItemIcon={boost?.link}
          ItemTitle={boost.name}
          ItemDescription={boost?.description}
          ItemParamsBlocks={[
            [
              boost["duration"] !== null && {
                icon: Icons.clock,
                value: boost.duration,
              },
            ].filter(Boolean),
          ]}
          ItemButtons={[
            {
              text: boost.stars_price,
              active: true,
              icon: Icons.starsIcon,
            },
            {
              text: "Принять",
              active: false,
            },
          ]}
          ItemIndex={index + 1}
        />
      ))}
    </ScreenContainer>
  )
}

export default BoostTab
