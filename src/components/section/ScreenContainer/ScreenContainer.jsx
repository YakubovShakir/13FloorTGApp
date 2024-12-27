
const ScreenContainer = ({ withTab, children }) => {
    const height = withTab ? "100%" : "100%"
  return (
    <div
      style={{ height: height, maxHeight: "80vh", overflowY: "scroll", padding: "5% 0"}}
      className="ScreenContainer"
    >
      {children}
    </div>
  )
}
export default ScreenContainer
