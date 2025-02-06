import ItemCard from "../../../components/simple/ItemCard/ItemCardLeaderBoard"
import coins30000 from "../icons/coins30000.png"
import tg300000 from "../icons/tg30000.png"
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer"
import { useEffect, useState, useRef, useCallback } from "react"
import Assets from "../../../assets"
import { claimTask, getLeaderboard, getTasks } from "../../../services/user/user"
import { useSettingsProvider } from "../../../hooks"
import FullScreenSpinner from '../../Home/FullScreenSpinner'

const LeaderboardTab = ({ userId }) => {


  const { lang } = useSettingsProvider()

  const translations = {
    start: {
      ru: 'Начать',
      en: 'Start'
    },
    stop: {
      ru: 'Стоп',
      en: 'Stop'
    },
    available: {
      ru: 'Доступно',
      en: 'Available'
    },
    unavailable: {
      ru: 'Недоступно',
      en: 'Unavailable'
    },
    cost: {
      ru: 'Стоимость',
      en: 'Cost'
    },
    hour: {
      ru: 'ЧАС',
      en: 'HOUR'
    },
    minute: {
      ru: 'м',
      en: 'm'
    },
    currentWork: {
      ru: 'Текущая работа',
      en: 'Current work'
    },
    unlock: {
      ru: 'Открыть',
      en: 'Unlock'
    },
    noBoosts: {
      ru: 'Усилений нет',
      en: 'No boosts'
    },
    hungryDecrease: {
      ru: 'Расход голода',
      en: 'Satiety consumption '
    },
    moodDecrease: {
      ru: 'Расход настроения',
      en: 'Mood consumption'
    },
    check: {
      ru: 'Забрать',
      en: 'Grab'
    },
    link: {
      ru: 'Ссылка',
      en: 'Link'
    },

  }




  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState(null)
  const [leaders, setLeaders] = useState(null)

  useEffect(() => {
    setIsLoading(true)
    getLeaderboard().then(leaders => setLeaders(leaders)).then(() => setIsLoading(false))
    console.log(leaders)
  }, []) // Remove userId dependency

  if (isLoading) {
    return <FullScreenSpinner />
  } else {
    return <ScreenContainer>
      {leaders?.map((leader, index) =>
        <ItemCard
          key={leader.name}
          ItemButtons={[]}
          ItemTitle={leader.name}
          ItemDescription={true}
          ItemRespect={leader.respect}
          ItemTotalEarned={leader.total_earned}
          ItemNumberLeader={index + 1}
          ItemGender={leader.gender}
          ItemIndex={1} />
      )}
    </ScreenContainer>
  }
}

export default LeaderboardTab
