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
import Button from "../../components/simple/Button/Button"
import { motion } from "framer-motion"
import moment from "moment-timezone"
import { FullScreenSpinner } from "../Home/Home"
import '../../components/complex/Modals/Modal/Modal.css'
import { buyInvestmentLevel, claimInvestment, getUserInvestments } from "../../services/user/user"
import WebApp from "@twa-dev/sdk"
import { instance } from "../../services/instance"

const buttonStyle = {
    height: 44,
    shadowColor: "#AF370F",
    ownColor: "linear-gradient(rgb(18, 4, 2) 0%, rgba(243, 117, 0, 0.2) 100%)",
    bgColor: "linear-gradient(rgb(18, 4, 2) 0%, rgba(243, 117, 0, 0.2) 100%)",
    fontSize: 14,
    fontFamily: "Muller"
};


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
        const duration = isTest ? 30 : 3600; // 5 seconds or 1 hour
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

const Modal = ({ bottom, left, width, height, data, onClose, logoWidth }) => {
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
                <img src={data?.image} alt="ModalLogo" style={{ width: logoWidth || '17vmax' }} />
            </div>
            <div className="ModalBody" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, width: '100%' }}>
                <p>{data.from} {'->'} {data.to}</p>
            </div>
            <div className="ModalFooter" style={{ marginTop: 10 }}>
                <Button
                    {...buttonStyle}
                    active={data.canUpgrade}
                    onClick={data.canUpgrade ? data.handleUpgrade : () => { }}
                    text={data.price}
                    width={100}
                    icon={Assets.Icons.balance}
                />
            </div>
        </motion.div>
    )
}

const AutoclaimModal = ({ bottom, left, width, height, data, onClose, logoWidth }) => {
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
                <img src={data?.image} alt="ModalLogo" style={{ width: logoWidth || '17vmax' }} />
            </div>
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="ModalBody" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, width: '80%' }}>
                    <p style={{ textAlign: 'center' }}>{data.description}</p>
                </div>
            </div>
            <div className="ModalFooter" style={{ marginTop: 10 }}>
                <Button
                    {...buttonStyle}
                    active={data.canUpgrade}
                    onClick={data.canUpgrade ? data.handleUpgrade : () => { }}
                    text={1}
                    width={100}
                    icon={Assets.Icons.starsIcon}
                />
            </div>
        </motion.div>
    )
}


