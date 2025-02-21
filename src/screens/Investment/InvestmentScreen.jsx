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
import UserContext, { useUser } from "../../UserContext"
import Button from "../../components/simple/Button/Button"
import { motion } from "framer-motion"
import moment from "moment-timezone"
import FullScreenSpinner from "../Home/FullScreenSpinner"
import "../../components/complex/Modals/Modal/Modal.css"
import {
  buyInvestmentLevel,
  claimInvestment,
  getUserInvestments,
  startInvestment,
} from "../../services/user/user"
import WebApp from "@twa-dev/sdk"
import { instance } from "../../services/instance"
import { useSettingsProvider } from "../../hooks"
import { formatCoins } from "../../utils/formatCoins"
import { useNotification } from "../../NotificationContext"
import { copyTextToClipboard } from "../../utils/clipboard"
import { handleStarsPayment } from "../../utils/handleStarsPayment"

const buttonStyle = {
  width: "100%",
  height: 44,
  shadowColor: "rgb(199, 80, 21)",
  color: "rgb(255, 255, 255)",
  ownColor: "rgb(255, 118, 0)",
  bgColor: "rgb(255, 118, 0)",
  fontSize: 14,
  fontFamily: "Anonymous pro",
}

const translations = {
  description: {
    ru: ``,
    en: ``,
  },
  investments: {
    ru: "Инвестиции",
    en: "Investments",
  },
}

