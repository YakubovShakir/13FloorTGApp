
const ScreenContainer = ({ withTab, children }) => {
    // const height = withTab ? "82%" : "90%"
  return (
    <div
      style={{ height: 'auto',  overflowY: "scroll", padding: "5% 0 5% 0"}}
      className="ScreenContainer"
    >
      {children}
    </div>
  )
}
export default ScreenContainer
