import React from 'react';
import './ProcessProgressBar.css'
import Assets from '../../../assets';

const getIcons = (processType) => {
    const typeToIconsMap = {
        'work': [<img height={45} width={45} src={Assets.Icons.boss} />, <img height={35} width={35} src={Assets.Icons.balance} />],
        'training': [<img height={40} width={40} src={Assets.Icons.training} style={{ marginTop: '5px', marginLeft: '10px'}} />, <img height={43} width={43} src={Assets.Icons.clock}/>],
        'sleep': [<img height={65} width={65} src={Assets.Icons.sleep} style={{ top: '-2.7%'}} />, <img height={43} width={43} src={Assets.Icons.clock}/>],
    }

    return typeToIconsMap[processType]
}

const getLabels = (processType, rate) => {
    const typeToLabel = {
        'work': ['Boss'],
        'training': ['Training', rate],
        'sleep': ['Long Sleep', rate],
    }

    return typeToLabel[processType]
}

const ProcessProgressBar = ({ activeProcess = 'working', value = 60, max = 100, reverse = false, rate }) => {
    const percentage = (value / max) * 100;

    const [iconLeft, iconRight] = getIcons(activeProcess)
    const [labelLeft, labelRight] = getLabels(activeProcess, rate)

    return (
        <div className="progress-bar-container-fixed-top"style={{ 
           paddingTop: (window.Telegram?.WebApp.safeAreaInset?.top || 0) + 120.5,
        }}>
            <div className="progress-bar-container">
                <div className="progress-bar-wrapper">
                    <div className="progress-bar-header">
                        <div className="progress-bar-icon-left">
                            {iconLeft}
                        </div>
                        <div className="progress-bar-label-left">{labelLeft}</div>
                        <div className="progress-bar-label-right">{labelRight}</div>
                        <div className="progress-bar-icon-right" style={{ top: '-5px', right: '-4%' }}>
                            {iconRight}
                        </div>
                    </div>
                    <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${percentage}%`, marginLeft: reverse ? `${100 - percentage}%` : '0' }} />
          </div>
                </div>
            </div>
        </div>
    );
};

export default ProcessProgressBar;