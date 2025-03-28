import { useState, useEffect, useCallback, memo } from "react";
import HomeHeader from "../../components/complex/HomeHeader/HomeHeader";
import Screen from "../../components/section/Screen/Screen";
import ScreenContainer from "../../components/section/ScreenContainer/ScreenContainerFood";
import ScreenBody from "../../components/section/ScreenBody/ScreenBodyFood";
import ItemCard from "../../components/simple/ItemCard/ItemCard";
import Modal from "../../components/complex/Modals/Modal/Modal";
import Assets from "../../assets";
import useTelegram from "../../hooks/useTelegram";
import { useNavigate } from "react-router-dom";
import { useSettingsProvider } from "../../hooks";
import { getWorks, buyWork } from "../../services/work/work";
import { getParameters } from "../../services/user/user";
import {
  startProcess,
  stopProcess,
  getActiveProcess,
} from "../../services/process/process";
import { getSkills, getUserSkills } from "../../services/skill/skill";
import { getTrainingParameters } from "../../services/user/user";
import { getLevels } from "../../services/levels/levels";
import { getBoosts, getUserBoosts } from "../../services/boost/boost";
import { canStartWorking, canStartTraining, canStartSleeping } from "../../utils/paramDep";
import { getCoinRewardAndColor, getDurationAndColor } from "../../utils/paramBlockUtils";
import sleepIcon from "./../../assets/IMG/icons/sleepIcon.png";
import { useUser } from "../../UserContext";