export const useInvestmentTimer = ({
  started_at,
  tz,
  has_autoclaim,
  isTest = true,
}) => {
  const [timer, setTimer] = useState("")
  const [shouldShowCollectButton, setShouldShowCollectButton] = useState(false)
  const [virtualStartTime, setVirtualStartTime] = useState(started_at)

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`
  }

  const calculateTimeLeft = useCallback(() => {
    const now = moment().tz('Europe/Moscow')
    const duration = 3600 
    const startMoment = moment(virtualStartTime).tz('Europe/Moscow')
    const end = startMoment.add(duration, "seconds")

    // Calculate the exact difference in seconds
    const diffSeconds = end.diff(now, "seconds")

    if (diffSeconds <= 0) {
      if (has_autoclaim) {
        // Reset timer by updating virtual start time
        setVirtualStartTime(now.toISOString())
        return {
          timeString: formatDuration(duration),
          showCollect: false,
        }
      }
      return {
        timeString: "00:00",
        showCollect: true,
      }
    }

    // Format the remaining time
    return {
      timeString: formatDuration(diffSeconds),
      showCollect: false,
    }
  }, [virtualStartTime, tz, has_autoclaim, isTest])

  useEffect(() => {
    const updateTimer = () => {
      const result = calculateTimeLeft()
      setTimer(result.timeString)
      setShouldShowCollectButton(result.showCollect)
    }

    updateTimer()
    const intervalId = setInterval(updateTimer, 1000)

    return () => clearInterval(intervalId)
  }, [calculateTimeLeft])

  return {
    timer,
    shouldShowCollectButton,
  }
}

const Modal = ({ bottom, left, width, height, data, onClose, logoWidth }) => {
  const { Icons } = Assets
  const { gameCenterValues = null } = data
  const { lang } = useSettingsProvider()

  const translations = {
    invite: {
      en: 'Invite',
      ru: 'Пригласить'
    },
    gameCenter: {
      en: 'Invite friends to grow Game Center!',
      ru: 'Приглашай друзей и развивай Игровой Центр!'
    },
    level: {
      en: 'Current Level: ',
      ru: 'Текущий уровень: '
    },
    copied: {
      en: 'Your referral link has been copied successfully!',
      ru: 'Ваша реферальная ссылка была успешно скопирована!'
    }
  }

  const { userId } = useContext(UserContext)
  const { showNotification } = useNotification()

  const getRefLink = () => {
    return  import.meta.env.VITE_NODE_ENV === 'test' ? `https://t.me/memecoin_multiplier3000_bot?start=${userId}` : `https://t.me/Floor13th_bot?start=${userId}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      className="Modal"
      style={{ left: left, width: width, height: "83%", zIndex: 10 }}
    >
      <img
        className="ModalClose"
        onClick={() => onClose()}
        src={Icons.modalClose}
        alt="closeIcon"
      />
      <div className="ModalTitle">{data?.title}</div>

      <div className="ModalLogo" style={{}}>
        <img
          src={data?.image}
          alt="ModalLogo"
          style={{ width: logoWidth || "17vmax" }}
        />
      </div>
      <div
        className="ModalBody"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 200,
          width: "100%",
        }}
      >
        {gameCenterValues ? (
          <>
            <div>
              <h4>{translations.gameCenter[lang]}</h4>
            </div>
            <br />
            <div style={{
              display: 'flex',
              width: '50%',
              background: 'grey',
              borderRadius: 12,
              alignItems: 'center',
              position: 'relative',
            }}>
              <span
                style={{
                  width: data.to ?
                    Math.min(100, (gameCenterValues.friends - gameCenterValues.thisLevelFriendsRequired / gameCenterValues.nextLevelFriendsRequired - gameCenterValues.thisLevelFriendsRequired) * 100) + "%" : '100%',
                  height: 30,
                  background: "linear-gradient(90deg, rgba(233, 78, 27, 1) 0%, rgba(243, 117, 0, 1) 50%)",
                  borderRadius: 12
                }}
              />
              <p style={{
                position: 'absolute',
                width: '100%',
                textAlign: 'center',
                margin: 0
              }}>
                {
                  data.to
                    ? gameCenterValues.friends - gameCenterValues.thisLevelFriendsRequired + '/' + gameCenterValues.nextLevelFriendsRequired
                    : gameCenterValues.friends
                }
              </p>
            </div>
            <p style={{
              paddingTop: 16,
              width: '100%',
              textAlign: 'center',
              margin: 0
            }}>
              {translations.level[lang]} {data.current_level}
            </p>
            <p>
              {data.from} {data.to && "-> " + data.to}
            </p>
          </>

        ) : (
          <p>
            {data.from} {data.to && "-> " + data.to}
          </p>
        )}
      </div>
      <div className="ModalFooter" style={{ marginTop: 10 }}>
        {gameCenterValues ? (
          <Button
            {...buttonStyle}
            active={data.canUpgrade}
            onClick={() => {

              copyTextToClipboard(getRefLink()).then(() => {
                return showNotification(translations.copied[lang], Assets.Icons.tasks)
              })
              //!TODO separate
              showNotification(translations.copied[lang], Assets.Icons.tasks)
            }}
            text={translations.invite[lang]}
            width={100}
          />
        ) : (
          <Button
            {...buttonStyle}
            active={data.canUpgrade}
            onClick={data.canUpgrade ? data.handleUpgrade : () => { }}
            text={data.price}
            width={100}
            icon={Assets.Icons.balance}
          />
        )}
      </div>
    </motion.div>
  )
}

const AutoclaimModal = ({
  bottom,
  left,
  width,
  height,
  data,
  onClose,
  logoWidth,
  handleAutoclaimPurchased
}) => {
  const { Icons } = Assets
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      className="Modal"
      style={{ left: left, width: width, height: "83%", zIndex: 10 }}
    >
      <img
        className="ModalClose"
        onClick={() => onClose()}
        src={Icons.modalClose}
        alt="closeIcon"
      />
      <div className="ModalTitle">{data?.title}</div>

      <div className="ModalLogo" style={{}}>
        <img
          src={data?.image}
          alt="ModalLogo"
          style={{ width: logoWidth || "17vmax" }}
        />
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="ModalBody"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 200,
            width: "80%",
          }}
        >
          <p style={{ textAlign: "center" }}>{data.description}</p>
        </div>
      </div>
      <div className="ModalFooter" style={{ marginTop: 10 }}>
        <Button
          {...buttonStyle}
          active={data.canUpgrade}
          onClick={handleAutoclaimPurchased}
          text={1}
          width={100}
          icon={Assets.Icons.starsIcon}
        />
      </div>
    </motion.div>
  )
}

