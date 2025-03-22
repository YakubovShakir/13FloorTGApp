import React, { useState, useEffect } from 'react';
import ItemCard from '../../../components/simple/ItemCard/ItemCard';
import './SkillCard.css';

const SkillCard = ({
    skill,
    lang,
    translations,
    userParameters,
    checkLearningSkill,
    getItemSkillParamsBlock,
    getItemSkillButton,
    index,
    onUpdate,
    bottomText,
}) => {
    const [localSkill, setLocalSkill] = useState(skill);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (skill.remainingSeconds !== localSkill.remainingSeconds || skill.justCompleted !== localSkill.justCompleted) {
            setLocalSkill(skill);
            if (skill.justCompleted) {
                setIsAnimating(true);
                setTimeout(() => {
                    setIsAnimating(false);
                    onUpdate?.({ ...skill, justCompleted: false }); // Clear justCompleted after animation
                }, 500);
            }
        }
    }, [skill, localSkill.remainingSeconds, localSkill.justCompleted, onUpdate]);

    const displayName = skill.next?.name?.[lang] || skill.current?.name?.[lang] || skill.name?.[lang] || 'Unnamed Effect';
    const displayDescription = skill.next?.description?.[lang] || skill.description?.[lang];
    const displayLink = skill.next?.link || skill.link || '';

    return (
        <div className={`skill-card ${isAnimating ? 'animate-update' : ''}`}>
            <ItemCard
                ItemIcon={displayLink}
                ItemTitle={displayName}
                ItemDescription={displayDescription}
                ItemParamsBlocks={getItemSkillParamsBlock(skill)}
                ItemButtons={getItemSkillButton(skill)}
                ItemIndex={index + 1}
                ItemBottomAmount={bottomText}
            />
        </div>
    );
};

export default React.memo(SkillCard, (prevProps, nextProps) => {
    return prevProps.skill.remainingSeconds === nextProps.skill.remainingSeconds &&
           prevProps.skill.justCompleted === nextProps.skill.justCompleted &&
           prevProps.skill.skill_id === nextProps.skill.skill_id;
});