import { useNavigate } from 'react-router-dom';
import "./ScreenBody.css"

const ScreenBody = ({ children, activity }) => {
    const navigate = useNavigate(); // для навигации на главный экран

    const handleClose = () => {
        navigate('/'); // перенаправление на главную страницу
    };

    return (
        <div className="ScreenBody">
            <div className="HomeHeaderBottomName" style={{ height: 55, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', color: 'white', fontFamily: 'Muller', fontWeight: '200' }}>
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
                       borderTop: '10px solid transparent', // Прозрачная верхняя граница
                       borderBottom: '10px solid transparent', // Прозрачная нижняя граница
                       borderRight: '20px solid rgba(34, 199, 163, 1)', // Левая граница — зеленая
                    }} />
                </button>
            </div>
            {children}
        </div>
    );
};

export default ScreenBody;
