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

const BoostTab = ({ userId, userParameters, setUserParameters }) => {
  
  useEffect(() => {
    getBoosts().then((r) => setBoosts(r))
    getActiveProcess(userId).then((process) => setActiveProcess(process))
    getLevels().then((levels) => setLevels(levels))
  }, [])
  return (
    <ScreenContainer withTab>
     
    </ScreenContainer>
  )
}

export default BoostTab
