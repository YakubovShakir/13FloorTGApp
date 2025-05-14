import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import moment from "moment-timezone";
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer";
import SkillCard from "./SkillCard";
import Assets from "../../../assets";
import {
    getUserConstantEffects,
} from "../../../services/skill/skill";
import {
    getTrainingParameters,
} from "../../../services/user/user";
import {
    getProcesses,
    startProcess,
    getActiveProcess,
    checkCanStop,
} from "../../../services/process/process";
import { getUserBoosts, useBoost } from "../../../services/boost/boost.js";
import formatTime from "../../../utils/formatTime";
import countPercentage from "../../../utils/countPercentage.js";
import { useSettingsProvider } from "../../../hooks";
import FullScreenSpinner from "../../Home/FullScreenSpinner.jsx";
import { useUser } from "../../../UserContext.jsx";
import { useNavigate } from "react-router-dom";
import { handleStarsPayment } from "../../../utils/handleStarsPayment";
import { COLORS } from "../../../utils/paramBlockUtils";

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
    const isInitializingRef = useRef(false);
    const modalUpdateRef = useRef(false);
    const lastUpdateRef = useRef(0);
    const lastTickRef = useRef(0);
    const timerLockRef = useRef(false);

    const [state, setState] = useState({
        effects: null,
        userLearningEffects: [],
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
        noBoosts: { ru: "Открыто", en: "Done" },
        learned: { ru: 'Изучено', en: 'Learned' },
        learning: { ru: 'Изучение', en: 'Learning' }, // Updated to "Изучение" in Russian
        boost: { ru: 'Ускорить', en: 'Boost' },
        training: { ru: 'Тренировка', en: 'Training' },
        inProgress: { ru: 'В процессе', en: 'In progress' },
        trainingDesc: {
            ru: "Хорошая тренировка поднимает настроение!",
            en: "A good workout lifts your mood!"
        },
        duration: { ru: 'Длительность', en: 'Duration' },
        requiredLevel: { ru: 'Необходимый уровень', en: 'Required level' },
    };

    const calculateTime = useCallback((effects) => {
        return effects.map(effect => {
            const remainingSeconds = Math.max(0, effect.remainingSeconds - 1);
            const formatted = formatTime(
                Math.floor(remainingSeconds / 60),
                remainingSeconds % 60
            );
            const justCompleted = remainingSeconds === 0 && effect.remainingSeconds > 0;
            return {
                ...effect,
                remainingSeconds,
                formattedTime: formatted || "0:00",
                justCompleted,
            };
        });
    }, []);

    const initializeData = useCallback(async () => {
        const now = Date.now();
        if (now - lastUpdateRef.current < 2000) return;
        lastUpdateRef.current = now;

        try {
            isInitializingRef.current = true;
            const [
                learningSkills,
                boosts,
                constantEffects,
                activeProc,
                trainingParams,
            ] = await Promise.all([
                getProcesses("skill", userId),
                getUserBoosts(userId),
                getUserConstantEffects(userId),
                getActiveProcess(userId),
                getTrainingParameters(userId),
            ]);
            if (mountedRef.current) {
                const userLearningEffects = learningSkills
                    .filter(skill => skill.sub_type === "constant_effects")
                    .map(skill => {
                        const totalSeconds = skill.target_duration_in_seconds || skill.base_duration_in_seconds || 60;
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
                            justCompleted: false,
                        };
                    });

                setState(prev => ({
                    ...prev,
                    effects: constantEffects,
                    userLearningEffects,
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
    }, [userId]);

    const startTimer = useCallback(() => {
        if (timerLockRef.current) return;
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (!state.isInitialized || !state.userLearningEffects.length) return;

        timerLockRef.current = true;
        const tick = () => {
            const now = Date.now();
            if (now - lastTickRef.current < TICK_INTERVAL - 100) return;
            lastTickRef.current = now;

            if (!mountedRef.current) return;

            setState(prev => {
                const updatedEffects = calculateTime(prev.userLearningEffects);
                const completedEffects = updatedEffects.filter(effect => effect.justCompleted);
                if (completedEffects.length > 0) {
                    Promise.all(
                        completedEffects.map(effect =>
                            checkCanStop(userId, effect.type_id, 'constant_effects', 'skill')
                        )
                    )
                    .then(() => {
                        if (mountedRef.current) {
                            setTimeout(() => initializeData(), 1000);
                        }
                    })
                    .catch(error => {
                        console.error("Failed to stop completed effects:", error);
                        if (mountedRef.current) {
                            setTimeout(() => initializeData(), 1000);
                        }
                    });
                }

                const activeEffects = updatedEffects.filter(effect => effect.remainingSeconds > 0);
                if (!activeEffects.length && timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                    timerLockRef.current = false;
                }

                return {
                    ...prev,
                    userLearningEffects: updatedEffects.map(effect => ({
                        ...effect,
                        justCompleted: false,
                    })),
                };
            });
        };

        tick();
        timerRef.current = setInterval(tick, TICK_INTERVAL);
    }, [state.isInitialized, state.userLearningEffects, calculateTime, initializeData, userId]);

    useEffect(() => {
        mountedRef.current = true;
        initializeData();
        return () => {
            mountedRef.current = false;
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
                timerLockRef.current = false;
            }
        };
    }, [initializeData]);

    useEffect(() => {
        if (state.isInitialized && state.userLearningEffects.length > 0 && !timerRef.current) {
            startTimer();
        }
    }, [state.isInitialized, state.userLearningEffects.length, startTimer]);

    const checkLearningEffect = useCallback((effectId) => {
        return state.userLearningEffects?.find(
            skill => skill?.type_id === effectId && skill?.sub_type === 'constant_effects'
        );
    }, [state.userLearningEffects]);

    const { refreshData } = useUser();

    const handleBuySkill = useCallback(async (effect) => {
        try {
            if (isInitializingRef.current) return;
            isInitializingRef.current = true;

            if (!effect?.next?.id) {
                console.error("No next effect ID to buy:", effect);
                return;
            }

            await startProcess("skill", userId, effect.next.id, "constant_effects");
            await refreshData();
            await initializeData();
            if (!timerRef.current) {
                startTimer();
            }
            setVisibleModal(false);
        } catch (error) {
            console.error("Buy effect failed:", error);
        } finally {
            isInitializingRef.current = false;
        }
    }, [userId, initializeData, setVisibleModal, startTimer, refreshData]);

    const handleStarsBuy = useCallback(async (effect) => {
        try {
            if (isInitializingRef.current) return;
            isInitializingRef.current = true;

            if (!effect?.next?.id) {
                console.error("No next effect ID for stars purchase:", effect);
                return;
            }

            await handleStarsPayment(userId, "skill", effect.next.id, lang, null, 'constant_effects');
            await refreshData();
            await initializeData();
            if (!timerRef.current) {
                startTimer();
            }
            setVisibleModal(false);
        } catch (error) {
            console.error("Stars purchase failed:", error);
        } finally {
            isInitializingRef.current = false;
        }
    }, [userId, lang, refreshData, initializeData, startTimer, setVisibleModal]);

    const handleBoost = useCallback(async (boostId, effectId) => {
        try {
            if (isInitializingRef.current) return;
            isInitializingRef.current = true;

            await useBoost(userId, boostId, effectId, "constant_effects");
            await initializeData();
            if (!timerRef.current) {
                startTimer();
            }
            setVisibleModal(false);
        } catch (error) {
            console.error("Boost failed:", error);
        } finally {
            isInitializingRef.current = false;
        }
    }, [userId, setVisibleModal, initializeData, startTimer]);

    const navigate = useNavigate();

    const createEffectModalData = useMemo(() => {
        return (effect) => {
            if (!effect || !effect.next || typeof effect.next !== 'object' || !effect.next.id) {
                console.warn("Invalid effect passed to createEffectModalData:", effect);
                return null
            }

            const learning = checkLearningEffect(effect.next.id);
            const learned = !!state.userLearningEffects?.find(
                skill => skill?.type_id === effect.next.id && skill?.remainingSeconds <= 0
            ); // Fixed the incomplete learned variable
            const isStarsPurchase = (effect.next.price_stars || 0) > 0;

            return {
                type: "skill",
                sub_type: 'constant_effects',
                id: effect.next.id,
                title: effect.next?.name?.[lang] || effect.current?.name?.[lang] || 'Unnamed Effect',
                image: effect.next?.link || '',
                blocks: [
                    {
                        icon: isStarsPurchase ? Icons.starsIcon : Icons.balance,
                        text: translations.cost[lang],
                        value: isStarsPurchase ? effect.next.price_stars : effect.next.price || 0,
                        fillPercent: '100%',
                        fillBackground: isStarsPurchase 
                            ? COLORS.GREEN 
                            : userParameters?.coins < (effect.next.price || 0) ? COLORS.RED : COLORS.GREEN,
                    },
                    {
                        icon: Icons.levelIcon,
                        text: translations.requiredLevel[lang],
                        value: effect.next.required_level || 0,
                        fillPercent: "100%",
                        fillBackground: userParameters?.level < (effect.next.required_level || 0) ? COLORS.RED : COLORS.GREEN,
                    },
                    {
                        icon: Icons.clock,
                        text: translations.duration[lang],
                        fillPercent: learning ? countPercentage(
                            learning.remainingSeconds,
                            learning.totalSeconds
                        ) : 0,
                        value: learning ? learning.formattedTime : formatTime(effect.next.duration || 1),
                    }
                ].filter(Boolean),
                buttons: [
                    // Only include the primary button if the effect is not being learned
                    ...(learning && !learned ? [] : [{
                        text: learned ? translations.learned[lang] : 
                              learning ? translations.learning[lang] : 
                              isStarsPurchase ? effect.next.price_stars : effect.next.price || 0,
                        icon: learned || learning ? null : (isStarsPurchase ? Icons.starsIcon : Icons.balance),
                        onClick: !(learning || learned) ? () => 
                            isStarsPurchase ? handleStarsBuy(effect) : handleBuySkill(effect) : null,
                        active: !(learning || learned) && 
                            userParameters?.level >= (effect.next.required_level || 0) && 
                            (isStarsPurchase || userParameters?.coins >= (effect.next.price || 0)),
                    }]),
                    ...(learning && !learned ? [
                        {
                            icon: "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/Boost%2FBoost3.webp",
                             text: translations.boost[lang] + ' x15%',
                            active: !!state.userBoosts?.find(boost => boost.boost_id === 7),
                            onClick: state.userBoosts?.find(boost => boost.boost_id === 7) ? 
                                () => handleBoost(7, effect.next.id, "constant_effects") : null,
                        },
                        {
                            icon: "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/Boost%2FBoost2.webp",
                             text: translations.boost[lang] + ' x25%',
                            active: !!state.userBoosts?.find(boost => boost.boost_id === 8),
                            onClick: state.userBoosts?.find(boost => boost.boost_id === 8) ? 
                                () => handleBoost(8, effect.next.id, "constant_effects") : null,
                        },
                    ] : [])
                ],
            };
        };
    }, [
        Icons, 
        lang, 
        translations, 
        checkLearningEffect, 
        userParameters,
        state.userBoosts,
        handleBuySkill,
        handleStarsBuy,
        handleBoost,
        navigate
    ]);

    const getItemEffectsParamsBlock = useMemo(() => {
        return (effect) => {
            if (!effect || !effect.next || typeof effect.next !== 'object' || !effect.next.id) {
                console.warn("Invalid effect in getItemEffectsParamsBlock:", effect);
                return [[{
                    icon: Icons.clock,
                    text: translations.duration[lang],
                    fillPercent: 0,
                    value: "N/A",
                }], [{
                    icon: Icons.lockedIcon,
                    value: translations.unavailable[lang],
                }]];
            }

            const learning = checkLearningEffect(effect.next.id);
            const totalSeconds = learning?.totalSeconds || ((effect.next.duration || 1) * 60);
            const remainingSeconds = learning?.remainingSeconds || totalSeconds;
            const isStarsPurchase = (effect.next.price_stars || 0) > 0;

            const timerBar = {
                icon: Icons.clock,
                fillPercent: learning ? countPercentage(remainingSeconds, totalSeconds) : 0,
                value: learning ? learning.formattedTime : formatTime(effect.next.duration || 1),
            };

            const accessStatus = !learning && 
                (isStarsPurchase || 
                 (userParameters?.coins >= (effect.next.price || 0) && 
                  userParameters.level >= (effect.next.required_level || 0)));

            const accessBar = {
                icon: accessStatus ? Icons.unlockedIcon : Icons.lockedIcon,
                value: accessStatus ? translations.available[lang] : translations.unavailable[lang],
            };

            return [[timerBar], [accessBar]];
        };
    }, [checkLearningEffect, userParameters, Icons, translations, lang]);

    const getItemEffectButton = useCallback((effect) => {
        if (!effect || !effect.next || typeof effect.next !== 'object' || !effect.next.id) {
            console.warn("Invalid effect in getItemEffectButton:", effect);
            return [{
                text: translations.unavailable[lang],
                icon: null,
                onClick: null,
                active: false,
            }];
        }

        const learning = checkLearningEffect(effect.next.id);
        const isStarsPurchase = (effect.next.price_stars || 0) > 0;
        const active = learning 
            ? true 
            : isStarsPurchase 
                ? true 
                : userParameters?.coins >= (effect.next.price || 0) && 
                  userParameters.level >= (effect.next.required_level || 0);

        return [{
            text: learning 
                ? translations.learning[lang] 
                : (isStarsPurchase ? effect.next.price_stars : effect.next.price || 0),
            icon: learning ? null : (isStarsPurchase ? Icons.starsIcon : Icons.balance),
            onClick: () => {
                const newModalData = createEffectModalData(effect);
                if (newModalData) {
                    setModalData(newModalData);
                    setVisibleModal(true);
                }
            },
            active,
            style: isStarsPurchase 
                ? {
                    borderColor: "rgb(34, 199, 163)",
                    background: "linear-gradient(to bottom, rgb(34 199 163 / 0%), rgb(34 199 163 / 24%))",
                    color: "rgb(255, 255, 255)",
                    filter: active ? "none" : "grayscale(100%)",
                }
                : {
                    background: "rgb(255, 118, 0)",
                    color: "rgb(255, 255, 255)",
                    filter: active ? "none" : "grayscale(100%)",
                },
        }];
    }, [checkLearningEffect, userParameters, lang, Icons, translations, setModalData, setVisibleModal, createEffectModalData]);

    const handleEffectUpdate = useCallback((updatedEffect) => {
        setState(prev => ({
            ...prev,
            userLearningEffects: prev.userLearningEffects.map(effect =>
                effect.type_id === updatedEffect.type_id && effect.sub_type === "constant_effects" ? 
                { ...updatedEffect, justCompleted: false } : effect
            ),
        }));
    }, []);

    useEffect(() => {
        if (!modalData || !state.isInitialized || modalUpdateRef.current) return;
        
        modalUpdateRef.current = true;
        
        try {
            if (modalData?.type === "skill" && modalData?.sub_type === 'constant_effects') {
                const effectEntry = Object.entries(state.effects || {}).find(([_, effect]) => 
                    effect?.next?.id === modalData.id || effect?.current?.id === modalData.id
                );
                
                if (effectEntry) {
                    const updatedModalData = createEffectModalData(effectEntry[1]);
                    if (updatedModalData && updatedModalData.id === modalData.id) {
                        if (JSON.stringify(updatedModalData) !== JSON.stringify(modalData)) {
                            setModalData(updatedModalData);
                        }
                    }
                }
            }
        } finally {
            modalUpdateRef.current = false;
        }
    }, [modalData, state.isInitialized, state.effects, createEffectModalData, setModalData]);

    if (!state.isInitialized) return <FullScreenSpinner/>;

    return (
        <ScreenContainer withTab>
            {state.userLearningEffects.map((effect, index) => {
                const matchedEffect = Object.values(state.effects || {}).find(e => e?.next?.id === effect.type_id) || {};
                return (
                    <SkillCard
                        key={`learning-effect-${effect.type_id}`}
                        skill={{
                            ...effect,
                            skill_id: effect.type_id,
                            next: matchedEffect.next,
                            current: matchedEffect.current,
                        }}
                        lang={lang}
                        translations={translations}
                        userParameters={userParameters}
                        checkLearningSkill={checkLearningEffect}
                        getItemSkillParamsBlock={getItemEffectsParamsBlock}
                        getItemSkillButton={getItemEffectButton}
                        index={index}
                        onUpdate={handleEffectUpdate}
                        bottomText={(lang === 'en' ? 'Level ' : 'Уровень ') + (matchedEffect?.current?.level || 0)}
                    />
                );
            })}

            {state.effects && Object.entries(state.effects)
                .filter(([_, effect]) => effect?.next && typeof effect.next === 'object' && effect.next.id && !checkLearningEffect(effect.next.id))
                .map(([key, effect], index) => (
                    <SkillCard
                        key={`available-effect-${effect.next.id}`}
                        skill={effect}
                        lang={lang}
                        translations={translations}
                        userParameters={userParameters}
                        checkLearningSkill={checkLearningEffect}
                        getItemSkillParamsBlock={getItemEffectsParamsBlock}
                        getItemSkillButton={getItemEffectButton}
                        index={index}
                        onUpdate={handleEffectUpdate}
                        bottomText={(lang === 'en' ? 'Level ' : 'Уровень ') + (effect.current?.level || 0)}
                    />
                ))}
        </ScreenContainer>
    );
};

export default PerksTab;