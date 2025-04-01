import { useEffect, useState } from "react";
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer";
import Assets from "../../../assets";
import { useSettingsProvider } from "../../../hooks";
import Button from "../../../components/simple/Button/Button";
import { useNotification } from "../../../NotificationContext";
import { copyTextToClipboard } from "../../../utils/clipboard";
import { getAffiliateData } from "../../../services/user/user";
import { useUser } from "../../../UserContext";
import globalTranslations from "../../../globalTranslations";
import FullScreenSpinner from "../../Home/FullScreenSpinner";
import { COLORS } from "../../../utils/paramBlockUtils";

const buttonStyle = {
  width: "100%",
  height: 44,
  shadowColor: "rgb(199, 80, 21)",
  color: "rgb(255, 255, 255)",
  ownColor: "rgb(255, 118, 0)",
  bgColor: "rgb(255, 118, 0)",
  fontSize: 14,
  fontFamily: "Oswald",
};

const translations = globalTranslations.affiliate;

const RefTab = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { lang } = useSettingsProvider();
  const { showNotification } = useNotification();
  const { userId } = useUser();
  const [data, setData] = useState();
  const [canWithdraw, setCanWithdraw] = useState(false)

  const { Icons } = Assets;

  const getRefLink = () => {
    return import.meta.env.VITE_NODE_ENV === "test"
      ? `https://t.me/memecoin_multiplier3000_bot?start=${userId}`
      : `https://t.me/Floor13th_bot?start=${userId}`;
  };

  const handleInviteClick = () => {
    copyTextToClipboard(getRefLink()).then(() => {
      showNotification(translations.copied[lang], Assets.Icons.tasks);
    });
  };

  useEffect(() => {
    getAffiliateData(userId)
      .then(setData)
      .catch(() => showNotification(globalTranslations.errors[500]))
      .finally(() => setIsLoading(false));
  }, [userId, lang]);

  useEffect(() => {
    if(data) {
      if(data.totalStarsPendingInTON + data.totalTONPendingWithdrawal > 5) {
        setCanWithdraw(true)
      }
    }
  }, [data])

  return (
    <ScreenContainer style={{ width: "90%", margin: "auto auto 10px auto" }}>
      {isLoading ? (
        <FullScreenSpinner />
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              width: "90%",
              margin: "auto auto 10px auto",
            }}
          >
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
              <h4
                style={{
                  marginBottom: "10px",
                  fontSize: "14px",
                  textTransform: "uppercase",
                }}
              >
                {translations.gameCenter[lang]}
              </h4>
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
          <div
            style={{
              color: "#fff",
              border: "1px solid rgb(57, 57, 57)",
              background: "0% 0% / cover rgb(32, 32, 32)",
              padding: "10px",
              width: "90%",
              margin: "auto",
              borderRadius: "8px",
            }}
          >
            <p
              style={{
                paddingBottom: 6,
                width: "100%",
                textAlign: "center",
                margin: 0,
                fontWeight: "200",
                fontFamily: "roboto",
                fontSize: "14px",
                color: "white",
              }}
            >
              {translations.level[lang]} {data.current_level}
            </p>
            <div
              style={{
                display: "flex",
                width: "95%",
                borderBottom: "1px solid rgba(117, 117, 117, 0.23)",
                boxShadow: "rgba(0, 0, 0, 0.24) 0px 0px 8px 2px inset",
                background: "rgb(18, 18, 18)",
                borderRadius: 5,
                alignItems: "center",
                position: "relative",
                margin: "auto",
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
                  height: 22,
                  background:
                    "linear-gradient(90deg, rgba(233, 78, 27, 1) 0%, rgba(243, 117, 0, 1) 50%)",
                  borderRadius: 5,
                }}
              />
              <p
                style={{
                  position: "absolute",
                  width: "100%",
                  textAlign: "center",
                  margin: 0,
                  fontWeight: "bold",
                  textShadow:
                    "1px 1px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000",
                }}
              >
                {data.to
                  ? `${data.gameCenterValues?.friends}/${data.gameCenterValues.nextLevelFriendsRequired}`
                  : data.gameCenterValues?.friends}
              </p>
            </div>
            <p
              style={{
                textTransform: "uppercase",
                fontSize: "22px",
                color: "rgb(255, 118, 0)",
                fontWeight: "600",
                paddingTop: 10,
                width: "100%",
                textAlign: "center",
                margin: 0,
              }}
            >
              {translations.referaltext[lang]}
            </p>
            <p
              style={{
                fontSize: "12px",
                fontFamily: "roboto",
                fontWeight: "300",
                width: "100%",
                textAlign: "center",
                margin: 0,
              }}
            >
              {translations.referaltext2[lang]}
            </p>
            <div
              style={{
                marginTop: "20px",
                width: "100%",
                display: "flex",
                flexDirection: "column", // Changed to column for two rows
                borderBottom: "1px solid rgba(117, 117, 117, 0.23)",
                boxShadow: "rgba(0, 0, 0, 0.24) 0px 0px 8px 2px inset",
                background: "rgb(18, 18, 18)",
                borderRadius: "5px",
                marginBottom: "10px",
              }}
            >
              {/* Top Row: Cashback Section */}
              <div
                style={{
                  display: "flex",
                  padding: "14px",
                  justifyContent: "center",
                  width: "100%", // Full width for row
                  borderRadius: "5px 5px 0 0", // Rounded top corners
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                  <p
                    style={{
                      fontSize: "16px",
                      fontFamily: "Oswald",
                      paddingBottom: 5,
                      width: "100%",
                      textAlign: "center",
                      margin: 0,
                      textTransform: "uppercase",
                      fontWeight: "400",
                    }}
                  >
                    {translations.cashback[lang]}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      paddingTop: 5,
                      justifyContent: "space-between",
                    }}
                  >
                    {/* First Column: Locked Stars and TON */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                        <img
                          src={Icons.starsIcon}
                          alt="Stars"
                          style={{ width: "20px", height: "20px" }}
                        />
                        <p
                          style={{
                            fontSize: "22px",
                            fontFamily: "Oswald",
                            fontWeight: "500",
                            paddingLeft: 5,
                            margin: 0,
                          }}
                        >
                          {data.totalStarsLocked}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <img
                          src={Icons.tonIcon}
                          alt="TON"
                          style={{ width: "20px", height: "20px" }}
                        />
                        <p
                          style={{
                            fontSize: "22px",
                            fontFamily: "Oswald",
                            fontWeight: "500",
                            paddingLeft: 5,
                            margin: 0,
                          }}
                        >
                          {data.totalTONLocked}
                        </p>
                      </div>
                    </div>
                    {/* Second Column: Almost Equal Sign */}
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <p style={{ fontSize: "22px", margin: "0 10px" }}>≈</p>
                    </div>
                    {/* Third Column: Total TON Locked */}
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src={Icons.tonIcon}
                        alt="TON"
                        style={{ width: "20px", height: "20px" }}
                      />
                      <p
                        style={{
                          fontSize: "22px",
                          fontFamily: "Oswald",
                          fontWeight: "500",
                          paddingLeft: 5,
                          margin: 0,
                        }}
                      >
                        {(data.totalStarsLockedInTON + data.totalTONLocked).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Withdraw Section */}
              <div
                style={{
                  display: "flex",
                  padding: "14px",
                  justifyContent: "center",
                  width: "100%", // Full width for row
                  borderRadius: "0 0 5px 5px", // Rounded bottom corners
                  borderTop: "1px solid rgba(117, 117, 117, 0.23)", // Separator between rows
                  border: "2px solid rgb(49 187 249)", // Keep the border style
                  borderLeft: "none", // Remove left border for seamless look
                  borderRight: "none", // Remove right border for seamless look
                  borderBottom: "none", // Remove bottom border to match container
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                  <p
                    style={{
                      fontSize: "16px",
                      fontFamily: "Oswald",
                      paddingBottom: 5,
                      width: "100%",
                      textAlign: "center",
                      margin: 0,
                      textTransform: "uppercase",
                      fontWeight: "400",
                    }}
                  >
                    {translations.withdraw[lang]}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      paddingTop: 5,
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                      <img
                        src={Icons.tonIcon}
                        alt="Coin"
                        style={{ width: "20px", height: "20px" }}
                      />
                      <p
                        style={{
                          fontSize: "22px",
                          fontFamily: "Oswald",
                          fontWeight: "500",
                          paddingLeft: 5,
                          margin: 0,
                        }}
                      >
                        {(data.totalStarsPendingInTON + data.totalTONPendingWithdrawal).toFixed(2)}
                      </p>
                      </div>
                      <p
                        style={{
                          fontSize: "12px",
                          fontFamily: "Oswald",
                          fontWeight: "500",
                          marginTop: 10,
                          color: COLORS.RED,
                          opacity: 0.85
                        }}
                      >
                        {
                          !canWithdraw && translations.cantWithdraw[lang]
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              style={{
                justifyContent: "center",
                display: "flex",
                marginBottom: "20px",
              }}
            >
              <Button
                {...buttonStyle}
                active={canWithdraw}
                onClick={handleInviteClick}
                text={translations.withdrawButton[lang]}
                width={120}
                style={{ marginTop: 20 }}
              />
            </div>
            <p
              style={{
                fontSize: "13px",
                fontFamily: "roboto",
                fontWeight: "100",
                paddingTop: 5,
                width: "100%",
                textAlign: "center",
                margin: 0,
              }}
            >
              {translations.rule[lang]}
            </p>
            <p
              style={{
                fontSize: "12px",
                fontStyle: "italic",
                fontFamily: "roboto",
                fontWeight: "100",
                paddingTop: 5,
                width: "100%",
                textAlign: "center",
                margin: 0,
              }}
            >
              {translations.exclusive[lang]}
            </p>
          </div>
        </>
      )}
    </ScreenContainer>
  );
};

export default RefTab;