import { useState, useEffect, useRef } from "react"
import "./ActivityWork.css"
import Assets from "../../../assets"
import ActionCard from "../ActionCard/ActionCard"
import WorkModal from "../Modals/WorkModal/WorkModal"
import Modal from "../Modals/Modal/Modal"
// import { getImgUrl } from "../../../assets"
const ActivityWork = () => {
  const treeViewRef = useRef(null)
  const [visibleWorkModal, setVisibleWorkModal] = useState(false)
  const [currentWorkModal, setCurrentWorkModal] = useState(null)
  const { Icons, BG } = Assets
  //   function getImgUrl(name) {
  //     return new URL(`${name}`, import.meta.url).href
  //   }
  const workList = [
    {
      tier: 0,
      level: 1,
      name: "Уборщик",
      nameEng: "cleaner",
      cost: 0,
      type: "available",
      icon: Icons.cleaner,
      iconDark: Icons.cleanerDark,
    },
    {
      tier: 0,
      level: 2,
      name: "Курьер",
      nameEng: "courier",
      cost: 60,
      type: "available",
      icon: Icons.courier,
      iconDark: Icons.courierDark,
    },
    {
      tier: 0,
      level: 3,
      name: "Грузчик",
      nameEng: "loader",
      cost: 120,
      type: "available",
      icon: Icons.cleaner,
      iconDark: Icons.cleanerDark,
    },
    {
      tier: 0,
      level: 3,
      name: "Официант",
      nameEng: "waiter",
      cost: 180,
      type: "available",
      icon: Icons.cleaner,
      iconDark: Icons.cleanerDark,
    },
    {
      tier: 0,
      level: 3,
      name: "Стажер программист",
      nameEng: "intern",
      cost: 250,
      type: "unavailable",
      icon: Icons.cleaner,
      iconDark: Icons.cleanerDark,
    },
    {
      tier: 0,
      level: 4,
      name: "Охранник",
      nameEng: "security",
      cost: 250,
      type: "available",
      icon: Icons.cleaner,
      iconDark: Icons.cleanerDark,
    },
    {
      tier: 0,
      level: 4,
      name: "Ведущий мероприятий",
      nameEng: "host",
      cost: 300,
      type: "available",
      icon: Icons.cleaner,
      iconDark: Icons.cleanerDark,
    },
    {
      tier: 0,
      level: 4,
      name: "Ассистент журналиста",
      nameEng: "journalistAssistent",
      cost: 250,
      type: "unavailable",
      icon: Icons.cleaner,
      iconDark: Icons.cleanerDark,
    },
    {
      tier: 0,
      level: 4,
      name: "Junior разработчик",
      nameEng: "juniorDev",
      cost: 250,
      type: "unavailable",
      icon: Icons.cleaner,
      iconDark: Icons.cleanerDark,
    },
    {
      tier: 0,
      level: 5,
      name: "Помощник тренера",
      nameEng: "coachAssistent",
      cost: 250,
      type: "unavailable",
      icon: Icons.cleaner,
      iconDark: Icons.cleanerDark,
    },
    {
      tier: 0,
      level: 5,
      name: "Репортер",
      nameEng: "reporter",
      cost: 300,
      type: "available",
      icon: Icons.cleaner,
      iconDark: Icons.cleanerDark,
    },
    {
      tier: 0,
      level: 5,
      name: "Маркетолог",
      nameEng: "marketolog",
      cost: 250,
      type: "unavailable",
      icon: Icons.cleaner,
      iconDark: Icons.cleanerDark,
    },
    {
      tier: 0,
      level: 5,
      name: "Middle разработчик",
      nameEng: "middleDev",
      cost: 250,
      type: "unavailable",
      icon: Icons.cleaner,
      iconDark: Icons.cleanerDark,
    },
  ]
  const renderWorkTree = (workList) => {
    let tempLevel = workList[0].level
    let levelWorks = []
    let result = []
    for (let work of workList) {
      if (work.level != tempLevel) {
        result.push(levelWorks)
        levelWorks = [work]
        tempLevel = work.level
      } else {
        levelWorks.push(work)
      }
    }
    result.push(levelWorks)

    return result
  }

  const processCard = {
    title: "Название работы",
    backgroundImage: BG.workCardBG,
    icon: Icons.organizer,
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
    cost: "500/ч",
    buttons: [
      {
        text: "Начать",
        color: "#00c200",
      },
    ],
  }

  useEffect(() => {
    const scrollToCenter = () => {
      if (treeViewRef.current) {
        const { scrollWidth, clientWidth } = treeViewRef.current
        const scrollPosition = (scrollWidth - clientWidth) / 2
        treeViewRef.current.scrollLeft = scrollPosition
      }
    }

    scrollToCenter()
  }, [])

  return (
    <div className="ActivityWork">
      {visibleWorkModal && (
        <Modal
          width="85vw"
          height="60vh"
          title={currentWorkModal.title}
          data={() => <WorkModal work={currentWorkModal} />}
          onClose={setVisibleWorkModal}
        />
      )}
      <ActionCard
        backgroundImage={processCard.backgroundImage}
        cardHeight="25%"
        cardWidth="95%"
        icon={processCard.icon}
        title={processCard.title}
        sourceParams={processCard.sourceParams}
        buttons={processCard.buttons}
        cost={processCard.cost}
      />

      <div className="ActivityWorkTree" ref={treeViewRef}>
        {renderWorkTree(workList).map((height, index) => (
          <div
            key={index}
            // style={{ width: treeViewRef?.current?.scrollWidth + "px" }}
            className="ActivityWorkTreeHeight"
          >
            {height.map((work, index) => (
              <div key={index} className="ActivityWorkTreeHeightWork">
                <span>{work.name}</span>
                <img
                  className="ActivityWorkTreeHeightWorkLogo"
                  src={
                    work.type === "available"
                      ? Icons[work.nameEng]
                      : Icons[work.nameEng + "Dark"]
                  }
                  alt="workIcon"
                />
                <button
                  onClick={() => {
                    setCurrentWorkModal({
                      title: work.name,
                      icon:
                        work.type === "available"
                          ? Icons[work.nameEng]
                          : Icons[work.nameEng + "Dark"],
                      cost: work.cost,
                      type: work.type,
                    })
                    setVisibleWorkModal(true)
                  }}
                  style={{
                    backgroundColor: `${
                      work.type === "available" ? "#00C200" : "#D9D3C4"
                    }`,
                    boxShadow: `0px 9px 4px -5px rgb(49 87 49)`,
                  }}
                >
                  <img src={Icons.balance} alt="balanceIcon" />
                  <span>{work.cost}</span>
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActivityWork
