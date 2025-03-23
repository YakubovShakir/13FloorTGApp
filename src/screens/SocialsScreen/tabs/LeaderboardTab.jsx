import { motion } from "framer-motion";
import ItemCard from "../../../components/simple/ItemCard/ItemCardLeaderBoard";
import coins30000 from "../icons/coins30000.png";
import tg300000 from "../icons/tg30000.png";
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer";
import { useEffect, useState, useRef, useCallback, useContext } from "react";
import Assets from "../../../assets";
import { getLeaderboard } from "../../../services/user/user";
import { useSettingsProvider } from "../../../hooks";
import FullScreenSpinner from "../../Home/FullScreenSpinner";
import UserContext from "../../../UserContext";
import { formUsername } from "../../../utils/formUsername";
import { formatCoins } from "../../../utils/formatCoins";
import { useNavigate } from "react-router-dom";
import "./LeaderboardTab.css";

const LeaderboardTab = () => {
  const [isLoading, setIsLoading] = useState(false); // Start as false, set true only when fetching
  const [leaders, setLeaders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);

  const { userId, userParameters } = useContext(UserContext);
  const { lang } = useSettingsProvider();

  const ITEMS_PER_PAGE = 20;

  const navigate = useNavigate();

  const fetchLeaderboard = useCallback(async (pageNum) => {
    setIsLoading(true);
    try {
      const response = await getLeaderboard(pageNum, ITEMS_PER_PAGE, userId);
      const newLeaders = response.leaderboard || [];
      const userData = response.currentUser || {
        user_id: userId,
        total_earned: userParameters.total_earned || 0,
        respect: userParameters.respect || 0,
        gender: userParameters.gender || "unknown",
        name: userParameters.name || userParameters.username || "You",
        photo_url: userParameters.photo_url || null,
        rank: "N/A",
      };
      console.log("Fetched data:", JSON.stringify(response, null, 2));
      setLeaders((prev) => [...prev, ...newLeaders]);
      setCurrentUser(userData);
      // Only set hasMore to true if we get a full page and total users exceed current count
      setHasMore(newLeaders.length === ITEMS_PER_PAGE && (skip + newLeaders.length) < rankedUsers.length);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setHasMore(false); // Stop infinite loop on error
    } finally {
      setIsLoading(false);
    }
  }, [userId, userParameters]);

  useEffect(() => {
    fetchLeaderboard(page);
  }, [page, fetchLeaderboard]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 } // Trigger earlier to avoid flicker
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore, isLoading]);

  console.log("Current userId:", userId);
  console.log("Current leaders:", JSON.stringify(leaders, null, 2));
  console.log("Current user data:", JSON.stringify(currentUser, null, 2));

  const userScore = currentUser ? currentUser.total_earned + currentUser.respect : 0;
  const userName = currentUser ? formUsername(currentUser, lang) : "You";

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  const stickyVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <ScreenContainer>
      {isLoading && page === 1 && <FullScreenSpinner />}
      <div className="leaderboard-list">
        {leaders.map((leader) => (
          <motion.div
            key={leader.user_id}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            onClick={() => (leader.user_id !== userId ? navigate("/foreign-user/" + leader.user_id) : null)}
          >
            <ItemCard
              ItemAvatar={leader.photo_url || Assets.defaultAvatar}
              ItemButtons={[]}
              ItemTitle={formUsername(leader, lang)}
              ItemDescription={true}
              ItemRespect={leader.respect || 0}
              ItemTotalEarned={formatCoins(leader.total_earned || 0)}
              ItemNumberLeader={leader.rank}
              ItemGender={leader.gender || "unknown"}
              ItemIndex={1}
              className={leader.user_id === userId ? "current-user" : ""}
            />
          </motion.div>
        ))}
        {hasMore && (
          <div ref={observerRef} className="loading-trigger">
            {isLoading ? "Loading..." : "Scroll to load more"}
          </div>
        )}
      </div>

      {currentUser && (
        <motion.div
          className="sticky-user-place"
          variants={stickyVariants}
          initial="hidden"
          animate="visible"
        >
          <ItemCard
            ItemAvatar={currentUser.photo_url || Assets.defaultAvatar}
            ItemButtons={[]}
            ItemTitle={userName}
            ItemDescription={true}
            ItemRespect={currentUser.respect || 0}
            ItemTotalEarned={formatCoins(userScore)}
            ItemNumberLeader={currentUser.rank}
            ItemGender={currentUser.gender || "unknown"}
            ItemIndex={1}
            className="current-user-sticky"
          />
        </motion.div>
      )}
    </ScreenContainer>
  );
};

export default LeaderboardTab;