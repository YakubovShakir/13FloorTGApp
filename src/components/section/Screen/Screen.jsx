import "./Screen.css"
const Screen = ({ children }) => {
  return (
    <div className="Screen" style={{ height: "100%", width: "100%" }}>
      {children}
    </div>
  )
}


export default Screen