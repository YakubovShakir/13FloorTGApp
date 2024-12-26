import { useEffect, useState, useContext } from "react"
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
import moment from 'moment-timezone'
import { FullScreenSpinner } from "../Home/Home"
import { getUserInvestments } from "../../services/user/user"

const ThreeSectionCard = ({
    leftImage,
    rightImage,
    index = 0,
    isWaiting = false,
    onClick,
    has_autoclaim,
    current_level = 1,
    started_at = "2024-12-23T08:02:40.126Z",
    tz = 'Europe/Moscow',
    upgrade_info = {
        price: 200
    }
}) => {
    const [timer, setTimer] = useState('')
    const isTest = process.env.NODE_ENV !== 'test'
    useEffect(() => {
        const calculateTimeLeft = () => {
          const now = moment().tz(tz);
          const end = isTest 
            ? moment(started_at).tz(tz).add(5, 'second') 
            : moment(started_at).tz(tz).add(1, 'hour'); 
          
          if (now.isAfter(end)) {
            if (has_autoclaim === true) {
              return // reset timer to correct thing
            }
            return '00:00';
          }
    
          const duration = moment.duration(end.diff(now));
          const minutes = Math.floor(duration.asMinutes());
          const seconds = Math.floor(duration.seconds());
          return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };
    
        setTimer(calculateTimeLeft());
    
        const intervalId = setInterval(() => {
          const timeLeft = calculateTimeLeft();
          setTimer(timeLeft);
    
          if (timeLeft === '00:00') {
            clearInterval(intervalId);
          }
        }, 1000);
    
        return () => clearInterval(intervalId);
      }, [started_at, tz, has_autoclaim]); 

    const getBorderStyle = () => {
        if (isWaiting) return "1px solid rgb(46, 199, 115)";
        
    };

    const getBackgroundStyle = () => {
        return {
           
            
        };
    };

    const getEmptyBackgroundStyle = () => {
        return {
            border: 0
        };
    };

    const styles = {
        cardContainer: {
            display: 'flex',
            width: '90%',
            gap: '8px',
            margin: 'auto auto 10px auto',
            height: '160px',
            backgroundImage: `
                linear-gradient(to left, rgba(0, 0, 0), rgba(0, 0, 0, 0)),
                repeating-linear-gradient(
                    to right,
                    transparent,
                    transparent 19px,
                    rgba(243, 117, 0, 0.3) 20px
                ),
                repeating-linear-gradient(
                    transparent,
                    transparent 19px,
                    rgba(243, 117, 0, 0.3) 20px
                )
            `,
            border: "solid 1px rgb(243, 117, 0)",
            borderRadius: "8px",
            position: 'relative',
        },
     

        section: {
            width: '33.333%',
            borderRadius: '8px',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            
        },

        title: {
            color: 'white',
            fontSize: '14px',
            padding: '8px 0',
            zIndex: 10,
        },

        image: {
            width: '80%',
            objectFit: 'contain',
            transition: 'filter 0.3s ease',
        },

        imageInactive: {
            filter: 'grayscale(100%) opacity(0.5)',
        },

        buttonsContainer: {
            width: '33.333%',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '8px',
            justifyContent: 'center'
        },

        button: {
            height: '56px',
            borderRadius: '4px',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: 'white',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            width: '100%',
        },

        buttonActive: {
            background: 'linear-gradient(to right, rgb(249, 115, 22), rgb(251, 146, 60))',
        },

        buttonInactive: {
            background: '#4B5563',
            opacity: 0.5,
        },

        buttonIcon: {
            width: '24px',
            height: '24px',
        },
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
                    alt="Left Section"
                    style={{
                        ...styles.image,
                    }}
                />
            </div>

            {/* Right Image Section */}
            <div
                style={{
                    ...styles.section,
                    border: getBorderStyle(),
                    ...getEmptyBackgroundStyle(),
                }}
            >
                <img
                    src={has_autoclaim ? Assets.Icons.investManagerActive : Assets.Icons.investManager}
                    alt="Right Section"
                    style={{
                        ...styles.image,
                    }}
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
                {
                    current_level > 0 ?
                        (
                            <>
                                <Button
                                    height={44}
                                    shadowColor={"#f37500"}
                                    ownColor={
                                        "linear-gradient(rgb(18, 4, 2) 0%, rgba(243, 117, 0, 0.2) 100%)"
                                    }
                                    bgColor={
                                        "linear-gradient(rgb(18, 4, 2) 0%, rgba(243, 117, 0, 0.2) 100%)"
                                    }
                                    fontSize={14}
                                    fontFamily={"Muller"}
                                    active={true}
                                    onClick={onClick}
                                    text={'Улучшить'}
                                />
                                <Button
                                    height={44}
                                    shadowColor={"#f37500"}
                                    ownColor={
                                        "linear-gradient(rgb(18, 4, 2) 0%, rgba(243, 117, 0, 0.2) 100%)"
                                    }
                                    bgColor={
                                        "linear-gradient(rgb(18, 4, 2) 0%, rgba(243, 117, 0, 0.2) 100%)"
                                    }
                                    fontSize={14}
                                    fontFamily={"Muller"}
                                    active={!timer}
                                    text={timer || 'Собрать'}
                                />
                            </>
                        ) : (
                            <Button
                                height={44}
                                shadowColor={"#f37500"}
                                ownColor={
                                    "linear-gradient(rgb(18, 4, 2) 0%, rgba(243, 117, 0, 0.2) 100%)"
                                }
                                bgColor={
                                    "linear-gradient(rgb(18, 4, 2) 0%, rgba(243, 117, 0, 0.2) 100%)"
                                }
                                fontSize={14}
                                fontFamily={"Muller"}
                                active={true}
                                icon={Assets.Icons.balance}
                                text={upgrade_info.price}
                            />
                        )
                }
            </div>
        </motion.div>
    );
};

const InvestmentScreen = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [investments, setInvestments] = useState()
    const [modalData, setModalData] = useState(null)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const { userId } = useContext(UserContext)
    const navigate = useNavigate()

    useEffect(() => {
        useTelegram.setBackButton(() => navigate("/"));
        getUserInvestments(userId).then(res => {
            console.log(res)
            setInvestments(res)
            setIsLoading(false)
        }).catch(setIsLoading(false))
    }, []);

    if(isLoading) {
        return <FullScreenSpinner/>
    } else if(investments) {
        return (
            <Screen>
                <HomeHeader></HomeHeader>
                <ScreenBody activity={'Инвестиции'}>
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
                    <ThreeSectionCard leftImage={Assets.Icons.investmentCoffeeShopIcon} rightImage={Assets.Icons.investManager} onClick={() => setIsModalVisible(true)} tz={investments?.tz} started_at={investments.coffee_shop?.started_at || null} {...investments.coffee_shop}/>
                    <ThreeSectionCard leftImage={Assets.Icons.investmentZooShopIcon} rightImage={Assets.Icons.investManager} onClick={() => setIsModalVisible(true)}/>
                    <ThreeSectionCard leftImage={Assets.Icons.gameCenter} rightImage={Assets.Icons.investManager} onClick={() => setIsModalVisible(true)}/>
                    {/* Зоомагазин */}
                    {/* <InvestmentItemCard /> */}
    
                    {/* Игровой центр */}
                    {/* <InvestmentItemCard /> */}
                </ScreenBody>
            </Screen>
        );
    }
};


export default InvestmentScreen
