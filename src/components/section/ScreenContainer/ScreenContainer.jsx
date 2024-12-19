
const ScreenContainer = ({ withTab, children }) => {
    const height = withTab ? "77%" : "100%"
  return (
    <div
      style={{ height: height, maxHeight: height, overflowY: "scroll", padding: "5% 0"}}
      className="ScreenContainer"
    >
      {children}
    </div>
  )
}
export default ScreenContainer
