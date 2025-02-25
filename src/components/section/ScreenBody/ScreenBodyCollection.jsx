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
                 
                  boxShadow:' rgb(0, 0, 0) 2px 5px 12px 0px',
                  zIndex:' 1',
                  height: '55px',
                  minHeight: '55px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent:' center',
                  width: '100%',
                  color: 'white',
                  fontFamily: 'Anonymous pro',
                  fontSize: '20px',
                  fontWeight: '700',
                  position: 'relative',
                  backgroundColor:' #141414',
                
            }}>
                <div>
                    <p>{activity}</p>
                </div>
                <button 
    onClick={handleClose} 
    style={{
        paddingBottom: '4px',
        position: 'absolute',
        left:' 5%',
        border: '2px solid rgb(255, 0, 0)',
        cursor: 'pointer',
        width: '35px',
        height: '35px',
        backgroundColor: 'rgba(0, 0, 0, 0.52)',
        backdropFilter: 'blur(5px)',
        color:'rgb(255, 0, 0)',
        borderRadius:' 8px',
        fontSize:' 20px',
        bottom:'10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '22px',
        fontWeight: '900',
    }}
>
    {'\u2B8C'}
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
                // position: 'relative',
                background: 'none'
            }}>
                {children}
            </div>
        </div>
    );
};

export default ScreenBody;