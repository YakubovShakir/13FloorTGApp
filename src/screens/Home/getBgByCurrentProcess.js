import Assets from "../../assets/index"

const getBgByCurrentProcess = (processType) => {
  const { BG } = Assets
  const typeToBgMap = {
    work: BG.workScreenBG,
    sleep: BG.sleepScreenBG,
    training: BG.trainScreenBG,
  }

  const bg = typeToBgMap[processType]
  return `url(${bg || BG.homeBackground})`
}

export default getBgByCurrentProcess