const ActionScreen = memo(() => {
  const [visibleModal, setVisibleModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [works, setWorks] = useState(null);
  const [skills, setSkills] = useState(null);
  const [userLearnedSkills, setUserLearnedSkills] = useState(null);
  const [activeProcess, setActiveProcess] = useState(null);
  const [trainingParameters, setTrainingParameters] = useState(null);
  const [levels, setLevels] = useState(null);
  const [boosts, setBoosts] = useState(null);
  const [userBoosts, setUserBoosts] = useState(null);
  const [isPreloading, setIsPreloading] = useState(true);
  const [error, setError] = useState(null);

  const { userId, userParameters } = useUser()

  const { lang } = useSettingsProvider();
  const navigate = useNavigate();
  const { Icons } = Assets;

  const translations = {
    activities: { ru: "Активности", en: "Activities" },
    development: { ru: "Развитие", en: "Progress" },
    start: { ru: "Начать", en: "Start" },
    stop: { ru: "Стоп", en: "Stop" },
    available: { ru: "Доступно", en: "Available" },
    unavailable: { ru: "Недоступно", en: "Unavailable" },
    cost: { ru: "Стоимость", en: "Cost" },
    hour: { ru: "ЧАС", en: "HOUR" },
    minute: { ru: "м.", en: "m." },
    currentWork: { ru: "Текущая работа", en: "Current work" },
    unlock: { ru: "Открыть", en: "Unlock" },
    noBoosts: { ru: "Открыто", en: "Done" },
    learned: { ru: "Изучено", en: "Learned" },
    boost: { ru: "Ускорить", en: "Boost" },
    training: { ru: "Тренировка", en: "Training" },
    inProgress: { ru: "В процессе", en: "In progress" },
    workDesc: {
      ru: "Отправляйся на работу, чтобы заработать немного монет!",
      en: "Go to work to earn some coins!",
    },
    trainingDesc: {
      ru: "Хорошая тренировка поднимает настроение!",
      en: "A good workout lifts your mood!",
    },
    sleep: { ru: "Сон", en: "Sleep" },
    sleepDesc: { ru: "Сон поможет восстановить энергию!", en: "Sleep will help restore energy!" },
  };

  const preloadData = useCallback(async () => {
    if(userParameters !== null) {
      try {
        setIsPreloading(true);
        const [
          worksData,
          skillsData,
          learnedSkills,
          process,
          trainingParams,
          levelsData,
          boostsData,
          userBoostsData,
        ] = await Promise.all([
          getWorks(),
          getSkills(),
          getUserSkills(userId),
          getActiveProcess(userId),
          getTrainingParameters(userId),
          getLevels(),
        ]);
  
        const userIdFromParams = userParameters.id;
        const [updatedSkills, updatedProcess, updatedTraining, updatedUserBoosts] = await Promise.all([
          getUserSkills(userIdFromParams),
          getActiveProcess(userIdFromParams),
          getTrainingParameters(userIdFromParams),
        ]);
  
        setWorks(worksData || []);
        setSkills(skillsData || []);
        setUserLearnedSkills(updatedSkills || []);
        setActiveProcess(updatedProcess);
        setTrainingParameters(updatedTraining);
        setLevels(levelsData || []);
        setBoosts(boostsData || []);
        setUserBoosts(updatedUserBoosts || []);
      } catch (error) {
        console.error("Error preloading data:", error);
        setError("Failed to load data. Please try again.");
      } finally {
        setIsPreloading(false);
      }
    }
  }, [userParameters]);

  useEffect(() => {
    preloadData();
    useTelegram.setBackButton(() => navigate("/"));

    const interval = setInterval(async () => {
      if (userId) {
        try {
          const [process, learnedSkills] = await Promise.all([
            getActiveProcess(userId),
            getUserSkills(userId),
          ]);
          setActiveProcess(process);
          setUserLearnedSkills(learnedSkills || []);
        } catch (error) {
          console.error("Error updating data:", error);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [preloadData, navigate, userId]);

  const checkLearnedSkill = useCallback(
    (skillId) => {
      if (!userLearnedSkills || !skills) return false;
      return (
        userLearnedSkills.some((skill) => skill?.skill_id === skillId) &&
        skills.some((skill) => skill?.skill_id === skillId)
      );
    },
    [userLearnedSkills, skills]
  );

  const getWorkById = useCallback(
    (workId) => {
      if (!works) return null;
      return works.find((work) => work?.work_id === workId) || null;
    },
    [works]
  );

  const handleStartWork = useCallback(async () => {
    if (!userId || !userParameters || !canStartWorking(userParameters)) return;
    await startProcess("work", userId);
    const updatedProcess = await getActiveProcess(userId);
    setActiveProcess(updatedProcess);
    navigate("/");
  }, [userId, userParameters, navigate, setActiveProcess]);

  const handleStopWork = useCallback(async () => {
    if (!userId) return;
    await stopProcess(userId);
    setActiveProcess(null);
  }, [userId, setActiveProcess]);

  const handleBuyWork = useCallback(
    async (workId) => {
      if (!userId) return;
      await buyWork(userId, workId);
      setVisibleModal(false);
    },
    [userId, setVisibleModal]
  );

  const setWorkModalData = useCallback(
    (work) => {
      if (!work || !userParameters || !skills) return null;
      const requiredRespect = userParameters.respect >= (work.respect_required || 0);
      const requiredLevel = userParameters.level >= (work.work_id || 0);
      const isNextLevelWork = work.work_id === (userParameters.work_id || 0) + 1;
      const requiredSkill = work.skill_id_required ? checkLearnedSkill(work.skill_id_required) : true;
      const enoughBalance = userParameters.coins >= (work.coins_price || 0);
      const buyStatus = requiredRespect && requiredSkill && requiredLevel && isNextLevelWork && enoughBalance;

      return {
        type: "work",
        id: work.work_id,
        title: work.name,
        image: work.link,
        blocks: [
          {
            icon: Icons.balance,
            text: work.coins_price || 0,
            fillPercent: "100%",
            fillBackground: userParameters.coins < (work.coins_price || 0) ? "#ff0000" : "#00ff00",
          },
          work.skill_id_required && {
            icon: skills.find((skill) => skill?.skill_id === work.skill_id_required)?.link || Icons.default,
            text: skills.find((skill) => skill?.skill_id === work.skill_id_required)?.name || "Unknown",
            fillPercent: "100%",
            fillBackground: !checkLearnedSkill(work.skill_id_required) ? "#ff0000" : "#00ff00",
          },
          {
            icon: Icons.respect,
            text: work.respect_required || 0,
            fillPercent: "100%",
            fillBackground: userParameters.respect < (work.respect_required || 0) ? "#ff0000" : "#00ff00",
          },
          {
            icon: Icons.hungryDecrease,
            text: `${((work.hungry_cost_per_minute || 0) / 60).toFixed(2)} / ${translations.minute[lang]}`,
          },
          {
            icon: Icons.moodDecrease,
            text: `${((work.mood_cost_per_minute || 0) / 60).toFixed(2)} / ${translations.minute[lang]}`,
          },
          {
            icon: Icons.energyDecrease,
            text: `${((work.energy_cost_per_minute || 0) / 60).toFixed(2)} / ${translations.minute[lang]}`,
          },
        ].filter(Boolean),
        buttons: [
          {
            text: buyStatus ? (work.coins_price || 0) : translations.unavailable[lang],
            icon: buyStatus && Icons.balance,
            active: buyStatus,
            onClick: buyStatus ? () => handleBuyWork(work.work_id) : null,
          },
        ],
      };
    },
    [userParameters, skills, checkLearnedSkill, handleBuyWork, lang, translations, Icons]
  );

  const getItemWorkParams = useCallback(
    (workId) => {
      const work = getWorkById(workId);
      if (!work || !userParameters) return [[], []];
      const currentWork = getWorkById(userParameters.work_id);
      const buyStatus =
        userParameters.respect >= (work.respect_required || 0) &&
        (work.skill_id_required ? checkLearnedSkill(work.skill_id_required) : true) &&
        userParameters.level >= (work.work_id || 0) &&
        workId === (userParameters.work_id || 0) + 1 &&
        userParameters.coins >= (work.coins_price || 0);

      const workDurationBase = Math.floor((work.duration || 0) * 60);

      if (currentWork?.work_id === workId) {
        return [
          [
            {
              ...getCoinRewardAndColor(workDurationBase, work.coins_in_hour || 0, userParameters),
              icon: Icons.balance,
            },
          ],
          [
            {
              ...getDurationAndColor("work", workDurationBase, userParameters),
              icon: Icons.clock,
            },
          ],
        ];
      }

      return [
        [
          {
            value: `${work.coins_in_hour || 0}/h`,
            icon: Icons.balance,
          },
        ],
        [
          {
            value: buyStatus ? translations.available[lang] : translations.unavailable[lang],
            icon: buyStatus ? Icons.unlockedIcon : Icons.lockedIcon,
          },
        ],
      ];
    },
    [userParameters, works, checkLearnedSkill, lang, translations, Icons]
  );

  const getItemWorkButton = useCallback(
    (workId) => {
      const work = getWorkById(workId);
      if (!work || !userParameters) return [];
      const currentWork = getWorkById(userParameters.work_id);
      const activeWork = activeProcess?.type === "work";
      const buyStatus =
        userParameters.respect >= (work.respect_required || 0) &&
        (work.skill_id_required ? checkLearnedSkill(work.skill_id_required) : true) &&
        userParameters.level >= (work.work_id || 0) &&
        workId === (userParameters.work_id || 0) + 1 &&
        userParameters.coins >= (work.coins_price || 0);
      const canStart = canStartWorking(userParameters);

      if (currentWork?.work_id === workId) {
        return [
          {
            text: activeWork ? translations.inProgress[lang] : translations.start[lang],
            onClick: activeWork ? handleStopWork : canStart ? handleStartWork : null,
            active: canStart || activeWork,
          },
        ];
      }

      return [
        {
          text: buyStatus ? (work.coins_price || 0) : translations.unlock[lang],
          onClick: () => {
            const modalData = setWorkModalData(work);
            if (modalData) {
              setModalData(modalData);
              setVisibleModal(true);
            }
          },
          icon: buyStatus && Icons.balance,
          active: buyStatus,
          shadowColor: buyStatus && "rgb(243, 117, 0)",
        },
      ];
    },
    [
      userParameters,
      works,
      activeProcess,
      checkLearnedSkill,
      handleStopWork,
      handleStartWork,
      setModalData,
      setVisibleModal,
      setWorkModalData,
      lang,
      translations,
      Icons,
    ]
  );

  const handleStartTraining = useCallback(async () => {
    if (!userId || !userParameters || !canStartTraining(userParameters)) return;
    await startProcess("training", userId);
    const updatedProcess = await getActiveProcess(userId);
    setActiveProcess(updatedProcess);
    navigate("/");
  }, [userId, userParameters, navigate, setActiveProcess]);

  const getItemTrainingParams = useCallback(() => {
    if (!trainingParameters || !userParameters) return [[], []];
    const trainingDurationInSeconds = (trainingParameters.duration || 0) * 60;
    return [
      [
        {
          icon: Icons.clock,
          ...getDurationAndColor("training", trainingDurationInSeconds, userParameters),
        },
      ],
      [
        {
          icon: Icons.boosterArrow,
          value: translations.noBoosts[lang],
        },
      ],
    ];
  }, [trainingParameters, userParameters, lang, translations, Icons]);

  const getItemTrainingButton = useCallback(() => {
    if (!userParameters) return [];
    const canStart = canStartTraining(userParameters);
    return [
      {
        text: activeProcess?.type === "training" ? translations.inProgress[lang] : translations.start[lang],
        active: canStart,
        onClick: canStart ? handleStartTraining : null,
      },
    ];
  }, [userParameters, activeProcess, handleStartTraining, lang, translations]);

  const handleStartSleep = useCallback(async () => {
    if (!userId || !userParameters || userParameters.energy >= userParameters.energy_capacity) return;
    await startProcess("sleep", userId);
    const updatedProcess = await getActiveProcess(userId);
    setActiveProcess(updatedProcess);
    navigate("/");
  }, [userId, userParameters, navigate, setActiveProcess]);

  const handleStopSleep = useCallback(async () => {
    if (!userId) return;
    await stopProcess(userId);
    setActiveProcess(null);
  }, [userId, setActiveProcess]);

  const getItemSleepParams = useCallback(() => {
    if (!levels || !userParameters) return [[], []];
    const userSleepDuration =
      (levels.find((level) => level?.level === userParameters.level)?.sleep_duration || 0) * 60;
    return [
      [
        {
          icon: Icons.clock,
          ...getDurationAndColor("sleep", userSleepDuration, userParameters),
        },
      ],
      [
        {
          icon: Icons.boosterArrow,
          value: translations.noBoosts[lang],
        },
      ],
    ];
  }, [levels, userParameters, lang, translations, Icons]);

  const getItemSleepButton = useCallback(() => {
    if (!userParameters) return [];
    const canStart = canStartSleeping(userParameters);
    return [
      {
        text: activeProcess?.type === "sleep" ? translations.inProgress[lang] : translations.start[lang],
        active: canStart,
        onClick: () => {
          if (canStart) {
            activeProcess?.type === "sleep" ? handleStopSleep() : handleStartSleep();
          }
        },
      },
    ];
  }, [userParameters, activeProcess, handleStartSleep, handleStopSleep, lang, translations]);

  if (isPreloading || error || !userParameters) {
    return (
      <Screen>
      <HomeHeader>{translations.development[lang]}</HomeHeader>
      <ScreenBody activity={translations.activities[lang]}>
        <ScreenContainer>
          <div style={{ flex: 1, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ color: "white", textAlign: "center", padding: "20px" }}>Loading...</div>
          </div>
        </ScreenContainer>
      </ScreenBody>
    </Screen>
    );
  }
  
  return (
    <Screen>
      <HomeHeader>{translations.development[lang]}</HomeHeader>
      <ScreenBody activity={translations.activities[lang]}>
        {visibleModal && modalData && (
          <Modal
            onClose={() => setVisibleModal(false)}
            data={modalData}
            bottom={"0"}
            width={"100%"}
            height={"80%"}
          />
        )}
        <ScreenContainer>
          {/* Work Section */}
          {userParameters.work_id !== 0 && (
            <ItemCard
              ItemIcon={getWorkById(userParameters.work_id)?.link || Icons.default}
              ItemDescription={translations.workDesc[lang]}
              ItemTitle={getWorkById(userParameters.work_id)?.name?.[lang] || "Unknown Work"}
              ItemParamsBlocks={getItemWorkParams(userParameters.work_id)}
              ItemButtons={getItemWorkButton(userParameters.work_id)}
              ItemIndex={0}
            />
          )}

          {/* Training Section */}
          {trainingParameters && (
            <ItemCard
              ItemIcon={Icons.training}
              ItemTitle={translations.training[lang]}
              ItemDescription={translations.trainingDesc[lang]}
              ItemParamsBlocks={getItemTrainingParams()}
              ItemButtons={getItemTrainingButton()}
              ItemIndex={1}
            />
          )}

          {/* Sleep Section */}
          <ItemCard
            ItemIcon={sleepIcon}
            ItemTitle={translations.sleep[lang]}
            ItemDescription={translations.sleepDesc[lang]}
            ItemParamsBlocks={getItemSleepParams()}
            ItemButtons={getItemSleepButton()}
            ItemIndex={2}
          />
        </ScreenContainer>
      </ScreenBody>
    </Screen>
  );
});

ActionScreen.displayName = 'ActionScreen';

export default ActionScreen;