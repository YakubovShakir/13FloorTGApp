import "./ActivityTraining.css"
import ActionCard from "../ActionCard/ActionCard"
import Assets from "../../../assets"
const ActivityTraining = () => {
  const { Icons, BG } = Assets

  const processCard = {
    title: "Тренировка",
    backgroundImage: BG.trainingCardBG,
    icon: Icons.training,
    sourceParams: {
      health: {
        icon: Icons.happiness,
        value: "+5/ч",
      },
      hungry: {
        icon: Icons.happiness,
        value: "-5/ч",
      },
      energy: {
        icon: Icons.energy,
        value: "-5/ч",
      },
    },
    duration: "1ч 00м",
    buttons: [{ text: "Начать", color: "#00c200" }],
  }

  const boostCards = [
    {
      title: "Новые упражнения",
      icon: Icons.training,
      sourceParams: {
        health: {
          icon: Icons.happiness,
          value: "+5%",
          color: "#00C200",
        },
        hungry: {
          icon: Icons.happiness,
          value: "+5%",
          color: "#00C200",
        },
      },
      buttons: [{ icon: Icons.balance, text: "400", active: true}],
    },
    {
      title: "Прогулка",
      type: "completed",
      icon: Icons.training,
      sourceParams: {
        health: {
          icon: Icons.happiness,
          value: "+5%",
          color: "#00C200",
        },
        hungry: {
          icon: Icons.happiness,
          value: "+5%",
          color: "#00C200",
        },
      },
      buttons: [{ icon: Icons.balance, text: "400", active: false}],
    },
    {
      title: "Прокаченная карточка",
      type: "unavailable",
      icon: Icons.training,
      sourceParams: {
        health: {
          icon: Icons.happiness,
          value: "+5%",
          color: "#00C200",
        },
        hungry: {
          icon: Icons.happiness,
          value: "+5%",
          color: "#00C200",
        },
      },
      buttons: [{ icon: Icons.balance, text: "400", color: "#00c200" }],
    },
    {
      title: "Прокаченная карточка",
      type: "unavailable",
      icon: Icons.training,
      sourceParams: {
        health: {
          icon: Icons.happiness,
          value: "+5%",
          color: "#00C200",
        },
        hungry: {
          icon: Icons.happiness,
          value: "+5%",
          color: "#00C200",
        },
      },
      buttons: [{ icon: Icons.balance, text: "400", color: "#00c200" }],
    },
  ]
  return (
    <div className="ActivityTraining" style={{ overflow: "hidden" }}>
      <ActionCard
        backgroundImage={processCard.backgroundImage}
        cardHeight="25%"
        cardWidth="90%"
        icon={processCard.icon}
        title={processCard.title}
        duration={processCard.duration}
        sourceParams={processCard.sourceParams}
        buttons={processCard.buttons}
      />
      <div
        style={{
          maxHeight: "75%",
          display: "flex",
          flexDirection: "column",
          gap: "5%",
          alignItems: "center",
          overflow: "scroll",
          paddingBottom: "5%",
        }}
      >
        {boostCards.map((card, index) => (
          <ActionCard
            key={index}
            title={card.title}
            icon={card.icon}
            sourceParams={card.sourceParams}
            buttons={card.buttons}
            cardHeight="13vh"
            cardWidth="90%"
            type={card.type}
          />
        ))}
      </div>
    </div>
  )
}

export default ActivityTraining
