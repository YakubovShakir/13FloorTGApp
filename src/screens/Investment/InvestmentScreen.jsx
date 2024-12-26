import { useEffect, useState, useContext, useCallback, useRef } from "react"
import HomeHeader from "../../components/complex/HomeHeader/HomeHeader"
import Menu from "../../components/complex/Menu/Menu"
import Assets from "../../assets"
import Screen from "../../components/section/Screen/Screen"
import ScreenBody from "../../components/section/ScreenBody/ScreenBody"
import ScreenTabs from "../../components/section/ScreenTabs/ScreenTabs"
import ScreenContainer from "../../components/section/ScreenContainer/ScreenContainer"
import useTelegram from "../../hooks/useTelegram"
import { useNavigate, useParams } from "react-router-dom"
import ItemCard from "../../components/simple/ItemCard/ItemCard"
import UserContext from "../../UserContext"
import Modal from "../../components/complex/Modals/Modal/Modal"
import Button from "../../components/simple/Button/Button"
import { motion } from "framer-motion"
import moment from "moment-timezone"
import { FullScreenSpinner } from "../Home/Home"
import { getUserInvestments } from "../../services/user/user"

export const useInvestmentTimer = ({
    started_at,
    tz,
    has_autoclaim,
    isTest = true
}) => {
    const [timer, setTimer] = useState("");
    const [shouldShowCollectButton, setShouldShowCollectButton] = useState(false);
    const [virtualStartTime, setVirtualStartTime] = useState(started_at);

    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    const calculateTimeLeft = useCallback(() => {
        const now = moment().tz(tz);
        const duration = isTest ? 5 : 3600; // 5 seconds or 1 hour
        const end = moment(virtualStartTime).tz(tz).add(duration, isTest ? 'second' : 'second');

        if (now.isAfter(end)) {
            if (has_autoclaim) {
                // Reset timer by updating virtual start time
                setVirtualStartTime(now.toISOString());
                return {
                    timeString: formatDuration(duration),
                    showCollect: false
                };
            }
            return {
                timeString: "00:00",
                showCollect: true
            };
        }

        const diff = moment.duration(end.diff(now));
        const minutes = Math.floor(diff.asMinutes());
        const seconds = Math.floor(diff.seconds());
        
        return {
            timeString: `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
            showCollect: false
        };
    }, [virtualStartTime, tz, has_autoclaim, isTest]);

    useEffect(() => {
        const updateTimer = () => {
            const result = calculateTimeLeft();
            setTimer(result.timeString);
            setShouldShowCollectButton(result.showCollect);
        };

        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);

        return () => clearInterval(intervalId);
    }, [calculateTimeLeft]);

    return {
        timer,
        shouldShowCollectButton
    };
};

  const ThreeSectionCard = ({
    leftImage,
    rightImage,
    index = 0,
    isWaiting = false,
    onClick,
    onCollect,
    has_autoclaim,
    current_level = 1,
    started_at = "2024-12-23T08:02:40.126Z",
    tz = "Europe/Moscow",
    upgrade_info = {
      price: 200,
    },
  }) => {
    const isTest = process.env.NODE_ENV === "test";
    
    const { timer, shouldShowCollectButton } = useInvestmentTimer({
      started_at,
      tz,
      has_autoclaim,
      isTest
    });
  
    const styles = {
      cardContainer: {
        display: "flex",
        width: "100%",
        gap: "8px",
        padding: "8px",
        height: "160px",
      },
  
      section: {
        width: "33.333%",
        borderRadius: "8px",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      },
  
      image: {
        width: "80%",
        objectFit: "contain",
        transition: "filter 0.3s ease",
      },
  
      buttonsContainer: {
        width: "33.333%",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "8px",
        justifyContent: "center",
      },
    };
  
    const getBorderStyle = () => {
      if (isWaiting) return "1px solid rgb(46, 199, 115)";
      return "1px solid rgb(57, 57, 57)";
    };
  
    const getBackgroundStyle = () => ({
      backgroundImage:
        "repeating-linear-gradient(to right, transparent, transparent 19px, rgb(99 89 80 / 30%) 20px), repeating-linear-gradient(to bottom, transparent, transparent 19px, rgb(103 93 84 / 30%) 20px)",
      backgroundColor: "#2525257a",
    });
  
    const getEmptyBackgroundStyle = () => ({
      border: 0,
    });
  
    const buttonStyle = {
      height: 44,
      shadowColor: "#AF370F",
      ownColor: "linear-gradient(rgb(18, 4, 2) 0%, rgba(243, 117, 0, 0.2) 100%)",
      bgColor: "linear-gradient(rgb(18, 4, 2) 0%, rgba(243, 117, 0, 0.2) 100%)",
      fontSize: 14,
      fontFamily: "Muller"
    };
  
    return (
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 * (index + 1) }}
        style={styles.cardContainer}
      >
        {/* Left Image Section */}
        <div
          style={{
            ...styles.section,
            border: getBorderStyle(),
            ...getBackgroundStyle(),
          }}
        >
          <img
            src={leftImage}
            alt="Investment Type"
            style={styles.image}
          />
        </div>
  
        {/* Manager Image Section */}
        <div
          style={{
            ...styles.section,
            border: getBorderStyle(),
            ...getEmptyBackgroundStyle(),
          }}
        >
          <img
            src={has_autoclaim ? Assets.Icons.investManagerActive : Assets.Icons.investManager}
            alt="Manager Status"
            style={styles.image}
          />
        </div>
  
        {/* Buttons Section */}
        <div
          style={{
            ...styles.buttonsContainer,
            border: getBorderStyle(),
            ...getEmptyBackgroundStyle(),
          }}
        >
          {current_level > 0 ? (
            <>
              <Button
                {...buttonStyle}
                active={true}
                onClick={onClick}
                text={"Улучшить"}
              />
              <Button
                {...buttonStyle}
                active={shouldShowCollectButton}
                onClick={shouldShowCollectButton ? onCollect : undefined}
                text={shouldShowCollectButton ? "Собрать" : timer}
              />
            </>
          ) : (
            <Button
              {...buttonStyle}
              active={true}
              icon={Assets.Icons.balance}
              text={upgrade_info.price}
              onClick={onClick}
            />
          )}
        </div>
      </motion.div>
    );
  };

  const useInvestmentData = (userId) => {
    const [investments, setInvestments] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const pollingRef = useRef(null);
  
    const fetchInvestments = useCallback(async () => {
      try {
        const res = await getUserInvestments(userId);
        setInvestments(prev => {
          // Only update if data has changed to prevent unnecessary rerenders
          if (JSON.stringify(prev) !== JSON.stringify(res)) {
            return res;
          }
          return prev;
        });
        setError(null);
      } catch (err) {
        setError(err);
        console.error('Failed to fetch investments:', err);
      } finally {
        setIsLoading(false);
      }
    }, [userId]);
  
    useEffect(() => {
      // Initial fetch
      fetchInvestments();
  
      // Setup polling
      pollingRef.current = setInterval(fetchInvestments, 5000);
  
      // Cleanup
      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }
      };
    }, [fetchInvestments]);
  
    return { investments, isLoading, error };
  };

  
const InvestmentScreen = () => {
  const [modalData, setModalData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { userId } = useContext(UserContext);
  const navigate = useNavigate();
  
  const { investments, isLoading, error } = useInvestmentData(userId);

  useEffect(() => {
    useTelegram.setBackButton(() => navigate("/"));
  }, []); // Only set back button once


  const handleInvestmentUpgrade = () => {

  }

  const handleInvestmentClaim = () => {

  }

  if (isLoading) {
    return <FullScreenSpinner />
  } else if (investments) {
    return (
      <Screen>
        <HomeHeader></HomeHeader>
        <ScreenBody activity={"Инвестиции"}>
          {isModalVisible && (
            <Modal
              onClose={() => setIsModalVisible(false)}
              data={modalData}
              bottom={"0"}
              width={"100%"}
              height={"80%"}
            />
          )}
          {/* Кофейня */}
          <ThreeSectionCard
            leftImage={Assets.Icons.investmentCoffeeShopIcon}
            rightImage={Assets.Icons.investManager}
            onClick={() => {
                setModalData
                setIsModalVisible(true)
            }}
            tz={investments?.tz}
            started_at={investments.coffee_shop?.started_at || null}
            handleUpgrade={() => handleInvestmentUpgrade()}
            {...investments.coffee_shop}
          />
          <ThreeSectionCard
            leftImage={Assets.Icons.investmentZooShopIcon}
            rightImage={Assets.Icons.investManager}
            onClick={() => setIsModalVisible(true)}
            tz={investments?.tz}
            started_at={investments.zoo_shop?.started_at || null}
            {...investments.zoo_shop}
          />
          <ThreeSectionCard
            leftImage={Assets.Icons.gameCenter}
            rightImage={Assets.Icons.investManager}
            onClick={() => setIsModalVisible(true)}
            tz={investments?.tz}
            started_at={investments.game_center?.started_at || null}
            {...investments.game_center}
          />
          {/* Зоомагазин */}
          {/* <InvestmentItemCard /> */}

          {/* Игровой центр */}
          {/* <InvestmentItemCard /> */}
        </ScreenBody>
      </Screen>
    )
  }
}

export default InvestmentScreen
