import Assets from "../../assets/index"

const workToBGMap = {
  1: Assets.BG.workOne,
  2: Assets.BG.workOne,
  3: Assets.BG.workTwo,
  4: Assets.BG.workTwo,
  5: Assets.BG.workTwo,
  6: Assets.BG.workThree,
  7: Assets.BG.workThree,
  8: Assets.BG.workThree,
  9: Assets.BG.workThree,
  10: Assets.BG.workThree,
  11: Assets.BG.workThree,
  12: Assets.BG.workThree,
  13: Assets.BG.workThree,
  14: Assets.BG.workThree,
  15: Assets.BG.workFour,
  16: Assets.BG.workFour,
  17: Assets.BG.workFour,
  18: Assets.BG.workFour,
  19: Assets.BG.workFour,
  20: Assets.BG.workFour,
}

const getBgByCurrentProcess = (processType, workId) => {
  const { BG } = Assets
  const typeToBgMap = {
    work: BG.workScreenBG,
    sleep: BG.sleepScreenBG,
    training: BG.trainScreenBG,
  }

  if(processType === 'work') {
    return `url(${workToBGMap[workId]})`
  }

  const bg = typeToBgMap[processType]
  return `url(${bg || BG.homeBackground})`
}

export default getBgByCurrentProcess