import { useNavigate } from 'react-router-dom';
import "./ScreenBody.css"

const ScreenBody = ({ children, activity }) => {
    const navigate = useNavigate();

    const handleClose = () => {
        navigate('/');
    };

    return (
        <div className="ScreenBody" style={{ 
            display: 'flex', 
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
            background: 'black'
        }}>
            {/* Fixed Header */}
            <div className="HomeHeaderBottomName" style={{ 
                height: '55px',
                minHeight: '55px',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '100%',
                color: 'white', 
                fontFamily: 'Anonymous pro',
                fontSize: '20px',
                fontWeight: '700',
                position: 'relative',
                backgroundColor: 'black',
                
            }}>
                <div>
                    <p>{activity}</p>
                </div>
                <button 
                    onClick={handleClose} 
                    style={{
                        position: 'absolute',
                        left: 10,
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer'
                    }}
                >
                    <div style={{
                        width: 0,
                        height: 0,
                        borderTop: '10px solid transparent',
                        borderBottom: '10px solid transparent',
                        borderRight: '20px solid rgb(255, 118, 0)',
                    }} />
                </button>
            </div>

            {/* Scrollable Content Area */}
            <div style={{
                marginTop: 0,
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                WebkitOverflowScrolling: 'touch', // For smooth scrolling on iOS
                msOverflowStyle: 'none', // Hide scrollbar in IE/Edge
                scrollbarWidth: 'none', // Hide scrollbar in Firefox
                position: 'relative',
                background: 'none'
            }}>
                {children}
            </div>
        </div>
    );
};

export default ScreenBody;