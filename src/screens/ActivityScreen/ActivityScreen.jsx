import { useEffect, useState , useContext} from "react"
import HomeHeader from "../../components/complex/HomeHeader/HomeHeader"
import Menu from "../../components/complex/Menu/Menu"

import starsIcon from "./../../assets/IMG/icons/starsIcon.png"
import Assets from "../../assets"
import Screen from "../../components/section/Screen/Screen"
import ScreenBody from "../../components/section/ScreenBody/ScreenBody"
import ScreenTabs from "../../components/section/ScreenTabs/ScreenTabs"
import ScreenContainer from "../../components/section/ScreenContainer/ScreenContainer"
import useTelegram from "../../hooks/useTelegram"
import sleepIcon from "./../../assets/IMG/icons/sleepIcon.png"
import { useNavigate } from "react-router-dom"
import ItemCard from "../../components/simple/ItemCard/ItemCard"
import skillsTab from "./assets/skillsTab.png"
import { getWorks } from "../../api/works"
import UserContext from "../../UserContext"
import { getSkills, buySkill, getUserSkills } from "../../api/skills"
import { getUserProcesses, startTraining } from "../../api/user"
import { getParameters, getTrainingParameters } from "../../api/user"

import Modal from "../../components/complex/Modals/Modal/Modal"
const ActivityScreen = () => {
  const [activeTab, setActiveTab] = useState("works")
  const [works, setWorks] = useState(null)
  const [skills, setSkills] = useState(null)
  const [userLearningSkills, setUserLearningSkills] = useState(null)
  const [userLearnedSkills, setUserLearnedSkills] = useState(null)
  const {userParameters, setUserParameters , userId} = useContext(UserContext)
  const [visibleModal, setVisibleModal] = useState(false)
  const [modalData, setModalData] = useState(null)
  const [trainingParamters, setTrainingParameters] = useState(null)
  const [activeTraining, setActiveTraining] = useState(null)
  const navigate = useNavigate()
  const { Icons } = Assets

  const tabs = [
    { icon: Icons.balance, callback: () => setActiveTab("works") },
    { icon: skillsTab, callback: () => setActiveTab("skills") },
  ]


  const handleBuySkill= async (skillId) => {
    console.log("Покупаю скилл")
    await buySkill(userId, skillId)

    const userParameters = await getParameters(userId)
    const userLearningSkills = await getUserProcesses(userId, 'skill')
    //update States
    setUserParameters(userParameters)
    setUserLearningSkills(userLearningSkills)

  }

  const handleStartTraining = async () => {
    console.log("Start Training")
   await startTraining(userId)
    const activeTraining = await getUserProcesses(userId, 'training')
    console.log("Обработка старта", activeTraining)
    if (activeTraining.length != 0) {
      setActiveTraining(activeTraining)
    }
  }

  const updateInformation = () => {
    try {
        setInterval(()=> {
            console.log("Обновляю скиллы пользователя")
            getUserProcesses(userId, 'skill').then((r) => setUserLearningSkills(r))
            getUserSkills(userId).then((r) => setUserLearnedSkills(r))

            getUserProcesses(userId, 'training').then((r) => setActiveTraining(r))

            getTrainingParameters(userId).then((r) => setTrainingParameters(r))

            getUserSkills(userId).then((r) => setUserLearnedSkills(r))
          }, 30000)
    }
    catch (e) {
        console.log("Error when updateInfromation", e)
    }
  }


  const checkLearnedSkill = (skillId) => {
    return userLearnedSkills?.some((skill)=> skill?.skill_id === skillId)
  }
  const checkLearningSkill = (skillId) => {
    return userLearningSkills?.some((skill)=> skill?.type_id === skillId)
  }

  const switchWorklOnClick = (work) => {
    if (work?.coins_price < userParameters?.coins) return () => {
      if (!visibleModal) {
        setModalData(setWorkModalData(work))
        setVisibleModal(true)

      }
    }
    if (work?.coins_price < userParameters?.coins)return () => {
      if (!visibleModal) {
        setModalData(setWorkModalData(work))
        setVisibleModal(true)

      }
    }
    if (work?.skill_id_required) {
      if (work?.coins_price < userParameters?.coins) return  () => {
        if (!visibleModal) {
          setModalData(setWorkModalData(work))
          setVisibleModal(true)

        }
      }
      }
    // return () => handleBuySkill(skill?.skill_id)
    return () => console.log("Покупка работы")
  }

  const switchSkillOnClick = (skill) => {
    if (skill?.coins_price > userParameters?.coins) return () => {
      if (!visibleModal) {
        setModalData(setSkillModalData(skill))
        setVisibleModal(true)

      }
    }
    if (checkLearnedSkill(skill?.skill_id) || checkLearningSkill(skill?.skill_id)) return () => {
      if (!visibleModal) {
        setModalData(setSkillModalData(skill))
        setVisibleModal(true)

      }
    }
    if (skill?.skill_id_required) {
      if (!checkLearnedSkill(skill?.skill_id_required)) return  () => {
        if (!visibleModal) {
          setModalData(setSkillModalData(skill))
          setVisibleModal(true)

        }
      }
      }
    return () => handleBuySkill(skill?.skill_id)
  }

  const checkActiveButton = (skill) => {
    if (checkLearningSkill(skill?.skill_id)) return true
    if (checkLearnedSkill(skill?.skill_id)) return false
    if (userParameters?.coins < skill?.coins_price) return false
    if (skill?.skill_id_required) {
      if (!checkLearnedSkill(skill?.skill_id_required)) return false
    }
    return true
  }

  const validSkillDuration = (skillTime) => {
    let hours = skillTime / 60 > 1 ? Math.round(skillTime/ 60) + "h ": false
    let minuts = Math.round(skillTime % 60)
    return (hours || "") + (minuts + "m" || "")
  }
  const setWorkModalData = (work) => {
    console.log(work)
    const data = {
       title: work?.name,
       image: work?.link,
       blocks: [
         {icon: Icons.balance,
           text: "Стоимость",
           value: work?.coins_price
         },
         work?.skill_id_required && {
           icon: skills.find((f)=> f.name === work?.skill_id_required)?.link,
           text: skills.find((f)=> f.name === work?.skill_id_required)?.name,
         }
       ].filter(Boolean),
       buttons: [
         {
          text:
          userParameters?.coins > work?.coins_price
            ? work?.coins_price
            : "Инфо",
        icon: userParameters?.coins > work?.coins_price && Icons.balance,
        active: (userParameters?.coins > work?.coins_price )}
       ]
     }
     return data
   }

  const setSkillModalData = (skill) => {
   const data = {
      title: skill?.name,
      image: skill?.link,
      blocks: [
        {icon: Icons.balance,
          text: "Стоимость",
          value: skill?.coins_price
        },
        {
          icon: Icons.clock,
          text: "",
          value:validSkillDuration(userLearningSkills?.find((f) => f.type_id === skill?.skill_id)?.duration || skill?.duration),
          fillPercent: (userLearningSkills?.find((f) => f.type_id === skill?.skill_id)?.duration / skill?.duration) * 100 + "%" || false,
        },
        skill?.skill_id_required && {
          icon: skills.find((f)=> f.skill_id === skill?.skill_id_required)?.link,
          text: skills.find((f)=> f.skill_id === skill?.skill_id_required)?.name,
        }
      ].filter(Boolean),
      buttons: [
        {
          text: checkLearnedSkill(skill?.skill_id) ? "Изучено" : (checkLearningSkill(skill?.skill_id) ? "Ускорить" : 
          skill?.coins_price),
     

       onClick: switchSkillOnClick(skill),

       icon: checkLearnedSkill(skill?.skill_id) || checkLearningSkill(skill?.skill_id) ? false : Icons.balance,

       active: checkActiveButton(skill),

       bg: (checkLearnedSkill(skill?.skill_id) && "linear-gradient(180deg, rgba(233,78,27,1) 0%, rgba(243,117,0,1) 50%)") || (checkLearningSkill(skill?.skill_id) && "linear-gradient(180deg, rgba(233,78,27,1) 0%, rgba(243,117,0,1) 100%)")
     }
      ]
    }
    return data
  }
  useEffect(() => {
    useTelegram.setBackButton(() => navigate("/"))
    getWorks().then((r) => setWorks(r))
    getSkills().then((r) => setSkills(r))
    getUserProcesses(userId, 'skill').then((r) => setUserLearningSkills(r))
    getUserProcesses(userId, 'training').then((r) => setActiveTraining(r))

    getUserSkills(userId).then((r) => setUserLearnedSkills(r))
    getTrainingParameters(userId).then((r) => setTrainingParameters(r))
    updateInformation()
  }, [])

  useEffect(() => {
    console.log(works)
  }, [works])
  useEffect(() => {
    console.log(skills)
  }, [skills])
  useEffect(() => {
    console.log("lear",userLearningSkills)
  }, [userLearningSkills])
  useEffect(() => {
    console.log("learned",userLearnedSkills)
  }, [userLearnedSkills])
  useEffect(() => {
    console.log("tp ",trainingParamters)
  }, [trainingParamters])
  useEffect(() => {
    console.log("activeTraining", activeTraining)
  }, [activeTraining])
  return (
    <Screen>
      <HomeHeader screenHeader />
      <ScreenBody>
        {visibleModal && <Modal onClose={() => setVisibleModal(false)}data={modalData} bottom={"0"} width={"100%"} height={"80%"}/>}
        <ScreenTabs tabs={tabs} />

        {/* Works Data */}
        {activeTab === "works" && (
          <ScreenContainer withTab>
            {works?.map((work, index) => (
              <ItemCard
                key={index}
                ItemIcon={work?.link}
                ItemTitle={work?.name}
                ItemParamsBlocks={[
                  [
                    {
                      value: work?.coins_price,
                      icon: Icons.balance,
                    },
                  ],
                  [
                    {
                      value:
                        userParameters?.coins > work?.coins_price
                          ? "Доступно"
                          : "Недоступно",
                      icon:
                        userParameters?.coins > work?.coins_price
                          ? Icons.unlockedIcon
                          : Icons.lockedIcon,
                    },
                  ],
                ]}
                ItemButtons={[
                  {
                    text:
                      userParameters?.coins > work?.coins_price
                        ? work?.coins_price
                        : "Инфо",
                    onClick: switchWorklOnClick(work),
                    icon: userParameters?.coins > work?.coins_price && Icons.balance,
                    active: (userParameters?.coins > work?.coins_price )
                  },
                ]}
                ItemIndex={index}
              />
            ))}
          </ScreenContainer>
        )}
        {/* Skills Data */}
        {activeTab === "skills" && (
          <ScreenContainer withTab>
          {trainingParamters && (
             <ItemCard
             ItemIcon={Icons.training}
             ItemTitle={"Тренировка"}
             ItemParamsBlocks={[
              [
                {
                  icon: Icons.clock,
                  value: validSkillDuration( activeTraining?.[0]?.duration || trainingParamters?.duration),
                  fillPercent: (activeTraining?.[0]?.duration / trainingParamters?.duration) * 100 || false
                },
              ],
              [
                {
                  icon: Icons.boosterArrow,
                  value: "Усилений нет",
                },
              ]
             ]}
             ItemButtons={
              [ {
                text: activeTraining ? "В процессе" : "Начать",
                active: true,
                bg: "linear-gradient(180deg, rgba(233,78,27,1) 0%, rgba(243,117,0,1) 100%)",
                shadowColor: "#AF370F",
                onClick: () => handleStartTraining()
              },
            ]
             }
             ItemIndex={0}
           />
          ) } 
            {skills?.map((skill, index) => (
              <ItemCard
                key={index}
                ItemIcon={skill?.link}
                ItemTitle={skill.name}
                ItemDescription={skill?.description}
                ItemParamsBlocks={[
                  [
                    (!(checkLearnedSkill(skill?.skill_id))) && skill["duration"] !== null && {
                      icon: Icons.clock,
                      fillPercent: (userLearningSkills?.find((f) => f.type_id === skill?.skill_id)?.duration / skill?.duration) * 100 || false,
                      value:  validSkillDuration(userLearningSkills?.find((f) => f.type_id === skill?.skill_id)?.duration || skill?.duration),
                    },
                  ].filter(Boolean),
                  [
                    
                      (!(checkLearningSkill(skill?.skill_id)) && !(checkLearnedSkill(skill?.skill_id))) && {value:
                        userParameters?.coins > skill?.coins_price  && (skill?.skill_id_required ? checkLearnedSkill(skill?.skill_id_required): true)
                          ? "Доступно"
                          : "Недоступно",
                      icon:
                        userParameters?.coins > skill?.coins_price
                          ? Icons.unlockedIcon
                          : Icons.lockedIcon,
                    },
                  ].filter(Boolean),
                ]}
                ItemButtons={[
                  {
                    text: checkLearnedSkill(skill?.skill_id) ? "Изучено" : (checkLearningSkill(skill?.skill_id) ? "Ускорить" : 
          
                       skill?.coins_price),
                  

                    onClick: switchSkillOnClick(skill),

                    icon: checkLearnedSkill(skill?.skill_id) || checkLearningSkill(skill?.skill_id) ? false : Icons.balance,

                    active: checkActiveButton(skill),

                    bg: (checkLearnedSkill(skill?.skill_id) && "linear-gradient(180deg, rgba(233,78,27,1) 0%, rgba(243,117,0,1) 50%)") || (checkLearningSkill(skill?.skill_id) && "linear-gradient(180deg, rgba(233,78,27,1) 0%, rgba(243,117,0,1) 100%)")
                  },
                ]}
                ItemIndex={index + 1}
              />
            ))}
          </ScreenContainer>
        )}
        {/* Store Data */}
      </ScreenBody>
      <Menu screenMenu activeName={"activity"} />
    </Screen>
  )
}

export default ActivityScreen
