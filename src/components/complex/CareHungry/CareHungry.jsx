import "./CareHungry.css"
import Assets from "../../../assets"
import ActionCard from "../ActionCard/ActionCard"

const CareHungry = () => {
  const { Icons } = Assets
  const cards = [
    {
      title: "Сытный бургер",
      icon: Icons.burger,
      sourceParams: {
        health: {
          icon: Icons.hungry,
          value: "+5%",
          color: "#00c200",
        },
        hungry: {
          icon: Icons.hungry,
          value: "+5%",
          color: "#00c200",
        },
      },
      duration: "1ч 00м",
      buttons: [
        {
          text: "400",
          color: "#00c200",
          icon: Icons.balance,
        },
      ],
      type: "available",
    },
    {
      title: "Сладкое пироженное",
      icon: Icons.cake,
      sourceParams: {
        health: {
          icon: Icons.hungry,
          value: "+5%",
          color: "#00c200",
        },
        hungry: {
          icon: Icons.hungry,
          value: "+5%",
          color: "#00c200",
        },
      },
      duration: "1ч 00м",
      buttons: [
        {
          text: "400",
          color: "#00c200",
          icon: Icons.balance,
        },
      ],
      type: "completed",
    },
    {
      title: "Пончик",
      icon: Icons.donat,
      sourceParams: {
        health: {
          icon: Icons.hungry,
          value: "+5%",
        },
        hungry: {
          icon: Icons.hungry,
          value: "+5%",
        },
      },
      duration: "1ч 00м",
      buttons: [
        {
          text: "400",
          color: "#00c200",
          icon: Icons.balance,
        },
      ],
      type: "available",
    },
  ]

  return (
    <div className="CareHungry">
      {cards.map((card, index) => (
        <ActionCard
          key={index}
          title={card.title}
          icon={card.icon}
          duration={card.duration}
          sourceParams={card.sourceParams}
          buttons={card.buttons}
          cardHeight="19%"
          cardWidth="90%"
          type={card.type}
        />
      ))}
    </div>
  )
}

export default CareHungry
