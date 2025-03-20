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
import { useUser } from "../../../UserContext.jsx";
import FullScreenSpinner from "../../Home/FullScreenSpinner.jsx";

const SYNC_INTERVAL = 5 * 60 * 1000;
const TICK_INTERVAL = 1000;

const PerksTab = ({
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
    const lastSkillsRef = useRef(null);
    const isInitializingRef = useRef(false);
    const modalUpdateRef = useRef(false);

    const [state, setState] = useState({
        skills: null,
        effects: null,
        userLearningSkills: [],
        userLearnedSkills: null,
        trainingParameters: null,
        activeProcess: null,
        userBoosts: null,
        isInitialized: false,
        timerRunning: false,
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
        learning: { ru: 'Ускорить', en: 'Boost' },
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

    const calculateTime = useCallback((skills) => {
        return skills.map(skill => {
            const remainingSeconds = Math.max(0, skill.remainingSeconds - 1);
            const formatted = formatTime(
                Math.floor(remainingSeconds / 60),
                remainingSeconds % 60
            );

            return {
                ...skill,
                remainingSeconds,
                formattedTime: formatted || "0:00",
            };
        });
    }, []);

    const initializeData = useCallback(async () => {
        try {
            isInitializingRef.current = true; // Prevent concurrent updates
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
                    userLearningSkills: learningSkills.map(skill => {
                        const totalSeconds = skill.target_duration_in_seconds || skill.base_duration_in_seconds;
                        const processStart = moment(skill.createdAt).tz("Europe/Moscow");
                        const elapsedSeconds = moment().diff(processStart, "seconds");
                        const initialRemaining = Math.max(0, totalSeconds - elapsedSeconds);
                        return {
                            ...skill,
                            remainingSeconds: initialRemaining,
                            totalSeconds,
                            formattedTime: formatTime(
                                Math.floor(initialRemaining / 60),
                                initialRemaining % 60
                            ) || "0:00",
                        };
                    }),
                    userLearnedSkills: userSkills,
                    trainingParameters: trainingParams,
                    activeProcess: activeProc,
                    userBoosts: boosts,
                    isInitialized: true, // Always set to true after successful initialization
                }));
            }
        } catch (error) {
            console.error("Initialization failed:", error);
        } finally {
            isInitializingRef.current = false;
        }
    }, [userId]);

    useEffect(() => {
        mountedRef.current = true;
        if (!state.isInitialized) { // Only initialize if not already initialized
            initializeData();
        }
        return () => {
            mountedRef.current = false;
            if (timerRef.current) {
                timerRef.current.clear();
            }
        };
    }, [initializeData, state.isInitialized]);

    const setupTimer = useCallback(() => {
        if (!state.userLearningSkills?.length || !state.isInitialized || state.timerRunning) {
            return;
        }
    
        setState(prev => ({ ...prev, timerRunning: true }));
    
        const tick = () => {
            if (!mountedRef.current) return;
    
            setState(prev => {
                const updatedSkills = calculateTime(prev.userLearningSkills);
                const allCompleted = updatedSkills.every(skill => skill.remainingSeconds <= 0);
    
                if (allCompleted) {
                    if (timerRef.current) {
                        timerRef.current.clear();
                    }
                    // Instead of resetting everything, trigger a data refresh
                    initializeData(); // Re-fetch data without resetting isInitialized yet
                    return {
                        ...prev,
                        userLearningSkills: updatedSkills, // Keep updated skills until new data arrives
                        timerRunning: false,
                    };
                }
    
                lastSkillsRef.current = updatedSkills;
                return {
                    ...prev,
                    userLearningSkills: updatedSkills,
                };
            });
        };
    
        tick(); // Initial tick
        const tickInterval = setInterval(tick, TICK_INTERVAL);
    
        timerRef.current = {
            clear: () => {
                clearInterval(tickInterval);
                timerRef.current = null;
                setState(prev => ({ ...prev, timerRunning: false }));
            },
        };
    
        timerRef.current.clear = () => {
            clearInterval(tickInterval);
            timerRef.current = null;
            setState(prev => ({ ...prev, timerRunning: false }));
        };
    }, [state.userLearningSkills, state.isInitialized, calculateTime, initializeData]);

    useEffect(() => {
        if (state.isInitialized && state.userLearningSkills?.length > 0) {
            setupTimer();
            lastSkillsRef.current = state.userLearningSkills;
        } else if (timerRef.current) {
            timerRef.current.clear();
            setState(prev => ({ ...prev, timerRunning: false }));
        }
    }, [state.userLearningSkills, state.isInitialized, setupTimer]);

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

    const { refreshData } = useUser()

    const handleBuySkill = useCallback(async (skill, sub_type = null) => {
        try {
            if (isInitializingRef.current) return;
            isInitializingRef.current = true;

            const skillId = sub_type ? skill.next?.id : skill.skill_id;
            await startProcess("skill", userId, skillId, sub_type);
            
            await initializeData();
            await refreshData();
            lastSkillsRef.current = state.userLearningSkills;
            setVisibleModal(false);
        } catch (error) {
            console.error("Buy skill failed:", error);
        } finally {
            isInitializingRef.current = false;
        }
    }, [userId, initializeData, setVisibleModal]);

    const handleBoost = useCallback(async (boostId, skillId, subType = null) => {
        try {
            if (isInitializingRef.current) return;
            isInitializingRef.current = true;

            await useBoost(userId, boostId, skillId, subType);

            setState(prev => {
                const updatedSkills = prev.userLearningSkills.map(skill => {
                    if (skill.type_id === skillId && ((!subType && !skill.sub_type) || 
                        (subType === skill.sub_type))) {
                        const reductionFactor = boostId === 7 ? 0.75 : boostId === 8 ? 0.5 : 1;
                        const currentRemaining = skill.remainingSeconds;
                        const newRemainingSeconds = Math.max(0, Math.floor(currentRemaining * reductionFactor));
                        
                        return {
                            ...skill,
                            remainingSeconds: newRemainingSeconds,
                            formattedTime: formatTime(
                                Math.floor(newRemainingSeconds / 60),
                                newRemainingSeconds % 60
                            ) || "0:00"
                        };
                    }
                    return skill;
                });
                
                lastSkillsRef.current = updatedSkills;
                return {
                    ...prev,
                    userLearningSkills: updatedSkills
                };
            });

            setVisibleModal(false);
        } catch (error) {
            console.error("Boost failed:", error);
        } finally {
            isInitializingRef.current = false;
        }
    }, [userId, setVisibleModal]);

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
                    fillBackground: userParameters?.coins < skill?.coins_price ? "#4E1010" : "#00ff00",
                },
                {
                    icon: Icons.levelIcon,
                    text: translations.requiredLevel[lang],
                    value: skill?.requiredLevel,
                    fillPercent: "100%",
                    fillBackground: userParameters?.level < skill?.requiredLevel ? "#4E1010" : "#00ff00",
                },
                skill?.skill_id_required && {
                    icon: state.skills?.find(sk => sk?.skill_id === skill?.skill_id_required)?.link,
                    text: state.skills?.find(sk => sk?.skill_id === skill?.skill_id_required)?.name[lang],
                    fillPercent: "100%",
                    fillBackground: !checkLearnedSkill(skill?.skill_id_required) ? "#4E1010" : "#00ff00",
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
                        icon: "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/Boost%2FBoost3.webp",
                        text: translations.boost[lang] + ' x25%',
                        active: state.userBoosts?.find(boost => boost.boost_id === 7),
                        onClick: state.userBoosts?.find(boost => boost.boost_id === 7) ? 
                            () => handleBoost(7, skill.skill_id, null) : null,
                    },
                    {
                        icon: "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/Boost%2FBoost2.webp",
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

    const getCorrectEffect = (effect) => {
        return effect
    }

    const createEffectModalData = useCallback((effect) => {
        if (!effect || !effect.next) return null;
        
        const learning = checkLearningEffect(effect?.next?.id);
        
        return {
            type: "skill",
            sub_type: 'constant_effects',
            id: effect?.next?.id,
            title: effect.next?.name?.[lang] || effect.current?.name?.[lang] || 'Unnamed Effect',
            image: effect?.next?.link,
            blocks: [
                {
                    icon: Icons.balance,
                    text: translations.cost[lang],
                    value: effect?.next?.price || 0,
                    fillPercent: '100%',
                    fillBackground: userParameters?.coins < (effect?.next?.price || 0) ? "#4E1010" : "#00ff00",
                },
                {
                    icon: Icons.levelIcon,
                    text: translations.requiredLevel[lang],
                    value: effect?.next?.required_level || 0,
                    fillPercent: "100%",
                    fillBackground: userParameters?.level < (effect?.next?.required_level || 0) ? "#4E1010" : "#00ff00",
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
                        icon: "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/Boost%2FBoost3.webp",
                        text: translations.boost[lang] + ' x25%',
                        active: state.userBoosts?.find(boost => boost.boost_id === 7),
                        onClick: state.userBoosts?.find(boost => boost.boost_id === 7) ? 
                            () => handleBoost(7, effect.next?.id, 'constant_effects') : null,
                    },
                    {
                        icon: "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/Boost%2FBoost2.webp",
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

    const openEffectModal = useCallback((effect) => {
        const modalData = createEffectModalData(effect);
        setModalData(modalData);
        setVisibleModal(true);
    }, [createEffectModalData, setModalData, setVisibleModal]);


    const getItemEffectButton = useCallback((effect) => {
        const learning = checkLearningEffect(effect?.next?.id);
        const active = !learning && 
            userParameters?.coins >= effect.next.price && 
            userParameters.level >= effect.next.required_level;

        return [{
            text: learning ? translations.learning[lang] : effect?.next?.price,
            icon: learning ? null : Icons.balance,
            onClick: () => openEffectModal(effect),
            active: learning ? true : active,
        }];
    }, [checkLearningEffect, userParameters, lang, Icons, translations, openEffectModal]);

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
    }, [state.userLearningSkills]);

    if (!state.isInitialized) return <FullScreenSpinner/>;

    return (
        <ScreenContainer withTab>
            {/* {state.skills?.filter(skill => checkLearningSkill(skill.skill_id) && !checkLearnedSkill(skill.skill_id))
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
                ))} */}

            {state.effects && Object.entries(state.effects)
                .filter(([_, effect]) => effect?.next && checkLearningEffect(effect?.next?.id))
                .map(([key, effect], index) => {
                    const displayEffect = effect.next;
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

            {/* {state.skills?.filter(skill => !checkLearningSkill(skill.skill_id) && !checkLearnedSkill(skill.skill_id))
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
                ))} */}

            {state.effects && Object.entries(state.effects)
                .filter(([_, effect]) => effect?.next && !checkLearningEffect(effect?.next?.id))
                .map(([key, effect], index) => {
                    const displayEffect = effect.next;
                    return (
                        <ItemCard
                            key={`available-effect-${displayEffect.id}`}
                            ItemIcon={displayEffect.link}
                            ItemTitle={displayEffect.name[lang]}
                            ItemDescription={displayEffect?.description?.[lang]}
                            ItemParamsBlocks={getItemEffectsParamsBlock(effect)}
                            ItemButtons={getItemEffectButton(effect)}
                            ItemBottomAmount={(lang === 'en' ? 'Level ' : 'Уровень ') + (effect.current?.level || 0)}
                            ItemIndex={index + 1}
                        />
                    );
                })}

            {/* {state.skills?.filter(skill => !checkLearningSkill(skill.skill_id) && checkLearnedSkill(skill.skill_id))
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
                ))} */}
        </ScreenContainer>
    );
};

export default PerksTab;