const ThreeSectionCard = ({
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
    started_at = "2024-12-23T08:02:40.126Z",
    tz = "Europe/Moscow",
    upgrade_info = {
        price: 200,
    },
    handleClaim,
    hideUpgrade,
    canUpgrade,
    title,
    userParameters,
    openAutoclaimModal
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

    return (
        <div>
            <div style={{ flex: 1, background: 'black' }}>
                <p></p>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 * (index + 1) }}
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
                    <p style={{ textAlign: 'center', fontSize: 12, color: 'white', paddingBottom: 8 }}>{title}</p>
                    <img
                        src={leftImage}
                        alt="Investment Type"
                        style={styles.image}
                    />
                    <p style={{ textAlign: 'center', fontSize: 12, color: 'white', paddingTop: 8 }}>Уровень {current_level}</p>
                </div>

                {/* Manager Image Section */}
                <div
                    style={{
                        ...styles.section,
                        border: getBorderStyle(),
                        ...getEmptyBackgroundStyle(),
                    }}
                    onClick={has_autoclaim ? () => {} : openAutoclaimModal}
                >
                    <img
                        src={has_autoclaim ? Assets.Icons.investManagerActive : Assets.Icons.investManager}
                        alt="Manager Status"
                        style={styles.image}
                    />
                    {has_autoclaim && <p style={{ color: 'white', paddingTop: 8 }}>Автоклейм</p>}
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
                            {!hideUpgrade && <Button
                                {...buttonStyle}
                                active={true}
                                onClick={onClick}
                                text={'Улучшить'}
                            />}
                            <Button
                                {...buttonStyle}
                                active={shouldShowCollectButton}
                                onClick={shouldShowCollectButton ? handleClaim : undefined}
                                text={shouldShowCollectButton ? "Собрать" : timer}
                            />
                        </>
                    ) : (
                        <Button
                            {...buttonStyle}
                            active={userParameters.coins >= upgrade_info.price}
                            icon={Assets.Icons.balance}
                            text={upgrade_info.price}
                            onClick={onClick}
                        />
                    )}
                </div>
            </motion.div>
        </div>
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
            setInvestments(res);
            setError(null);
        } catch (err) {
            setError(err);
            console.error('Failed to fetch investments:', err);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    const handleUpgrade = async (investment_type) => {
        if (!investments) return;

        // Optimistically update the UI
        setIsLoading(true)

        try {
            await buyInvestmentLevel(userId, investment_type);
            // Fetch real data after successful claim
            await fetchInvestments();

        } catch (err) {
            console.error('Failed to claim:', err);
            // Revert optimistic update on failure
            await fetchInvestments();
        }
        setIsLoading(false)
    };

    const handleClaim = async (investment_type) => {
        if (!investments) return;

        // Optimistically update the UI
        setIsLoading(true)

        try {
            await claimInvestment(userId, investment_type);
            // Fetch real data after successful claim
            await fetchInvestments();

        } catch (err) {
            console.error('Failed to claim:', err);
            // Revert optimistic update on failure
            await fetchInvestments();
        }
        setIsLoading(false)
    };

      const handleStarsBuyAutoclaim = async (investment_type) => {
        const response = await instance.post('/users/request-stars-invoice-linkF', {
             productType: "autoclaim",
             id: investment_type
          })
    
          await new Promise((resolve) => {
            WebApp.openInvoice(response.data.invoiceLink, (status) => {
            // Можно вызвать попап или анимацию успеха/фейла
            if(status === "paid") {}
            if(status === "cancelled") {}
            if(status === 'pending') {}
            if(status === 'failed') {}
            resolve()
          })
        })
      }

    const handleAutoclaimPurchased = async (investment_type) => {
        if (!investments) return;

        // Optimistically update the UI
        setIsLoading(true)

        try {
            await handleStarsBuyAutoclaim(userId, investment_type);
            // Fetch real data after successful claim
            await fetchInvestments();

        } catch (err) {
            console.error('Failed to claim:', err);
            // Revert optimistic update on failure
            await fetchInvestments();
        }
        await new Promise((resolve) => setTimeout(() => {
            setIsLoading(false)
            resolve()
        }, 2500))
    }

    useEffect(() => {
        fetchInvestments();
        pollingRef.current = setInterval(fetchInvestments, 5000);

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, [fetchInvestments]);

    return {
        investments,
        isLoading,
        error,
        handleUpgrade,
        handleClaim,
        handleAutoclaimPurchased
    };
};

const InvestmentScreen = () => {
    const [modalData, setModalData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { userId, userParameters } = useContext(UserContext);
    const [autoClaimModalVisible, setIsAutoClaimModalVisible] = useState(false)
    const [autoclaimModalData, setAutoclaimModalData] = useState()

    const navigate = useNavigate();

    const { investments, isLoading, error, handleUpgrade, handleClaim, handleAutoclaimPurchased } = useInvestmentData(userId);

    useEffect(() => {
        useTelegram.setBackButton(() => navigate("/"));
        console.log(investments)
    }, [investments]);

    const handleModalOpen = (investment_type) => {
        if (!investments) return;

        const investmentData = investments[investment_type];
        const iconMap = {
            coffee_shop: Assets.Icons.investmentCoffeeShopIcon,
            zoo_shop: Assets.Icons.investmentZooShopIcon,
            game_center: Assets.Icons.gameCenter
        };

        const titlesMap = {
            coffee_shop: 'Кофейня',
            zoo_shop: 'Зоомагазин',
            game_center: 'Игровой центр'
        }

        setModalData({
            image: iconMap[investment_type],
            from: investmentData.upgrade_info.from,
            to: investmentData.upgrade_info.to,
            price: investmentData.upgrade_info.price,
            handleUpgrade: async () => {
                await handleUpgrade(investment_type);
                setIsModalVisible(false);
            },
            title: titlesMap[investment_type],
            canUpgrade: userParameters.coins >= investmentData.upgrade_info.price
        });
        setIsModalVisible(true);
    };

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
                    {autoClaimModalVisible && (
                        <AutoclaimModal
                            onClose={() => setIsAutoClaimModalVisible(false)}
                            data={autoclaimModalData}
                            bottom={"0"}
                            width={"100%"}
                            height={"80%"}
                        />
                    )}
                    <ThreeSectionCard
                        title={'Кофейня'}
                        leftImage={Assets.Icons.investmentCoffeeShopIcon}
                        rightImage={Assets.Icons.investManager}
                        onClick={() => handleModalOpen('coffee_shop')}
                        tz={investments?.tz}
                        started_at={investments.coffee_shop?.started_at || null}
                        handleClaim={() => handleClaim('coffee_shop')}
                        openAutoclaimModal={() => {
                            setAutoclaimModalData(
                                {
                                    image: Assets.Icons.investManagerActive,
                                    title: 'Автоклейм',
                                    description: 'Автоматический сбор инвестиций - лучший способ сэкономить время!'
                                }
                            )
                            setIsAutoClaimModalVisible(true)
                        }}
                        {...investments.coffee_shop}
                        userParameters={userParameters}
                    />
                    <ThreeSectionCard
                        title={'Зоомагазин'}
                        leftImage={Assets.Icons.investmentZooShopIcon}
                        rightImage={Assets.Icons.investManager}
                        onClick={() => handleModalOpen('zoo_shop')}
                        handleClaim={() => handleClaim('zoo_shop')}
                        tz={investments?.tz}
                        started_at={investments.zoo_shop?.started_at || null}
                        {...investments.zoo_shop}
                        openAutoclaimModal={() => {
                            setAutoclaimModalData(
                                {
                                    image: Assets.Icons.investManagerActive,
                                    title: 'Автоклейм',
                                    description: 'Автоматический сбор инвестиций - лучший способ сэкономить время!'
                                }
                            )
                            setIsAutoClaimModalVisible(true)
                        }}
                        userParameters={userParameters}
                    />
                    <ThreeSectionCard
                        title={'Игровой центр'}
                        leftImage={Assets.Icons.gameCenter}
                        rightImage={Assets.Icons.investManager}
                        onClick={() => handleModalOpen('game_center')}
                        tz={investments?.tz}
                        started_at={investments.game_center?.started_at || null}
                        handleClaim={() => handleClaim('game_center')}
                        hideUpgrade={true}
                        {...investments.game_center}
                        userParameters={userParameters}
                    />
                </ScreenBody>
            </Screen>
        )
    }
}

export default InvestmentScreen