const ThreeSectionCard = ({
  from,
  leftImage,
  rightImage,
  index = 0,
  isWaiting = false,
  onClick,
  onClickClaim,
  obClickUpgrade,
  onCollect,
  has_autoclaim,
  current_level = 1,
  started_at,
  tz = "Europe/Moscow",
  upgrade_info = {
    price: 200,
  },
  handleClaim,
  hideUpgrade,
  canUpgrade,
  title,
  userParameters,
  openAutoclaimModal,
  handleStart,
  isGameCenter = false
}) => {
  const isTest =  import.meta.env.VITE_NODE_ENV === "test"
  const { lang } = useSettingsProvider()

  const translations = {
    autoclaim: {
      ru: "Автоклейм",
      en: "Autoclaim",
    },
    level: {
      ru: "Уровень",
      en: "Level",
    },
    upgrade: {
      ru: "Улучшить",
      en: "Upgrade",
    },
    claim: {
      ru: "Забрать",
      en: "Claim",
    },
    hour: {
      ru: "/ЧАС",
      en: "/HOUR",
    },
    start: {
      ru: 'Начать',
      en: 'Start'
    },
    friends: {
      ru: 'Друзей: ',
      en: 'Friends: '
    },
    invite: {
      ru: 'Пригласить',
      en: 'Invite',
    }
  }

  const { timer, shouldShowCollectButton } = useInvestmentTimer({
    started_at,
    tz,
    has_autoclaim,
    isTest,
  })

  const styles = {
    cardContainer: {
      display: "flex",
      width: "90%",
      gap: "8px",
      margin: "20px auto auto auto",
      height: "171px",
      background: "rgb(32, 32, 32)",
      border: "solid 1px rgb(57, 57, 57)",
      borderRadius: "8px",
      position: "relative",
    },
    section: {
      margin: "5px 0px 5px 5px",
      background: "repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.21), rgba(0, 0, 0, 0.21) 2px, rgba(57, 57, 57, 0.06) 2px, rgba(57, 57, 57, 0.06) 6px) rgba(0, 0, 0, 0.51)",
      borderBottom: "1px solid rgba(117, 117, 117, 0.23)",
      boxShadow: "rgba(0, 0, 0, 0.24) 0px 0px 8px 2px inset",
      width: "30%",
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
      alignItems: "center",
      position: "relative",
      marginLeft: "auto",
      marginRight: "5px",
      width: "33%",
      borderRadius: "8px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      padding: "1px 3px 8px",
      justifyContent: "center",
      border: "0",
    },
  }

  const getBorderStyle = () => {
    if (isWaiting) return "1px solid rgb(46, 199, 115)"
    return ""
  }

  const getBackgroundStyle = () => ({
    backgroundImage: "repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.21), rgba(0, 0, 0, 0.21) 2px, rgba(57, 57, 57, 0.06) 2px, rgba(57, 57, 57, 0.06) 6px) rgba(0, 0, 0, 0.51)",
  })

  const getEmptyBackgroundStyle = () => ({
    border: 0,
  })

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.15, // This creates the stagger effect
        layout: { duration: 0.3 },
        opacity: {
          duration: 0.3,
          delay: index * 0.15 // Match the delay for opacity
        },
        y: {
          type: "spring",
          damping: 20,
          stiffness: 100,
          delay: index * 0.15 // Match the delay for y movement
        }
      }}
      style={styles.cardContainer}
    >
      {/* Left Image Section */}
      <motion.div
        layout
        style={{
          ...styles.section,
          border: getBorderStyle(),
          ...getBackgroundStyle(),
        }}
      >
        <motion.p
          layout
          style={{
            textAlign: "center",
            fontSize: 16,
            color: "white",
            paddingTop: 8,
          }}
        >
          {translations.level[lang]} {current_level || 0}
        </motion.p>

        <motion.img
          layout
          src={leftImage}
          alt="Investment Type"
          style={styles.image}
        />

        {current_level > 0 && (
          <Button
            {...buttonStyle}
            active={true}
            onClick={onClick}
            text={translations.upgrade[lang]}
          />
        )}
      </motion.div>

      {current_level > 0 && (
        <motion.div
          layout
          style={{
            ...styles.section,
            border: getBorderStyle(),
            ...getEmptyBackgroundStyle(),
          }}
          onClick={has_autoclaim ? () => { } : openAutoclaimModal}
        >
          <motion.img
            layout
            src={has_autoclaim ? Assets.Icons.investManagerActive : Assets.Icons.investManager}
            alt="Manager Status"
            style={styles.image}
          />
          {has_autoclaim && (
            <motion.p
              layout
              style={{ color: "white", paddingTop: 8 }}
            >
              {translations.autoclaim[lang]}
            </motion.p>
          )}
        </motion.div>
      )}

      {/* Buttons Section */}
      <motion.div
        layout
        style={{
          ...styles.buttonsContainer,
          border: getBorderStyle(),
          ...getEmptyBackgroundStyle(),
        }}
      >
        <motion.p
          layout
          style={{
            textAlign: "center",
            fontSize: 16,
            color: "white",
          }}
        >
          {title}
        </motion.p>

        <motion.div
          layout
          className="ClaimPrise"
          style={{
            margin: "0px 0px 0px 5px",
            background: "rgb(18, 18, 18)",
            borderRadius: "5px",
            borderBottom: "1px solid rgba(117, 117, 117, 0.23)",
            boxShadow: "rgba(0, 0, 0, 0.24) 0px 0px 8px 2px inset",
            fontSize: 16,
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "95%",
          }}
        >
          <motion.img
            layout
            src={Assets.Icons.balance}
            alt="Balance Icon"
            style={{
              position: "relative",
              left: "-6%",
              width: 24,
              height: 24,
            }}
          />
          <motion.p
            layout
            style={{
              paddingRight: "14px",
              textAlign: "center",
              fontSize: 16,
              color: "white",
              width: "100%",
            }}
          >
            {from}{translations.hour[lang]}
          </motion.p>
        </motion.div>

        {current_level > 0 ? (
          started_at ? (
            <Button
              {...buttonStyle}
              active={shouldShowCollectButton}
              onClick={shouldShowCollectButton ? handleClaim : undefined}
              text={shouldShowCollectButton ? translations.claim[lang] : timer}
            />
          ) : (
            <Button
              {...buttonStyle}
              active={true}
              onClick={handleStart}
              text={translations.start[lang]}
            />
          )
        ) : (
          isGameCenter ? (
            <Button
              {...buttonStyle}
              active={userParameters.coins >= upgrade_info.price}
              text={translations.invite[lang]}
              onClick={onClick}
            />
          ) : (
            <Button
              {...buttonStyle}
              active={userParameters.coins >= upgrade_info.price}
              icon={Assets.Icons.balance}
              text={upgrade_info.price}
              onClick={onClick}
            />
          )
        )}
      </motion.div>
    </motion.div>
  )
}

