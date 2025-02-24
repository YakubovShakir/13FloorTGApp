import { useEffect, useState, useCallback, useRef } from "react";
import moment from "moment-timezone";
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer";
import ItemCard from "../../../components/simple/ItemCard/ItemCard";
import Assets from "../../../assets";
import {
  getSkills,
  getUserConstantEffects,
  getUserSkills,
} from "../../../services/skill/skill";
import {
  getServerTime,
  getTrainingParameters,
} from "../../../services/user/user";
import {
  getProcesses,
  startProcess,
  getActiveProcess,
} from "../../../services/process/process";
import { getUserBoosts, useBoost } from "../../../services/boost/boost.js";
import formatTime from "../../../utils/formatTime";
import countPercentage from "../../../utils/countPercentage.js";
import { useSettingsProvider } from "../../../hooks";

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes in ms
const TICK_INTERVAL = 1000; // 1 second in ms

const SkillTab = ({
  modalData,
  setModalData,
  setVisibleModal,
  userParameters,
  userId,
}) => {
  const { lang } = useSettingsProvider();
  const { Icons } = Assets;
  const mountedRef = useRef(true);
  const timerRef = useRef(null);
  const lastSkillsRef = useRef(null); // Track last userLearningSkills state
  const isInitializingRef = useRef(false); // Track initialization status
  const modalUpdateRef = useRef(false); // Track if modal update is in progress

  const [state, setState] = useState({
    skills: null,
    effects: null,
    userLearningSkills: null,
    userLearnedSkills: null,
    trainingParameters: null,
    activeProcess: null,
    userBoosts: null,
    isInitialized: false,
  });

  const translations = {
    start: { ru: 'Начать', en: 'Start' },
    stop: { ru: 'Стоп', en: 'Stop' },
    available: { ru: 'Доступно', en: 'Available' },
    unavailable: { ru: 'Недоступно', en: 'Unavailable' },
    cost: { ru: 'Стоимость', en: 'Cost' },
    hour: { ru: 'ЧАС', en: 'HOUR' },
    minute: { ru: 'м.', en: 'm.' },
    currentWork: { ru: 'Текущая работа', en: 'Current work' },
    unlock: { ru: 'Открыть', en: 'Unlock' },
    noBoosts: { ru: 'Усилений нет', en: 'No boosts' },
    learned: { ru: 'Изучено', en: 'Learned' },
    learning: { ru: 'Изучается..', en: 'Learning..' },
    boost: { ru: 'Ускорить', en: 'Boost' },
    training: { ru: 'Тренировка', en: 'Training' },
    inProgress: { ru: 'В процессе', en: 'In progress' },
    trainingDesc: {
      ru: "Хорошая тренировка поднимает настроение!",
      en: "A good workout lifts your mood!"
    },
    duration: { ru: 'Длительность', en: 'Duration' },
    requiredLevel: { ru: 'Необходимый уровень', en: 'Required level' }
  };

  const calculateTime = useCallback((skills, displayTime) => {
    return skills.map(skill => {
      const processStart = moment(skill.createdAt).tz("Europe/Moscow");
      const elapsedSeconds = displayTime.diff(processStart, "seconds");
      const totalSeconds = skill.target_duration_in_seconds || skill.base_duration_in_seconds;
      const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
      
      return {
        ...skill,
        remainingSeconds,
        totalSeconds,
        formattedTime: formatTime(
          Math.floor(remainingSeconds / 60),
          remainingSeconds % 60
        ),
      };
    });
  }, []); // Empty deps since this function is stable and doesn't depend on external state

  const initializeData = useCallback(async () => {
    if (isInitializingRef.current) return; // Prevent concurrent initializations
    isInitializingRef.current = true;

    try {
      const [
        learningSkills,
        boosts,
        constantEffects,
        skillsList,
        activeProc,
        userSkills,
        trainingParams,
      ] = await Promise.all([
        getProcesses("skill", userId),
        getUserBoosts(userId),
        getUserConstantEffects(userId),
        getSkills(),
        getActiveProcess(userId),
        getUserSkills(userId),
        getTrainingParameters(userId),
      ]);

      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          skills: skillsList,
          effects: constantEffects,
          userLearningSkills: learningSkills,
          userLearnedSkills: userSkills,
          trainingParameters: trainingParams,
          activeProcess: activeProc,
          userBoosts: boosts,
          isInitialized: true,
        }));
      }
    } catch (error) {
      console.error("Initialization failed:", error);
    } finally {
      isInitializingRef.current = false;
    }
  }, []); // Only depends on userId, which is stable

  useEffect(() => {
    mountedRef.current = true;
    initializeData();
    return () => {
      mountedRef.current = false;
    };
  }, [initializeData]);

  const setupTimer = useCallback(async () => {
    if (!state.userLearningSkills?.length || !state.isInitialized || timerRef.current) {
      if (timerRef.current) {
        timerRef.current.clear();
      }
      return;
    }

    let baseTime = await getServerTime(); // Use the Promise directly, already in the correct timezone
    let lastSyncTime = moment();
    let accumulatedDrift = 0;

    const tick = () => {
      if (!mountedRef.current) return;

      const now = moment();
      const timeSinceLastSync = now.diff(lastSyncTime, "milliseconds");
      const displayTime = baseTime.clone().add(timeSinceLastSync + accumulatedDrift, "milliseconds");
      const updatedSkills = calculateTime(state.userLearningSkills, displayTime);
      
      // Check if the skills have actually changed to prevent unnecessary renders
      if (JSON.stringify(updatedSkills) !== JSON.stringify(lastSkillsRef.current)) {
        const allCompleted = updatedSkills.every(skill => skill.remainingSeconds <= 0);
        
        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            userLearningSkills: updatedSkills,
          }));
          lastSkillsRef.current = updatedSkills; // Update the ref with new skills
        }

        if (allCompleted && timerRef.current) {
          timerRef.current.clear();
          timerRef.current = null;
          if (mountedRef.current) {
            setState(prev => ({
              ...prev,
              isInitialized: false,
              userLearningSkills: [],
            }));
            initializeData(); // Reinitialize data after completion
          }
        }
      }
    };

    const sync = async () => {
      if (!mountedRef.current) return;

      try {
        const newServerTime = await getServerTime(); // Fetch new server time
        const newBaseTime = newServerTime.clone(); // Already in the correct timezone
        const now = moment();
        const expectedTime = baseTime.clone().add(now.diff(lastSyncTime));
        const drift = newBaseTime.diff(expectedTime);

        accumulatedDrift += drift;
        baseTime = newBaseTime;
        lastSyncTime = now;

        console.log("Timer sync:", { drift, accumulatedDrift });
        tick();
      } catch (error) {
        console.error("Sync failed:", error);
      }
    };

    tick(); // Initial calculation
    const tickInterval = setInterval(tick, TICK_INTERVAL);
    const syncInterval = setInterval(sync, SYNC_INTERVAL);

    timerRef.current = {
      clear: () => {
        clearInterval(tickInterval);
        clearInterval(syncInterval);
        timerRef.current = null;
      }
    };
  }, [state.userLearningSkills, state.isInitialized, calculateTime, initializeData]);

  useEffect(() => {
    if (state.isInitialized && state.userLearningSkills?.length > 0 && !timerRef.current) {
      setupTimer().catch(console.error); // Handle async setup safely
      lastSkillsRef.current = state.userLearningSkills; // Initialize the ref with current skills
    }
    return () => {
      if (timerRef.current) {
        timerRef.current.clear();
      }
    };
  }, [state.userLearningSkills, state.isInitialized, setupTimer]); // Added setupTimer dependency

  const checkLearnedSkill = useCallback((skillId) => {
    return state.userLearnedSkills?.find(skill => skill?.skill_id === skillId);
  }, [state.userLearnedSkills]);

  const checkLearningSkill = useCallback((skillId) => {
    return state.userLearningSkills?.find(skill => skill?.type_id === skillId && !skill?.sub_type);
  }, [state.userLearningSkills]);

  const checkLearningEffect = useCallback((effectId) => {
    return state.userLearningSkills?.find(
      skill => skill?.type_id === effectId && skill?.sub_type === 'constant_effects'
    );
  }, [state.userLearningSkills]);

  // Create memoized button info functions that don't depend on state directly
  const getButtonInfo = useCallback((skill) => {
    const learning = checkLearningSkill(skill?.skill_id);
    const learned = checkLearnedSkill(skill?.skill_id);
    return {
      text: learned ? translations.learned[lang] : 
            learning ? translations.learning[lang] : 
            skill?.coins_price,
      icon: learned || learning ? null : Icons.balance,
    };
  }, [checkLearningSkill, checkLearnedSkill, lang, Icons.balance]);

  const getEffectButtonInfo = useCallback((effect) => {
    const learning = checkLearningEffect(effect?.next?.id);
    return {
      text: learning ? translations.learning[lang] : effect?.next?.price,
      icon: learning ? null : Icons.balance,
    };
  }, [checkLearningEffect, lang, Icons.balance]);

  // Handle buying skills and boosts
  const handleBuySkill = useCallback(async (skill, sub_type = null) => {
    try {
      if (timerRef.current) {
        timerRef.current.clear();
        timerRef.current = null;
      }
      if (isInitializingRef.current) return; // Prevent reentrant calls
      isInitializingRef.current = true;

      const skillId = sub_type ? skill.next?.id : skill.skill_id;
      await startProcess("skill", userId, skillId, sub_type);
      // After buying, reinitialize everything and hide modal
      await initializeData();
      setVisibleModal(false);
    } catch (error) {
      console.error("Buy skill failed:", error);
    } finally {
      isInitializingRef.current = false;
    }
  }, [userId, initializeData, setVisibleModal]);

  const handleBoost = useCallback(async (boostId, skillId, subType = null) => {
    try {
      if (timerRef.current) {
        timerRef.current.clear();
        timerRef.current = null;
      }
      if (isInitializingRef.current) return; // Prevent reentrant calls
      isInitializingRef.current = true;

      await useBoost(userId, boostId, skillId, subType);
      // After boosting, reinitialize everything and hide modal
      await initializeData();
      setVisibleModal(false);
    } catch (error) {
      console.error("Boost failed:", error);
    } finally {
      isInitializingRef.current = false;
    }
  }, [userId, initializeData, setVisibleModal]);

  // IMPORTANT: These functions are used to build modal data for a skill or effect
  // Removed cyclical dependencies by using stable refs
  const createSkillModalData = useCallback((skill) => {
    if (!skill) return null;
    
    const learned = checkLearnedSkill(skill?.skill_id);
    const learning = checkLearningSkill(skill?.skill_id);
    
    return {
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
          fillBackground: userParameters?.coins < skill?.coins_price ? "#4E1010" : "#0E3228",
        },
        {
          icon: Icons.levelIcon,
          text: translations.requiredLevel[lang],
          value: skill?.requiredLevel,
          fillPercent: "100%",
          fillBackground: userParameters?.level < skill?.requiredLevel ? "#4E1010" : "#0E3228",
        },
        skill?.skill_id_required && {
          icon: state.skills?.find(sk => sk?.skill_id === skill?.skill_id_required)?.link,
          text: state.skills?.find(sk => sk?.skill_id === skill?.skill_id_required)?.name[lang],
          fillPercent: "100%",
          fillBackground: !checkLearnedSkill(skill?.skill_id_required) ? "#4E1010" : "#0E3228",
        },
        {
          icon: Icons.clock,
          text: translations.duration[lang],
          fillPercent: learning ? countPercentage(
            learning.remainingSeconds,
            learning.totalSeconds
          ) : 0,
          value: learning ? learning.formattedTime : formatTime(skill?.duration)
        },
      ].filter(Boolean),
      buttons: [
        {
          text: learned ? translations.learned[lang] : 
                learning ? translations.learning[lang] : 
                skill?.coins_price,
          icon: learned || learning ? null : Icons.balance,
          onClick: !(learning || learned) ? () => handleBuySkill(skill) : null,
          active: !(learning || learned) && 
            (skill?.skill_id_required ? checkLearnedSkill(skill?.skill_id_required) : true) && 
            userParameters?.level >= skill?.requiredLevel && 
            userParameters.coins >= skill.coins_price,
        },
        ...(learning && !learned ? [
          {
            icon: "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/icons%2F%D1%83%D1%81%D0%BA%D0%BE%D1%80-25.png",
            text: translations.boost[lang] + ' x25%',
            active: state.userBoosts?.find(boost => boost.boost_id === 7),
            onClick: state.userBoosts?.find(boost => boost.boost_id === 7) ? 
              () => handleBoost(7, skill.skill_id, null) : null,
          },
          {
            icon: "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/icons%2F%D1%83%D1%81%D0%BA%D0%BE%D1%80-50.png",
            text: translations.boost[lang] + ' x50%',
            active: state.userBoosts?.find(boost => boost.boost_id === 8),
            onClick: state.userBoosts?.find(boost => boost.boost_id === 8) ? 
              () => handleBoost(8, skill.skill_id, null) : null,
          },
        ] : [])
      ],
    };
  }, [
    Icons, 
    lang, 
    translations, 
    checkLearnedSkill, 
    checkLearningSkill, 
    userParameters,
    state.skills,
    state.userBoosts,
    handleBuySkill,
    handleBoost
  ]);

  const createEffectModalData = useCallback((effect) => {
    if (!effect || !effect.next) return null;
    
    const learning = checkLearningEffect(effect?.next?.id);
    
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
          fillBackground: userParameters?.coins < (effect?.next?.price || 0) ? "#4E1010" : "#0E3228",
        },
        {
          icon: Icons.levelIcon,
          text: translations.requiredLevel[lang],
          value: effect?.next?.required_level || 0,
          fillPercent: "100%",
          fillBackground: userParameters?.level < (effect?.next?.required_level || 0) ? "#4E1010" : "#0E3228",
        },
        {
          icon: Icons.clock,
          text: translations.duration[lang],
          fillPercent: learning ? countPercentage(
            learning.remainingSeconds,
            learning.totalSeconds
          ) : 0,
          value: learning ? learning.formattedTime : formatTime(effect?.next?.duration || 0)
        }
      ].filter(Boolean),
      buttons: [
        {
          text: learning ? translations.learning[lang] : effect?.next?.price,
          icon: learning ? null : Icons.balance,
          onClick: !learning ? () => handleBuySkill(effect, 'constant_effects') : null,
          active: !learning && 
            userParameters?.level >= (effect?.next?.required_level || 0) && 
            userParameters.coins >= (effect?.next?.price || 0),
        },
        ...(learning ? [
          {
            icon: "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/icons%2F%D1%83%D1%81%D0%BA%D0%BE%D1%80-25.png",
            text: translations.boost[lang] + ' x25%',
            active: state.userBoosts?.find(boost => boost.boost_id === 7),
            onClick: state.userBoosts?.find(boost => boost.boost_id === 7) ? 
              () => handleBoost(7, effect.next?.id, 'constant_effects') : null,
          },
          {
            icon: "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/icons%2F%D1%83%D1%81%D0%BA%D0%BE%D1%80-50.png",
            text: translations.boost[lang] + ' x50%',
            active: state.userBoosts?.find(boost => boost.boost_id === 8),
            onClick: state.userBoosts?.find(boost => boost.boost_id === 8) ? 
              () => handleBoost(8, effect?.next?.id, 'constant_effects') : null,
          },
        ] : [])
      ],
    };
  }, [
    Icons, 
    lang, 
    translations, 
    checkLearningEffect, 
    userParameters,
    state.userBoosts,
    handleBuySkill,
    handleBoost
  ]);

  // These functions are called from the item cards
  const getItemSkillParamsBlock = useCallback((skill) => {
    const learned = checkLearnedSkill(skill?.skill_id);
    if (learned) return [];

    const learning = checkLearningSkill(skill?.skill_id);
    const totalSeconds = learning?.totalSeconds || (skill.duration * 60);
    const remainingSeconds = learning?.remainingSeconds || totalSeconds;

    const timerBar = {
      icon: Icons.clock,
      fillPercent: learning ? countPercentage(
        remainingSeconds,
        totalSeconds
      ) : 0,
      value: learning ? learning.formattedTime : formatTime(skill.duration)
    };

    const accessStatus = !learned && !learning && 
      (!skill.skill_id_required || checkLearnedSkill(skill.skill_id_required)) &&
      userParameters?.coins >= skill.coins_price &&
      userParameters.level >= skill.requiredLevel;

    const accessBar = {
      icon: accessStatus ? Icons.unlockedIcon : Icons.lockedIcon,
      value: accessStatus ? translations.available[lang] : translations.unavailable[lang],
    };

    return [[timerBar], [accessBar]];
  }, [checkLearnedSkill, checkLearningSkill, userParameters, Icons, translations, lang]);

  const getItemEffectsParamsBlock = useCallback((effect) => {
    const learning = checkLearningEffect(effect?.next?.id);
    const totalSeconds = learning?.totalSeconds || (effect.next.duration * 60);
    const remainingSeconds = learning?.remainingSeconds || totalSeconds;

    const timerBar = {
      icon: Icons.clock,
      fillPercent: learning ? countPercentage(
        remainingSeconds,
        totalSeconds
      ) : 0,
      value: learning ? learning.formattedTime : formatTime(effect.next.duration),
    };

    const accessStatus = !learning && 
      userParameters?.coins >= effect.next.price && 
      userParameters.level >= effect.next.required_level;

    const accessBar = {
      icon: accessStatus ? Icons.unlockedIcon : Icons.lockedIcon,
      value: accessStatus ? translations.available[lang] : translations.unavailable[lang],
    };

    return [[timerBar], [accessBar]];
  }, [checkLearningEffect, userParameters, Icons, translations, lang]);

  // Handlers for card buttons that open modals
  const openSkillModal = useCallback((skill) => {
    const modalData = createSkillModalData(skill);
    setModalData(modalData);
    setVisibleModal(true);
  }, [createSkillModalData, setModalData, setVisibleModal]);

  const openEffectModal = useCallback((effect) => {
    const modalData = createEffectModalData(effect);
    setModalData(modalData);
    setVisibleModal(true);
  }, [createEffectModalData, setModalData, setVisibleModal]);

  // Card button configurations
  const getItemSkillButton = useCallback((skill) => {
    const learned = checkLearnedSkill(skill?.skill_id);
    const learning = checkLearningSkill(skill?.skill_id);
    const active = !learned && !learning && 
      (!skill.skill_id_required || checkLearnedSkill(skill.skill_id_required)) &&
      userParameters?.coins >= skill.coins_price && 
      userParameters.level >= skill.requiredLevel;

    return [{
      ...getButtonInfo(skill),
      onClick: () => openSkillModal(skill),
      active,
    }];
  }, [checkLearnedSkill, checkLearningSkill, userParameters, getButtonInfo, openSkillModal]);

  const getItemEffectButton = useCallback((effect) => {
    const learning = checkLearningEffect(effect?.next?.id);
    const active = !learning && 
      userParameters?.coins >= effect.next.price && 
      userParameters.level >= effect.next.required_level;

    return [{
      ...getEffectButtonInfo(effect),
      onClick: () => openEffectModal(effect),
      active,
    }];
  }, [checkLearningEffect, userParameters, getEffectButtonInfo, openEffectModal]);

  // Update modal data when needed
  useEffect(() => {
    if (!modalData || !state.isInitialized || modalUpdateRef.current) return;
    
    modalUpdateRef.current = true;
    
    try {
      if (modalData?.type === "skill") {
        if (modalData?.sub_type === 'constant_effects') {
          const effectEntry = Object.entries(state.effects || {}).find(([_, effect]) => 
            effect?.next?.id === modalData.id || effect?.current?.id === modalData.id
          );
          
          if (effectEntry) {
            const updatedModalData = createEffectModalData(effectEntry[1]);
            if (updatedModalData && updatedModalData.id === modalData.id) {
              setModalData(updatedModalData);
            }
          }
        } else {
          const currentSkill = state.skills?.find(skill => skill?.skill_id === modalData?.id);
          if (currentSkill) {
            const updatedModalData = createSkillModalData(currentSkill);
            if (updatedModalData && updatedModalData.id === modalData.id) {
              setModalData(updatedModalData);
            }
          }
        }
      }
    } finally {
      modalUpdateRef.current = false;
    }
  }, [
    state
  ]);

  if (!state.isInitialized) return null;

  return (
    <ScreenContainer withTab>
      {state.skills?.filter(skill => checkLearningSkill(skill.skill_id) && !checkLearnedSkill(skill.skill_id))
        .map((skill, index) => (
          <ItemCard
            key={`learning-skill-${skill.skill_id}`}
            ItemIcon={skill?.link}
            ItemTitle={skill.name[lang]}
            ItemDescription={skill?.description?.[lang]}
            ItemParamsBlocks={getItemSkillParamsBlock(skill)}
            ItemButtons={getItemSkillButton(skill)}
            ItemIndex={index + 1}
          />
        ))}

      {state.effects && Object.entries(state.effects)
        .filter(([_, effect]) => effect?.next && checkLearningEffect(effect?.next?.id))
        .map(([key, effect], index) => {
          const displayEffect = effect.current || effect.next;
          return (
            <ItemCard
              key={`learning-effect-${displayEffect.id}`}
              ItemIcon={displayEffect.link}
              ItemTitle={displayEffect.name[lang]}
              ItemDescription={displayEffect.description?.[lang]}
              ItemParamsBlocks={getItemEffectsParamsBlock(effect)}
              ItemButtons={getItemEffectButton(effect)}
              ItemBottomAmount={(lang === 'en' ? 'Level ' : 'Уровень ') + (effect.current?.level || 0)}
              ItemIndex={index + 1}
            />
          );
        })}

      {state.skills?.filter(skill => !checkLearningSkill(skill.skill_id) && !checkLearnedSkill(skill.skill_id))
        .map((skill, index) => (
          <ItemCard
            key={`available-skill-${skill.skill_id}`}
            ItemIcon={skill?.link}
            ItemTitle={skill.name[lang]}
            ItemDescription={skill?.description?.[lang]}
            ItemParamsBlocks={getItemSkillParamsBlock(skill)}
            ItemButtons={getItemSkillButton(skill)}
            ItemIndex={index + 1}
          />
        ))}

      {state.effects && Object.entries(state.effects)
        .filter(([_, effect]) => effect?.next && !checkLearningEffect(effect?.next?.id))
        .map(([key, effect], index) => {
          const displayEffect = effect.current || effect.next;
          return (
            <ItemCard
              key={`available-effect-${displayEffect.id}`}
              ItemIcon={displayEffect.link}
              ItemTitle={displayEffect.name[lang]}
              ItemDescription={displayEffect.description?.[lang]}
              ItemParamsBlocks={getItemEffectsParamsBlock(effect)}
              ItemButtons={getItemEffectButton(effect)}
              ItemBottomAmount={(lang === 'en' ? 'Level ' : 'Уровень ') + (effect.current?.level || 0)}
              ItemIndex={index + 1}
            />
          );
        })}

      {state.skills?.filter(skill => !checkLearningSkill(skill.skill_id) && checkLearnedSkill(skill.skill_id))
        .map((skill, index) => (
          <ItemCard
            key={`learned-skill-${skill.skill_id}`}
            ItemIcon={skill?.link}
            ItemTitle={skill.name[lang]}
            ItemDescription={skill?.description?.[lang]}
            ItemParamsBlocks={getItemSkillParamsBlock(skill)}
            ItemButtons={getItemSkillButton(skill)}
            ItemIndex={index + 1}
          />
        ))}
    </ScreenContainer>
  );
};

export default SkillTab;