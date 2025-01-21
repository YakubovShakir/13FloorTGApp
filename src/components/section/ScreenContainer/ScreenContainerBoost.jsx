
const ScreenContainer = ({ withTab, children }) => {
    // const height = withTab ? "82%" : "90%"
  return (
    <div
      style={{ height: 'auto',  overflowY: "scroll"}}
      className="ScreenContainer"
    >
      {children}
    </div>
  )
}
export default ScreenContainer
