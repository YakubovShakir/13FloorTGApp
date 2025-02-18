import ItemCard from "../../../components/simple/ItemCard/ItemCardLeaderBoard"
import coins30000 from "../icons/coins30000.png"
import tg300000 from "../icons/tg30000.png"
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer"
import { useEffect, useState, useRef, useCallback, useContext } from "react"
import Assets from "../../../assets"
import { claimTask, getLeaderboard, getTasks } from "../../../services/user/user"
import { useSettingsProvider } from "../../../hooks"
import FullScreenSpinner from '../../Home/FullScreenSpinner'
import Button from "../../../components/simple/Button/Button"
import { useNavigate, UNSAFE_NavigationContext } from "react-router-dom";
import { formatCoins } from "../../../utils/formatCoins"
import UserContext from "../../../UserContext"

const LeaderboardTab = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState(null)
  const [leaders, setLeaders] = useState(null)

  const { userId } = useContext(UserContext)

  // Fix for MemoryRouter navigation stack
  function useCustomNavigate() {
    const navigate = useNavigate();
    const navigation = useContext(UNSAFE_NavigationContext).navigator;

    return (path) => {
      navigation.push(path);
      window.dispatchEvent(new PopStateEvent("popstate"));
    };
  }

  // In your component
  const navigate = useCustomNavigate();

  useEffect(() => {
    setIsLoading(true)
    getLeaderboard().then(leaders => setLeaders(leaders)).then(() => setIsLoading(false))
  }, []) // Remove userId dependency

  const formUsername = (leader) => {
    const { first_name = '', last_name = '' } = leader

    const formattedName = (first_name + ' ' + last_name).trimStart().trimEnd()

    return formattedName === '' ? 'Anon' : formattedName
  }

  if (isLoading) {
    return <FullScreenSpinner />
  } else {
    return <ScreenContainer>
      {leaders?.map((leader, index) => {
        return (
          <div onClick={() => leader.user_id !== userId ? navigate('/foreign-user/' + leader.user_id) : null}>
            <ItemCard
              key={leader.name}
              ItemButtons={[]}
              ItemTitle={formUsername(leader)}
              ItemDescription={true}
              ItemRespect={leader.respect}
              ItemTotalEarned={formatCoins(leader.total_earned)}
              ItemNumberLeader={index + 1}
              ItemGender={leader.gender}
              ItemIndex={1} />
          </div>
        )
      }
      )}
    </ScreenContainer>
  }
}

export default LeaderboardTab