const useInvestmentData = (userId) => {
  const [investments, setInvestments] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const pollingRef = useRef(null)

  const { refreshData } = useUser()

  const fetchInvestments = useCallback(async () => {
    try {
      const res = await getUserInvestments(userId)
      setInvestments(res)
      setError(null)
    } catch (err) {
      setError(err)
      console.error("Failed to fetch investments:", err)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  const handleUpgrade = async (investment_type) => {
    if (!investments) return

    // Optimistically update the UI

    try {
      setIsLoading(true)
      await buyInvestmentLevel(userId, investment_type)
      await refreshData()
      // Fetch real data after successful claim
      await fetchInvestments()
    } catch (err) {
      console.error("Failed to claim:", err)
      // Revert optimistic update on failure
      await fetchInvestments()
    } finally {
      setIsLoading(false)
    }

  }

  const handleClaim = async (investment_type) => {
    if (!investments) return

    // Optimistically update the UI
    try {
      setIsLoading(true)
      await claimInvestment(userId, investment_type)
      await fetchInvestments()
      await refreshData()
      // Fetch real data after successful claim
    } catch (err) {
      console.error("Failed to claim:", err)
      // Revert optimistic update on failure
      await fetchInvestments()
    } finally {
      setIsLoading(false)
    }

  }

  const handleStart = async (investment_type) => {
    if (!investments) return

    // Optimistically update the UI
    try {
      setIsLoading(true)
      await startInvestment(userId, investment_type)
      await fetchInvestments()
      await refreshData()
      // Fetch real data after successful claim
    } catch (err) {
      console.error("Failed to claim:", err)
      // Revert optimistic update on failure
      await fetchInvestments()
    } finally {
      setIsLoading(false)
    }

  }

  const { lang } = useSettingsProvider()

  const handleAutoclaimPurchased = async (investment_type) => {
    await handleStarsPayment(userId, 'autoclaim', investment_type, lang)
    await fetchInvestments()
    await refreshData()
  }

  useEffect(() => {
    fetchInvestments()
  }, [fetchInvestments])

  return {
    investments,
    isLoading,
    error,
    handleUpgrade,
    handleClaim,
    handleAutoclaimPurchased,
    handleStart
  }
}

const InvestmentScreen = () => {
  const [modalData, setModalData] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const { userId, userParameters } = useContext(UserContext)
  const [autoClaimModalVisible, setIsAutoClaimModalVisible] = useState(false)
  const [autoclaimModalData, setAutoclaimModalData] = useState()

  const {
    investments,
    isLoading,
    error,
    handleUpgrade,
    handleClaim,
    handleAutoclaimPurchased,
    handleStart
  } = useInvestmentData(userId)

  const { lang } = useSettingsProvider()

  const titlesMap = {
    coffee_shop: {
      ru: "Кофейня",
      en: "Coffeeshop",
    },
    zoo_shop: {
      ru: "Зоомагазин",
      en: "Zoo-shop",
    },
    game_center: {
      ru: "Игровой центр",
      en: "Game Center",
    },
  }

  const translations = {
    autoclaim: {
      ru: "Автоклейм",
      en: "Autoclaim",
    },
    autoclaimDescription: {
      ru: "Автоматический сбор инвестиций - лучший способ сэкономить время!",
      en: "Automated investment claims - the best way to save time!",
    },
    investments: {
      ru: "Инвестиции",
      en: "Investments",
    },
    investmentsDescription: {
      ru: "Инвестируй немного денег в бизнес, и забирай доход каждый час",
      en: "Invest a little - collect interest hourly",
    },
  }

  const autoclaimModalDataFixed = {
    image: Assets.Icons.investManagerActive,
    title: translations.autoclaim[lang],
    description: translations.autoclaimDescription[lang],
  }

  const handleModalOpen = (investment_type) => {
    if (!investments) return

    const investmentData = investments[investment_type]
    const iconMap = {
      coffee_shop: Assets.Icons.investmentCoffeeShopIcon,
      zoo_shop: Assets.Icons.investmentZooShopIcon,
      game_center: Assets.Icons.gameCenter,
    }

    setModalData({
      image: iconMap[investment_type],
      from: investmentData.upgrade_info.from,
      to: investmentData.upgrade_info.to,
      price: investmentData.upgrade_info.price,
      handleUpgrade: async () => {
        await handleUpgrade(investment_type)
        setIsModalVisible(false)
      },
      current_level: investmentData.current_level,
      title: titlesMap[investment_type][lang],
      canUpgrade: userParameters.coins >= investmentData.upgrade_info.price,
      gameCenterValues: investment_type === 'game_center' && ({
        friends: investmentData.friends || 0,
        thisLevelFriendsRequired: investmentData.this_level_friends_required,
        nextLevelFriendsRequired: investmentData.next_level_friends_required,
        inviteLink: userParameters.invite_link || "",
        handleInviteLink: async () => { }
      })
    })
    setIsModalVisible(true)
  }

  // Only render content when we have the data
  const renderContent = () => {
    if (isLoading || !investments) {
      return <>
        <h2
          style={{
            zIndex: "5",
            position: "relative",
            fontSize: "14px",
            fontWeight: "regular",
            margin: "16px 0",
            textAlign: "center",
            color: "#fff",
            fontFamily: "Anonymous pro",
            padding: "0 16px",
          }}
        >
          {translations.investmentsDescription[lang]}
        </h2>
      </>
    }

    return (
      <>
        <h2
          style={{
            zIndex: "5",
            position: "relative",
            fontSize: "14px",
            fontWeight: "regular",
            margin: "16px 0",
            textAlign: "center",
            color: "#fff",
            fontFamily: "Anonymous pro",
            padding: "0 16px",
          }}
        >
          {translations.investmentsDescription[lang]}
        </h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ThreeSectionCard
            index={0}
            from={investments?.coffee_shop?.upgrade_info?.from}
            data={modalData}
            title={titlesMap.coffee_shop[lang]}
            leftImage={Assets.Icons.investmentCoffeeShopIcon}
            rightImage={Assets.Icons.investManager}
            onClick={() => handleModalOpen("coffee_shop")}
            tz={investments?.tz}
            started_at={investments?.coffee_shop?.started_at}
            handleClaim={() => handleClaim("coffee_shop")}
            openAutoclaimModal={() => {
              setAutoclaimModalData(autoclaimModalDataFixed)
              setIsAutoClaimModalVisible(true)
            }}
            {...investments?.coffee_shop}
            userParameters={userParameters}
            handleStart={() => handleStart('coffee_shop')}
            handleAutoclaimPurchased={async () => {
              setIsAutoClaimModalVisible(false)
              await handleAutoclaimPurchased('coffee_shop') 
            }}
          />

          <ThreeSectionCard
            index={1}
            from={investments?.zoo_shop?.upgrade_info?.from}
            data={modalData}
            title={titlesMap.zoo_shop[lang]}
            leftImage={Assets.Icons.investmentZooShopIcon}
            rightImage={Assets.Icons.investManager}
            onClick={() => handleModalOpen("zoo_shop")}
            handleClaim={() => handleClaim("zoo_shop")}
            tz={investments?.tz}
            started_at={investments?.zoo_shop?.started_at}
            {...investments?.zoo_shop}
            openAutoclaimModal={() => {
              setAutoclaimModalData(autoclaimModalDataFixed)
              setIsAutoClaimModalVisible(true)
            }}
            userParameters={userParameters}
            handleStart={() => handleStart('zoo_shop')}
            handleAutoclaimPurchased={async () => {
              setIsAutoClaimModalVisible(false)
              await handleAutoclaimPurchased('zoo_shop') 
            }}
          />

          <ThreeSectionCard
            index={2}
            from={investments?.game_center?.upgrade_info?.from}
            data={modalData}
            title={titlesMap.game_center[lang]}
            leftImage={Assets.Icons.gameCenter}
            rightImage={Assets.Icons.investManager}
            onClick={() => handleModalOpen("game_center")}
            tz={investments?.tz}
            started_at={investments?.game_center?.started_at}
            handleClaim={() => handleClaim("game_center")}
            hideUpgrade={true}
            {...investments?.game_center}
            openAutoclaimModal={() => {
              setAutoclaimModalData(autoclaimModalDataFixed)
              setIsAutoClaimModalVisible(true)
            }}
            userParameters={userParameters}
            handleStart={() => handleStart('game_center')}
            isGameCenter={true}
            handleAutoclaimPurchased={async () => {
              setIsAutoClaimModalVisible(false)
              await handleAutoclaimPurchased('game_center') 
            }}
          />
        </motion.div>
      </>
    )
  }

  return (
    <Screen>
      <HomeHeader />
      <ScreenBody activity={translations.investments[lang]}>
        {isModalVisible && (
          <Modal
            onClose={() => setIsModalVisible(false)}
            data={modalData}
            bottom={"0"}
            width={"100%"}
            height={"80%"}
          />
        )}

        {autoClaimModalVisible && (
          <AutoclaimModal
            onClose={() => setIsAutoClaimModalVisible(false)}
            data={autoclaimModalData}
            bottom={"0"}
            width={"100%"}
            height={"80%"}
          />
        )}

        {renderContent()}
        <br/>
        <br/>
      </ScreenBody>
    </Screen>
  )
}

export default InvestmentScreen
