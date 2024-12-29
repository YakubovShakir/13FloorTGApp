
const ScreenContainer = ({ withTab, children }) => {
    const height = withTab ? "75%" : "80vh"
  return (
    <div
      style={{ height: height, overflowY: "scroll", padding: "5% 0"}}
      className="ScreenContainer"
    >
      {children}
    </div>
  )
}
export default ScreenContainer
