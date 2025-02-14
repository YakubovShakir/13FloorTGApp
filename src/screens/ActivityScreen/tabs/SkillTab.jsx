import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer"
import ItemCard from "../../../components/simple/ItemCard/ItemCard"
import Assets from "../../../assets"
import { useEffect, useState } from "react"
import { getSkills, getUserConstantEffects, getUserSkills } from "../../../services/skill/skill"
import {
  updateProcessTimers,
  updateProcessesTimers,
} from "../../../utils/updateTimers"
import {
  getTrainingParameters,
  getParameters,
} from "../../../services/user/user"
import {
  getProcesses,
  startProcess,
  getActiveProcess,
} from "../../../services/process/process"
import formatTime, { getMinutesAndSeconds } from "../../../utils/formatTime"
import countPercentage from "../../../utils/countPercentage.js"
import { useSettingsProvider } from "../../../hooks"
import { useUser } from "../../../UserContext.jsx"
import moment from "moment-timezone"
import { text } from "framer-motion/client"
import { getUserBoosts, useBoost } from "../../../services/boost/boost.js"

const SkillTab = ({
  modalData,
  setModalData,
  setVisibleModal,
  userParameters,
  userId,
}) => {
  const [skills, setSkills] = useState(null) // List of skills
  const [effects, setEffects] = useState(null)
  const [userLearningSkills, setUserLearningSkills] = useState(null) //  User already Learned skills
  const [userLearnedSkills, setUserLearnedSkills] = useState(null) // User learning at this time skills
  const [trainingParamters, setTrainingParameters] = useState(null) // User training parameters
  const [activeProcess, setActiveProcess] = useState(null) //  User active training
  const [userBoosts, setUserBoosts] = useState(null)


  const { lang } = useSettingsProvider()

  const translations = {
    start: {
      ru: 'Начать',
      en: 'Start'
    },
    stop: {
      ru: 'Стоп',
      en: 'Stop'
    },
    available: {
      ru: 'Доступно',
      en: 'Available'
    },
    unavailable: {
      ru: 'Недоступно',
      en: 'Unavailable'
    },
    cost: {
      ru: 'Стоимость',
      en: 'Cost'
    },
    hour: {
      ru: 'ЧАС',
      en: 'HOUR'
    },
    minute: {
      ru: 'м.',
      en: 'm.'
    },
    currentWork: {
      ru: 'Текущая работа',
      en: 'Current work'
    },
    unlock: {
      ru: 'Открыть',
      en: 'Unlock'
    },
    noBoosts: {
      ru: 'Усилений нет',
      en: 'No boosts'
    },
    learned: {
      ru: 'Изучено',
      en: 'Learned'
    },
    learning: {
      ru: 'Изучается..',
      en: 'Learning..'
    },
    boost: {
      ru: 'Ускорить',
      en: 'Boost'
    },
    training: {
      ru: 'Тренировка',
      en: 'Training'
    },
    inProgress: {
      ru: 'В процессе',
      en: 'In progress'
    },
    trainingDesc: {
      ru: "Хорошая тренировка поднимает настроение!",
      en: "A good workout lifts your mood!"
    },
    duration: {
      ru: 'Длительность',
      en: 'Duration'
    },
    requiredLevel: {
      ru: 'Необходимый уровень',
      en: 'Required level'
    }
  }

  const { Icons } = Assets
  // Return skill if it already learned
  const checkLearnedSkill = (skillId) => {
    const learned = userLearnedSkills?.find(
      (skill) => skill?.skill_id === skillId
    )
    return learned && skills?.find((skill) => skill?.skill_id === skillId)
  }
  // Return skill if it in study
  const checkLearningSkill = (skillId) => {
    const learning = userLearningSkills?.find(
      (skill) => skill?.type_id === skillId
    )
    return learning && skills?.find((skill) => skill?.skill_id === skillId)
  }

  const checkLearningEffect = (effectId) => {
    const learning = userLearningSkills?.find(
      (skill) => skill?.type_id === effectId && skill?.sub_type === 'constant_effects'
    )

    return learning
  }

  const { refreshData } = useUser()
  useEffect(() => {
    if (!modalData) return;
  
    // Only update if we're actually showing a skill modal
    if (modalData?.type === "skill") {
      if (modalData?.sub_type === 'constant_effects') {
        // Find the correct effect by iterating through all effects
        const effectEntry = Object.entries(effects || {}).find(([key, effect]) => 
          effect?.next?.id === modalData.id || effect?.current?.id === modalData.id
        );
        
        if (effectEntry) {
          const [effectKey, currentEffect] = effectEntry;
          const updatedModalData = setEffectModalData(currentEffect)
          if (updatedModalData && updatedModalData.id === modalData.id) {
            setModalData(updatedModalData)
          }
        }
      } else {
        // Regular skills handling remains the same
        const currentSkill = skills?.find(
          (skill) => skill?.skill_id === modalData?.id
        )
        
        if (currentSkill) {
          const updatedModalData = setSkillModalData(currentSkill)
          if (updatedModalData && updatedModalData.id === modalData.id) {
            setModalData(updatedModalData)
          }
        }
      }
    }
  }, [userLearningSkills, effects, skills, userParameters])
  
  // Update handleBuySkill to handle any effect type
  const handleBuySkill = async (skill, sub_type = null) => {
    try {
      const skillId = sub_type !== null ? skill.next?.id : skill.skill_id
      await startProcess("skill", userId, skillId, sub_type)
      
      const [
        newSkills,
        newProcesses,
        newUserSkills,
        newEffects,
        newBoosts
      ] = await Promise.all([
        getSkills(),
        getProcesses("skill", userId),
        getUserSkills(userId),
        getUserConstantEffects(userId),
        getUserBoosts(userId)
      ])
  
      // Update all state variables
      setSkills(newSkills)
      setUserLearningSkills(newProcesses)
      setUserLearnedSkills(newUserSkills)
      setEffects(newEffects)
      setUserBoosts(newBoosts)
  
      // Only update modal if we're still looking at the same skill/effect
      if (modalData && modalData.id === skillId) {
        if (sub_type === 'constant_effects') {
          // Find the correct effect in the new effects data
          const effectEntry = Object.entries(newEffects || {}).find(([key, effect]) => 
            effect?.next?.id === skillId || effect?.current?.id === skillId
          );
          
          if (effectEntry) {
            const [effectKey, updatedEffect] = effectEntry;
            const newModalData = setEffectModalData(updatedEffect)
            if (newModalData && newModalData.id === modalData.id) {
              setModalData(newModalData)
            }
          }
        } else {
          const updatedSkill = newSkills.find(s => s.skill_id === skillId)
          if (updatedSkill) {
            const newModalData = setSkillModalData(updatedSkill)
            if (newModalData && newModalData.id === modalData.id) {
              setModalData(newModalData)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in handleBuySkill:', error)
    }
  }

  const getButtonInfo = (skill) => {
    const learning = checkLearningSkill(skill?.skill_id)
    const learned = checkLearnedSkill(skill?.skill_id)
    const icon = learned || learning ? null : Icons.balance

    let text = skill?.coins_price

    if (learning) text = translations.learning[lang]
    if (learned) text = translations.learned[lang]

    return {
      text,
      icon,
    }
  }

  const getEffectButtonInfo = (effect) => {
    const learning = checkLearningEffect(effect?.next?.id)
    const icon = learning ? null : Icons.balance

    let text = effect?.next?.price

    if (learning) text = translations.learning[lang]

    return {
      text,
      icon,
    }
  }

  // Build modal data for skill card
  const setSkillModalData = (skill) => {
    const learned = checkLearnedSkill(skill?.skill_id)
    const learning = userLearningSkills?.find(
      (sk) => sk?.type_id === skill?.skill_id && sk?.sub_type === null
    )

    const bottomButtonOnClick = () => handleBuySkill(skill)

    console.log('boosts', userBoosts)

    const data = {
      type: "skill",
      id: skill?.skill_id,
      sub_type: null,
      title: skill?.name[lang] || skill?.name,
      image: skill?.link,
      blocks: [
        {
          icon: Icons.balance,
          text: translations.cost[lang],
          value: skill?.coins_price,
          fillPercent: '100%',
          fillBackground: userParameters?.coins < skill?.coins_price
            ? "#4E1010" // red
            : "#0E3228", // green

        },
        {
          icon: Icons.levelIcon,
          text: translations.requiredLevel[lang],
          value: skill?.requiredLevel,
          fillPercent: "100%",
          fillBackground:
            userParameters?.level < skill?.requiredLevel
              ? "#4E1010" // red
              : "#0E3228", // green
        },
        skill?.skill_id_required && {
          icon: skills?.find((sk) => sk?.skill_id === skill?.skill_id_required)
            ?.link,
          text: skills?.find((sk) => sk?.skill_id === skill?.skill_id_required)?.name[lang],
          fillPercent: "100%",
          fillBackground: !checkLearnedSkill(skill?.skill_id_required)
            ? "#4E1010" // red
            : "#0E3228", // green
        },
        {
          icon: Icons.clock,
          text: translations.duration[lang],
          fillPercent: learning ? Math.min(100, countPercentage(
            moment().tz('Europe/Moscow').diff(moment(learning.createdAt).tz('Europe/Moscow'), 'seconds'),
            learning.target_duration_in_seconds || learning.base_duration_in_seconds
          )) : false
          ,
          value: formatTime(skill?.duration)
        },
      ].filter(Boolean),
      buttons: [
        // Убираем пока ускорить
        {
          ...getButtonInfo(skill),
          onClick: !(learning || learned) && bottomButtonOnClick,
          active: !(learning || learned) && (skill?.skill_id_required ? checkLearnedSkill(skill?.skill_id_required) : true) && userParameters?.level >= skill?.requiredLevel && userParameters.coins >= skill.coins_price,
        },
        ...(learning && !learned ? [ // Spread the conditional array elements
          {
            icon: "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/icons%2F%D1%83%D1%81%D0%BA%D0%BE%D1%80-25.png",
            text: translations.boost[lang] + ' x25%',
            active: userBoosts?.find(boost => boost.boost_id === 7),
            onClick: userBoosts?.find(boost => boost.boost_id === 7) && (async () => {
              setIsInitialized(false)
              await useBoost(userId, 7, skill.skill_id, null)
              // Combine multiple API calls
              const [boosts, constantEffects, skills, processes, activeProcess, userSkills] = await Promise.all([
                getUserBoosts(userId),
                getUserConstantEffects(userId),
                getSkills(),
                getProcesses("skill", userId),
                getActiveProcess(userId),
                getUserSkills(userId)
              ])

              setUserBoosts(boosts)
              setEffects(constantEffects)
              setSkills(skills)
              setUserLearningSkills(processes)
              setActiveProcess(activeProcess)
              setUserLearnedSkills(userSkills)
              setIsInitialized(true)
              setVisibleModal(false)
            })
          },
          {
            icon: "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/icons%2F%D1%83%D1%81%D0%BA%D0%BE%D1%80-50.png",
            text: translations.boost[lang] + ' x50%',
            active: userBoosts?.find(boost => boost.boost_id === 8),
            onClick: userBoosts?.find(boost => boost.boost_id === 8) && (async () => {
              setIsInitialized(false)
              await useBoost(userId, 8, skill.skill_id, null)

              // Combine multiple API calls
              const [boosts, constantEffects, skills, processes, activeProcess, userSkills] = await Promise.all([
                getUserBoosts(userId),
                getUserConstantEffects(userId),
                getSkills(),
                getProcesses("skill", userId),
                getActiveProcess(userId),
                getUserSkills(userId)
              ])

              setUserBoosts(boosts)
              setEffects(constantEffects)
              setSkills(skills)
              setUserLearningSkills(processes)
              setActiveProcess(activeProcess)
              setUserLearnedSkills(userSkills)
              setIsInitialized(true)
              setVisibleModal(false)
            })
          },
        ] : []) // If not learning, spread an empty array (no additional buttons)
      ],
    }
    return data
  }

  const setEffectModalData = (effect) => {
    // Add additional null checks
    if (!effect || !effect.next) return null;
  
    const learning = userLearningSkills?.find(
      (sk) => sk?.type_id === effect?.next?.id && sk?.sub_type === 'constant_effects'
    )
  
    const bottomButtonOnClick = () => handleBuySkill(effect, 'constant_effects')
  
    return {
      type: "skill",
      sub_type: 'constant_effects',
      id: effect?.next?.id,
      title: effect?.next?.name?.[lang] || 'Unnamed Effect',
      image: effect?.next?.link,
      blocks: [
        {
          icon: Icons.balance,
          text: translations.cost[lang],
          value: effect?.next?.price || 0,
          fillPercent: '100%',
          fillBackground: userParameters?.coins < (effect?.next?.price || 0)
            ? "#4E1010"
            : "#0E3228",
        },
        {
          icon: Icons.levelIcon,
          text: translations.requiredLevel[lang],
          value: effect?.next?.required_level || 0,
          fillPercent: "100%",
          fillBackground:
            userParameters?.level < (effect?.next?.required_level || 0)
              ? "#4E1010"
              : "#0E3228",
        },
        {
          icon: Icons.clock,
          text: translations.duration[lang],
          fillPercent:
            learning?.duration || learning?.seconds
              ? countPercentage(
                learning?.duration * 60 + (learning?.seconds || 0),
                effect?.next?.duration * 60 || 0
              )
              : false,
          value: formatTime(effect?.next?.duration || 0)
        }
      ].filter(Boolean),
      buttons: [
        {
          ...getEffectButtonInfo(effect),
          onClick: !learning && 
            userParameters?.level >= (effect?.next?.required_level || 0) && 
            userParameters.coins >= (effect?.next?.price || 0) && 
            bottomButtonOnClick,
          active: !learning && 
            userParameters?.level >= (effect?.next?.required_level || 0) && 
            userParameters.coins >= (effect?.next?.price || 0),
        },
        ...(learning ? [ // Spread the conditional array elements
          {
            icon: "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/icons%2F%D1%83%D1%81%D0%BA%D0%BE%D1%80-25.png",
            text: translations.boost[lang] + ' x25%',
            active: userBoosts?.find(boost => boost.boost_id === 7),
            onClick: userBoosts?.find(boost => boost.boost_id === 7) && (async () => {
              setIsInitialized(false)
              await useBoost(userId, 7, effect.next?.id, 'constant_effects')
              // Combine multiple API calls
              const [boosts, constantEffects, skills, processes, activeProcess, userSkills] = await Promise.all([
                getUserBoosts(userId),
                getUserConstantEffects(userId),
                getSkills(),
                getProcesses("skill", userId),
                getActiveProcess(userId),
                getUserSkills(userId)
              ])

              setUserBoosts(boosts)
              setEffects(constantEffects)
              setSkills(skills)
              setUserLearningSkills(processes)
              setActiveProcess(activeProcess)
              setUserLearnedSkills(userSkills)
              setIsInitialized(true)
            })
          },
          {
            icon: "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/icons%2F%D1%83%D1%81%D0%BA%D0%BE%D1%80-50.png",
            text: translations.boost[lang] + ' x50%',
            active: userBoosts?.find(boost => boost.boost_id === 8),
            onClick: userBoosts?.find(boost => boost.boost_id === 8) && (async () => {
              setIsInitialized(false)
              await useBoost(userId, 8, effect?.next?.id, 'constant_effects')

              // Combine multiple API calls
              const [boosts, constantEffects, skills, processes, activeProcess, userSkills] = await Promise.all([
                getUserBoosts(userId),
                getUserConstantEffects(userId),
                getSkills(),
                getProcesses("skill", userId),
                getActiveProcess(userId),
                getUserSkills(userId)
              ])

              setUserBoosts(boosts)
              setEffects(constantEffects)
              setSkills(skills)
              setUserLearningSkills(processes)
              setActiveProcess(activeProcess)
              setUserLearnedSkills(userSkills)
              setIsInitialized(true)
            })
          },
        ] : []) // If not learning, spread an empty array (no additional buttons)
      ],
    }
  }

  // Get parameters for skill card
  const getItemSkillParamsBlock = (skill) => {
    const learned = checkLearnedSkill(skill?.skill_id)
    if (learned) return []

    const requiredSkill = skill?.skill_id_required

    const learning = userLearningSkills?.find(
      (sk) => sk?.type_id === skill?.skill_id
    )
    const { duration, seconds } = learning ? getMinutesAndSeconds(Math.max(0, (learning?.target_duration_in_seconds ? learning?.target_duration_in_seconds : learning?.base_duration_in_seconds) - moment().tz('Europe/Moscow').diff(moment(learning?.createdAt).tz('Europe/Moscow'), 'seconds'))) : getMinutesAndSeconds(skill?.duration * 60)
    const timerBar = {
      icon: Icons.clock,
      fillPercent: learning ? Math.max(0, 100 - countPercentage(
        moment().tz('Europe/Moscow').diff(moment(learning.createdAt).tz('Europe/Moscow'), 'seconds'),
        learning.target_duration_in_seconds || learning.base_duration_in_seconds
      )) : false,
      value: formatTime(duration, seconds)
    }
    const learnedRequiredSkill = skill.skill_id_required ? checkLearnedSkill(skill.skill_id_required) : true

    let accessStatus = !(learned || learning) && learnedRequiredSkill && userParameters?.coins >= skill.coins_price && userParameters.level >= skill.requiredLevel

    if (learned) accessStatus = false

    if (requiredSkill) accessStatus && checkLearnedSkill(requiredSkill)

    const accessBar = {
      icon: accessStatus ? Icons.unlockedIcon : Icons.lockedIcon,
      value: accessStatus ? translations.available[lang] : translations.unavailable[lang],
    }

    return [[timerBar], [accessBar]]
  }

  const getItemEffectsParamsBlock = (effect) => {
    const learning = userLearningSkills?.find(
      (sk) => sk?.type_id === effect?.next?.id && sk?.sub_type === 'constant_effects'
    )

    const { duration, seconds } = learning ? getMinutesAndSeconds(learning?.target_duration_in_seconds || learning?.base_duration_in_seconds) : getMinutesAndSeconds(effect.next.duration * 60)
    const timerBar = {
      icon: Icons.clock,
      fillPercent: learning ? Math.abs(countPercentage(
        moment().diff(moment(learning?.createdAt), 'seconds'),
        learning?.target_duration_in_seconds || learning?.base_duration_in_seconds || effect.duration * 60
      ) - 100) : 0,
      value: learning ? formatTime(learning.duration, learning.seconds) : formatTime(duration, seconds),
    }

    let accessStatus = !learning && userParameters?.coins >= effect.price && userParameters.level >= effect.required_level

    const accessBar = {
      icon: accessStatus ? Icons.unlockedIcon : Icons.lockedIcon,
      value: accessStatus ? translations.available[lang] : translations.unavailable[lang],
    }

    return [[timerBar], [accessBar]]
  }

  // Get button for skill card
  const getItemSkillButton = (skill) => {
    const learned = checkLearnedSkill(skill?.skill_id)
    const learning = checkLearningSkill(skill?.skill_id)
    const learnedRequiredSkill = skill.skill_id_required ? checkLearnedSkill(skill.skill_id_required) : true

    const active = !(learned || learning) && learnedRequiredSkill && userParameters?.coins >= skill.coins_price && userParameters.level >= skill.requiredLevel

    return [
      {
        ...getButtonInfo(skill),
        onClick: () => {
          setModalData(setSkillModalData(skill))
          setVisibleModal(true)
        },
        active,
      },
    ]
  }

  // Get button for skill card
  const getItemEffectButton = (effect) => {
    const learning = checkLearningEffect(effect?.next?.id)

    const active = !learning && userParameters?.coins >= effect.next.price && userParameters.level >= effect.next.required_level

    return [
      {
        ...getEffectButtonInfo(effect),
        onClick: () => {
          setModalData(setEffectModalData(effect))
          setVisibleModal(true)
        },
        active,
      },
    ]
  }

  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Timer update function
    const updater = updateProcessesTimers(
      userLearningSkills,
      setUserLearningSkills,
      async () => {
        const retryRequest = async (fn, maxRetries = 3) => {
          for (let i = 0; i < maxRetries; i++) {
            try {
              return await fn();
            } catch (error) {
              console.error(`Attempt ${i + 1} failed:`, error);
              if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 3000)); // 3s delay between retries
              }
            }
          }
          throw new Error('Max retries reached');
        };
  
        try {
          const [
            learningSkills,
            boosts,
            constantEffects,
            skillsList,
            activeProc,
            userSkills
          ] = await Promise.all([
            retryRequest(() => getProcesses("skill", userId)),
            retryRequest(() => getUserBoosts(userId)),
            retryRequest(() => getUserConstantEffects(userId)),
            retryRequest(() => getSkills()),
            retryRequest(() => getActiveProcess(userId)),
            retryRequest(() => getUserSkills(userId))
          ]);
  
          setUserLearningSkills(learningSkills);
          setUserBoosts(boosts);
          setEffects(constantEffects);
          setSkills(skillsList);
          setActiveProcess(activeProc);
          setUserLearnedSkills(userSkills);
        } catch (error) {
          console.error('Failed to update after max retries:', error);
        }
      }
    );
  
    return () => clearInterval(updater);
  }, [isInitialized, userLearningSkills, effects]);
  
  // Separate initialization effect
  useEffect(() => {
    const initializeData = async () => {
      try {
        const [
          learningSkills,
          boosts,
          constantEffects,
          skillsList,
          activeProc,
          userSkills
        ] = await Promise.all([
          getProcesses("skill", userId),
          getUserBoosts(userId),
          getUserConstantEffects(userId),
          getSkills(),
          getActiveProcess(userId),
          getUserSkills(userId)
        ]);
  
        setUserLearningSkills(learningSkills);
        setUserBoosts(boosts);
        setEffects(constantEffects);
        setSkills(skillsList);
        setActiveProcess(activeProc);
        setUserLearnedSkills(userSkills);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error in initialization:', error);
      }
    };
  
    initializeData();
  }, []);

  return (
    <ScreenContainer withTab>
      {/* Currently Learning Items (both skills and effects) */}
      {skills?.filter(a => checkLearningSkill(a.skill_id) && !checkLearnedSkill(a.skill_id)).map((skill, index) => (
        <ItemCard
          key={`learning-skill-${skill.skill_id}`}
          ItemIcon={skill?.link}
          ItemTitle={skill.name[lang]}
          ItemDescription={skill?.description && skill?.description[lang]}
          ItemParamsBlocks={getItemSkillParamsBlock(skill)}
          ItemButtons={getItemSkillButton(skill)}
          ItemIndex={index + 1}
        />
      ))}
  
      {effects && isInitialized ? Object.entries(effects)
        .filter(([key, effect]) => effect?.next && checkLearningEffect(effect?.next?.id))
        .map(([key, effect], index) => {
          const displayEffect = effect.current || effect.next;
          return (
            <ItemCard
              key={`learning-effect-${displayEffect.id}`}
              ItemIcon={displayEffect.link}
              ItemTitle={displayEffect.name[lang]}
              ItemDescription={displayEffect.description[lang]}
              ItemParamsBlocks={getItemEffectsParamsBlock(effect)}
              ItemButtons={getItemEffectButton(effect)}
              ItemBottomAmount={(lang === 'en' ? 'Level ' : 'Уровень ') + (effect.current?.level || 0)}
              ItemIndex={index + 1}
            />
          );
      }) : null}
  
      {/* Available (not learned/learning) Skills */}
      {skills?.filter(a => !checkLearningSkill(a.skill_id) && !checkLearnedSkill(a.skill_id))
        .map((skill, index) => (
          <ItemCard
            key={`available-skill-${skill.skill_id}`}
            ItemIcon={skill?.link}
            ItemTitle={skill.name[lang]}
            ItemDescription={skill?.description && skill?.description[lang]}
            ItemParamsBlocks={getItemSkillParamsBlock(skill)}
            ItemButtons={getItemSkillButton(skill)}
            ItemIndex={index + 1}
          />
      ))}
  
      {/* Available Effects */}
      {effects && isInitialized ? Object.entries(effects)
        .filter(([key, effect]) => effect?.next && !checkLearningEffect(effect?.next?.id))
        .map(([key, effect], index) => {
          const displayEffect = effect.current || effect.next;
          return (
            <ItemCard
              key={`available-effect-${displayEffect.id}`}
              ItemIcon={displayEffect.link}
              ItemTitle={displayEffect.name[lang]}
              ItemDescription={displayEffect.description[lang]}
              ItemParamsBlocks={getItemEffectsParamsBlock(effect)}
              ItemButtons={getItemEffectButton(effect)}
              ItemBottomAmount={(lang === 'en' ? 'Level ' : 'Уровень ') + (effect.current?.level || 0)}
              ItemIndex={index + 1}
            />
          );
      }) : null}
  
      {/* Learned Skills */}
      {skills?.filter(a => !checkLearningSkill(a.skill_id) && checkLearnedSkill(a.skill_id))
        .map((skill, index) => (
          <ItemCard
            key={`learned-skill-${skill.skill_id}`}
            ItemIcon={skill?.link}
            ItemTitle={skill.name[lang]}
            ItemDescription={skill?.description && skill?.description[lang]}
            ItemParamsBlocks={getItemSkillParamsBlock(skill)}
            ItemButtons={getItemSkillButton(skill)}
            ItemIndex={index + 1}
          />
      ))}
    </ScreenContainer>
  );
}

export default SkillTab
