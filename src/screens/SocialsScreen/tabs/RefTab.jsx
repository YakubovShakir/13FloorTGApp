import { useState } from "react"
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer"
import Assets from "../../../assets"
import { useSettingsProvider } from "../../../hooks"
import Button from "../../../components/simple/Button/Button"
import { useNotification } from "../../../NotificationContext"
import { copyTextToClipboard } from "../../../utils/clipboard"
import { transform } from "lodash"

const buttonStyle = {
  width: "100%",
  height: 44,
  shadowColor: "rgb(199, 80, 21)",
  color: "rgb(255, 255, 255)",
  ownColor: "rgb(255, 118, 0)",
  bgColor: "rgb(255, 118, 0)",
  fontSize: 14,
  fontFamily: "Oswald",
}

const TaskTab = ({ userId, userParameters, setUserParameters }) => {
  const { lang } = useSettingsProvider()
  const { showNotification } = useNotification()
  const [data, setData] = useState({
    gameCenterValues: {
      friends: 5, // Пример данных
      thisLevelFriendsRequired: 0,
      nextLevelFriendsRequired: 10,
    },
    to: 100, // Пример дохода после улучшения
    from: 50, // Пример текущего дохода
    current_level: 1, // Пример текущего уровня
  })

  const translations = {
    gameCenter: {
      ru: "Приглашай друзей и получай больше монет, а так же кеш бек с их покупкок",
      en: "Invite your friends and get more coins, as well as cashback from their purchases",
    },
    level: {
      ru: "Текущий уровень Игрового центра: ",
      en: "Hame Center Current Level: ",
    },
    invite: {
      ru: "Пригласить",
      en: "Invite",
    },
    copied: {
      ru: "Ваша реферальная ссылка была успешно скопирована!",
      en: "Your referral link has been copied successfully!",
    },

    referaltext: {
      ru: "Получайте 10% кешбэка ",
      en: "Get 10% cashback ",
    },
    referaltext2: {
      ru: "со всех внутриигровых покупок, совершенных вашими приглашенными друзьями! Каждый приглашенный друг усиливает ваш Игровой Центр, принося вам доход каждый час. Чем больше друзей, тем выше ваш доход!",
      en: "on all in-game purchases made by your invited friends! Every invited friend boosts your Game Center, earning you hourly income. The more friends you invite, the greater your earnings!",
    },
    exclusive: {
      ru: "Мы также открыты к индивидуальному сотрудничеству и готовы предложить уникальные условия по кешбэку и другим бонусам. Свяжитесь с нами для обсуждения деталей!",
      en: "We are also open to individual partnerships and can offer unique cashback terms and other bonuses. Contact us to discuss the details!",
    },
  }

  const { Icons } = Assets

  const getRefLink = () => {
    return import.meta.env.VITE_NODE_ENV === "test"
      ? `https://t.me/memecoin_multiplier3000_bot?start=${userId}`
      : `https://t.me/Floor13th_bot?start=${userId}`
  }

  const handleInviteClick = () => {
    copyTextToClipboard(getRefLink()).then(() => {
      showNotification(translations.copied[lang], Assets.Icons.tasks)
    })
  }

  return (
    <ScreenContainer style={{ width: "90%", margin: "auto auto 10px auto", }}>
      {data?.gameCenterValues ? (
        <>
          <div style={{ display: "flex", justifyContent: "center",  width: "90%", margin: "auto auto 10px auto", }}>
            <img
              src={Assets.Icons.gameCenter}
              alt="Game Center"
              style={{ width: "17vmax", marginTop: 20 }}
            />


       <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end", 
    color: "#fff",
    marginLeft: "20px",
    textAlign: "right",
    justifyContent: "center",
    
  }}
>
  <h4 style={{  marginBottom: " 10px", }}>{translations.gameCenter[lang]}</h4>
  <Button
    {...buttonStyle}
    active={true}
    onClick={handleInviteClick}
    text={translations.invite[lang]}
    width={120}
    style={{ marginTop: 20 }} 
  />
</div>


          </div>
          <div style={{
             color:"#fff", 
             border: "1px solid rgb(57, 57, 57)",
             background: "0% 0% / cover rgb(32, 32, 32)",
             padding: "10px",
             width: "90%",
            margin: "auto",
            borderRadius: "8px"
            }}>
               <p
            style={{
              paddingBottom: 16,
              width: "100%",
              textAlign: "center",
              margin: 0,
            }}
          >
            {translations.level[lang]} {data.current_level}
          </p>
         
          <div
            style={{
              display: "flex",
              width: "50%",
              background: "grey",
              borderRadius: 12,
              alignItems: "center",
              position: "relative",
              margin: "auto"
            }}
          >
            
            <span
              style={{
                width: data.to
                  ? Math.min(
                      100,
                      ((data.gameCenterValues.friends -
                        data.gameCenterValues.thisLevelFriendsRequired) /
                        (data.gameCenterValues.nextLevelFriendsRequired -
                          data.gameCenterValues.thisLevelFriendsRequired)) *
                        100
                    ) + "%"
                  : "100%",
                height: 30,
                background:
                  "linear-gradient(90deg, rgba(233, 78, 27, 1) 0%, rgba(243, 117, 0, 1) 50%)",
                borderRadius: 12,
              }}
            />
            <p
              style={{
                position: "absolute",
                width: "100%",
                textAlign: "center",
                margin: 0,
              }}
            >
              {data.to
                ? `${data.gameCenterValues.friends}/${data.gameCenterValues.nextLevelFriendsRequired}`
                : data.gameCenterValues.friends}
            </p>
            
          </div>
          <p
            style={{
              textTransform: "uppercase",
              fontSize: "22px",
              color: "rgb(255, 118, 0)",
              fontWeight:"600",
              paddingTop: 16,
              width: "100%",
              textAlign: "center",
              margin: 0,
            }}
          >
            {translations.referaltext[lang]} 
          </p>
          <p
            style={{
              fontSize: "16px",
              fontFamily: "roboto",
              fontWeight:"300",
             
              width: "100%",
              textAlign: "center",
              margin: 0,
            }}
          >
            {translations.referaltext2[lang]} 
          </p>
          <p
            style={{
              fontSize: "12px",
              fontFamily: "roboto",
              fontWeight:"100",
              paddingTop: 16,
              width: "100%",
              textAlign: "center",
              margin: 0,
            }}
          >
            {translations.exclusive[lang]} 
          </p>
          
          </div>
        </>
      ) : (
        <div style={{ width: 300 }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <img
              src={Assets.Icons.gameCenter}
              alt="Game Center"
              style={{ width: "17vmax", marginBottom: 20 }}
            />
          </div>
          <p
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <img
              src={Icons.balance}
              alt="Coin"
              style={{ width: "24px", height: "24px" }}
            />
            <span style={{ fontSize: "18px", marginLeft: 7, marginRight: 7 }}>
              {data.from} {lang === "ru" ? "/ в час" : "/ Hour"}
            </span>
            {data.to && (
              <>
                {"➜ "}
                <img
                  src={Icons.balance}
                  alt="Coin"
                  style={{ width: "29px", height: "29px", marginLeft: 7 }}
                />
                <span
                  style={{
                    fontSize: "22px",
                    marginLeft: 7,
                    color: "#f5b700",
                  }}
                >
                  {" " + data.to} {lang === "ru" ? "/ в час" : "/ Hour"}
                </span>
              </>
            )}
          </p>
         
        </div>

        
      )}
    </ScreenContainer>
  )
}

export default TaskTab