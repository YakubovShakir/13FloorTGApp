import "./ScreenBody.css"

const ScreenBody = ({ children, activity }) => {
    return (
        <div className="ScreenBody">
         <div className="HomeHeaderBottomRow" style={{ height: 55, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', color: 'white', fontFamily: 'Roboto', fontWeight: '200' }}>
             <div>
                <p>{activity}</p>
             </div>
        </div>
            {children}
        </div>
    )
}
export default ScreenBody