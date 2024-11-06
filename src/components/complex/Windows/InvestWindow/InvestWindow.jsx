import "./InvestWindow.css"
import Assets from "../../../../assets"
import InvestCard from "../../investCard/InvestCard"

const InvestWindow = () => {
  const { Icons } = Assets

  const investList = [
    {
      icon: Icons.calc,
      name: "Название",
      level: 1,
      autoClaim: false,
      upgradeStatus: true,
      claimStatus: true,
      progress: 150,
      capacity: 200,
      dataIcon: Icons.manager
    },
    {
      icon: Icons.coffeeShop,
      name: "Кофейня",
      level: 5,
      autoClaim: false,
      upgradeStatus: true,
      claimStatus: true,
      progress: 150,
      capacity: 200,
    },
    {
      icon: Icons.barber,
      name: "Барбершоп",
      level: 1,
      autoClaim: true,
      upgradeStatus: true,
      claimStatus: true,
      progress: 150,
      capacity: 200,
    },
  ]
  return (
    <div className="InvestWindow" style={{ overflowY: "scroll" }}>
      {investList.map((invest, index) => (
        <InvestCard key={index} name={invest.name}level={invest.level}
        icon={invest.icon}
        height={"17%"}
        width={"95%"}
        progress={invest.progress}
        capacity={invest.capacity}
        autoClaim={invest.autoClaim}
        upgradeStatus={invest.upgradeStatus}
        claimStatus={invest.claimStatus}
        dataIcon={invest.dataIcon}
        />
      
      ))}
    </div>
  )
}

export default InvestWindow
