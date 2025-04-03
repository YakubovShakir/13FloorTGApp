import { useState, useEffect, useContext } from "react";
import Assets from "../../../assets";
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer";
import { getNftShopItems, getShopItems } from "../../../services/user/user";
import Button from "../../../components/simple/Button/Button";
import Modal from "../../../components/complex/Modals/Modal/Modal";
import { motion } from "framer-motion";
import UserContext, { useUser } from "../../../UserContext";
import FullScreenSpinner from "../../Home/FullScreenSpinner";
import FilterModal from "../../../components/complex/FilterModal/FilterModal";
import { instance } from "../../../services/instance";
import WebApp from "@twa-dev/sdk";
import { useSettingsProvider } from "../../../hooks";
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";

const translations = {
  supply: {
    en: 'Supply: ',
    ru: 'Доступно: '
  }
}

const GridItemShelf = ({
  id,
  productType,
  icon,
  title,
  isPrem,
  price,
  tonPrice,
  supply,
  available = true,
  respect = 0,
  handleCoinsBuy,
  handleStarsBuy,
  handleBuyNft,
  isWalletConnected,
  setCurrentItem,
}) => {
  const isNftItem = id >= 9 && id <= 38;
  const showBuyNFT = isNftItem;
  const { lang } = useSettingsProvider();

  return (
    <div
      className="clothing-item-container"
      style={{
        borderRadius: "8px",
        border: "1px solid rgb(57, 57, 57)",
        background: "0% 0% / cover rgb(32, 32, 32)",
        padding: "10px",
      }}
    >
      <div
        className="clothing-item-top"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexDirection: "column",
          overflow: "hidden",
          borderBottom: "solid 1px rgba(117, 117, 117, 0.23)",
          boxShadow: "rgba(0, 0, 0, 0.24) 0px 0px 8px 2px inset",
          background: "#00000082",
          borderRadius: "7px",
          backgroundImage:
            "repeating-linear-gradient(45deg, #00000036, #00000036 2px, #3939390f 2px, #3939390f 6px)",
          justifyContent: "center",
        }}
      >
        <div 
          className="clothing-item-header"
          onClick={() => setCurrentItem({ id, productType, icon, title, tonPrice, supply, respect })}
        >
          <div></div>
          <motion.div
            className="clothing-item-icon-wrapper"
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className="clothing-item-icon-container"
              style={{
                height: "100%",
                width: "100%",
                borderRadius: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: -5.5,
                position: "relative",
              }}
            >
              <img
                src={icon}
                alt={title}
                style={{ width: "100%", position: "relative", zIndex: 2 }}
              />
            </div>
          </motion.div>
        </div>
      </div>
      <div
        className="clothing-item-bottom"
        style={{
          paddingBottom: "12px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <p
          style={{
            padding: "10px 5px 10px 5px",
            height: "45px",
            color: "white",
            textAlign: "center",
            fontWeight: "100",
            fontFamily: "Oswald",
            width: "90%",
          }}
        >
          {title}
        </p>
        <div
          className="clothing-item-respect"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 5,
            marginBottom: 10,
            height: 60,
            color: "white",
          }}
        >
          {respect > 0 && (
            <>
              <img src={Assets.Icons.respect} height={22} />
              <p
                style={{
                  textAlign: "center",
                  fontWeight: "100",
                  fontFamily: "Oswald",
                  paddingLeft: 8,
                  fontSize: "20px",
                  paddingBottom: 4,
                  paddingRight: 2, // Исправлено: убрано лишнее "Ascendantly 2px solid rgba(117, 117, 117, 0.23)"
                }}
              >
                +
              </p>
              <p
                style={{
                  textAlign: "center",
                  fontWeight: "100",
                  fontFamily: "Oswald",
                  fontSize: "20px",
                  paddingBottom: 4,
                }}
              >
                {respect}
              </p>
            </>
          )}
        </div>
        <div style={{ textAlign: "center", width: "88%" }}>
          <p style={{ color: "white", fontFamily: "Oswald", fontSize: "14px" }}>
            {tonPrice} TON
          </p>
          <p
            style={{
              color: "white",
              fontFamily: "Oswald",
              fontSize: "12px",
              marginBottom: "5px",
            }}
          >
            {translations.supply[lang]}: {supply}
          </p>
          <Button
            className="clothing-item-equip-button"
            shadowColor={"#AF370F"}
            width={"100%"}
            marginBottom={"5"}
            color={"rgb(255, 255, 255)"}
            height={44}
            fontFamily={"Oswald"}
            fontWeight={"300"}
            text={lang === "en" ? "Buy NFT" : "Купить NFT"}
            fontSize={14}
            ownColor={"rgb(255, 118, 0)"}
            bgColor={"rgb(255, 118, 0)"}
            onClick={() => handleBuyNft({ id, productType, title, icon, tonPrice })}
            active={supply > 0 && isWalletConnected}
          />
        </div>
      </div>
    </div>
  );
};

const GridLayout = ({ items, handleCoinsBuy, handleStarsBuy, handleBuyNft, isWalletConnected, setCurrentItem }) => {
  return (
    <div
      style={{
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        paddingBottom: 55,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1rem",
          width: "90vw",
        }}
      >
        {items.map((item, index) => {
          if (item.category === "Shelf") {
            return (
              <GridItemShelf
                key={index}
                icon={item.image}
                title={item.name}
                price={item.price}
                tonPrice={item.tonPrice}
                supply={item.supply}
                respect={item.respect}
                equipped={item.equipped}
                isWalletConnected={isWalletConnected}
                handleCoinsBuy={handleCoinsBuy}
                handleStarsBuy={handleStarsBuy}
                handleBuyNft={handleBuyNft}
                clothingId={item.clothing_id}
                type={item.category}
                isPrem={item.isPrem}
                description={item.description}
                id={item.id}
                productType={item.productType}
                setCurrentItem={setCurrentItem}
              />
            );
          }
        })}
      </div>
    </div>
  );
};

const mockVerifyTxSent = async (userId, transactionId, itemId) => {
  console.log("Mocking backend call to /users/nft/verify-transaction with:", {
    userId,
    transactionId,
    itemId,
  });
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    data: {
      success: true,
      message: "Transaction verified successfully",
      transactionId,
    },
  };
};

const waitForWalletConnection = (tonConnectUI, timeout = 10000) => {
  return new Promise((resolve, reject) => {
    if (tonConnectUI.connected) {
      resolve(true);
      return;
    }

    const interval = setInterval(() => {
      if (tonConnectUI.connected) {
        clearInterval(interval);
        clearTimeout(timeoutId);
        resolve(true);
      }
    }, 100);

    const timeoutId = setTimeout(() => {
      clearInterval(interval);
      reject(new Error("Wallet connection timed out"));
    }, timeout);
  });
};

const handleSendTransactionTonConnect = async (
  tonConnectUI,
  WebApp,
  paymentRequest,
  instance,
  setIsTransactionModalOpen,
  setIsLoading,
  refreshData,
  fetchShopItems,
  userId,
  itemId
) => {
  try {
    setIsLoading(true);

    if (!tonConnectUI.connected) {
      console.log("Wallet not connected, opening modal...");
      tonConnectUI.openModal();
      await waitForWalletConnection(tonConnectUI);
    }

    console.log("Connected Wallet Details:", {
      wallet: tonConnectUI.wallet,
      connected: tonConnectUI.connected,
      chain: tonConnectUI.wallet?.account?.chain,
      address: tonConnectUI.wallet?.account?.address,
      appName: tonConnectUI.wallet?.appName,
      platform: WebApp.platform,
    });

    const result = await tonConnectUI.sendTransaction(paymentRequest, {
      modals: "all",
      skipRedirectToWallet: "never",
    });
    console.log("TonConnect Transaction Result:", result);

    const transactionHash = result.boc;
    if (!transactionHash) {
      throw new Error("Transaction hash (boc) not found in response");
    }

    const verifyResponse = await mockVerifyTxSent(userId, transactionHash, itemId);
    console.log("Mock Backend Verification Response:", verifyResponse.data);

    if (verifyResponse.data.success) {
      WebApp.showAlert("Transaction confirmed successfully!");
      await refreshData();
      await fetchShopItems();
    } else {
      throw new Error(`Verification failed: ${verifyResponse.data.message || "Unknown reason"}`);
    }
  } catch (error) {
    console.error("Transaction Error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    WebApp.showAlert(`Transaction failed: ${error.message || "Unknown error"}`);
  } finally {
    setIsTransactionModalOpen(false);
    setIsLoading(false);
  }
};

const NftTab = () => {
  const [shelfItems, setShelfItems] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const blackList = [37, 38];
  const { userParameters } = useContext(UserContext);
  const { lang } = useSettingsProvider();
  const { userId, refreshData } = useUser();
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const descriptions = {
    en: "Every hour you can get an income bonus if another player clicks on your cat. Rarer cats give more bonuses and respect. The in-game value of the current collection will increase when the new one starts selling",
    ru: "Каждый час вы можете получить бонус к доходу, если на вашего кота нажмет другой игрок. Более редкие коты дают больше бонусов и респекта. Внутриигровая ценность текущей коллекции будет расти , при старте продажи новой.",
  };

  useEffect(() => {
    if (wallet) {
      console.log("YES");
      setIsWalletConnected(true);
    }
  }, [wallet]);

  const fetchShopItems = async () => {
    try {
      console.log("Fetching shop items for userId:", userId, "lang:", lang);
      setIsLoading(true);
      const data = await getNftShopItems(userId);
      console.log("getShopItems Response:", data);

      const loadedShelfItems = data.shelf.map((item) => ({
        id: item.id,
        productType: item.productType,
        name: item.name[lang],
        image: item.image,
        price: item.price,
        tonPrice: item.tonPrice,
        supply: item.supply,
        category: item.category,
        isPrem: item.isPrem,
        available: item.available || userParameters.coins >= item.price,
        description: item.description && item.description[lang],
        respect: item.respect,
      }))
      .filter((item) => !blackList.includes(item.id));

      console.log("Loaded Shelf Items:", loadedShelfItems);
      setShelfItems(loadedShelfItems);
    } catch (error) {
      console.error("Error fetching shop items:", error);
      WebApp.showAlert(`Failed to load shop items: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShopItems();
  }, []);

  const createModalData = (item) => {
    if (!item) return null;
    return {
      title: item.title,
      image: item.icon,
      descriptions: descriptions,
      blocks: [
        {
          icon: Assets.Icons.respect,
          text: lang === "en" ? "Respect" : "Уважение",
          value: item.respect || 0,
          fillPercent: "100%",
          fillBackground: "#FFFFFF",
        },
        {
          icon: Assets.Icons.balance,
          text: lang === "en" ? "Income bonus" : "Бонус к доходу",
          value: '+10%',
          fillPercent: "100%",
          fillBackground: "#FFFFFF",
        }
      ],
      buttons: [
        {
          text: lang === "en" ? "Buy NFT" : "Купить NFT",
          active: item.supply > 0 && isWalletConnected,
          onClick: () => {
            handleBuyNft(item).then(() => setCurrentItem(null));
          },
        },
      ],
    };
  };

  const handleConfirmTransaction = async (transactionDetails) => {
    try {
      setIsLoading(true);
      const { paymentRequest, item } = transactionDetails;

      await handleSendTransactionTonConnect(
        tonConnectUI,
        WebApp,
        paymentRequest,
        instance,
        setIsTransactionModalOpen,
        setIsLoading,
        refreshData,
        fetchShopItems,
        userId,
        item.id
      );
    } catch (error) {
      console.error("TonConnect Transaction Error:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      WebApp.showAlert(`Transaction failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsTransactionModalOpen(false);
      setIsLoading(false);
    }
  };

  const handleBuyNft = async (item) => {
    try {
      setIsLoading(true);
      const response = await instance.get(`/users/nft/transaction-details`, {
        params: { userId, productId: item.id },
      });
      console.log("Backend Transaction Details:", response.data);

      await handleConfirmTransaction({ ...response.data, item });
    } catch (error) {
      console.error("Failed to fetch transaction details:", error);
      WebApp.showAlert("Failed to fetch transaction details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <FullScreenSpinner />;
  }

  return (
    <ScreenContainer withTab>
      <GridLayout
        items={shelfItems}
        handleCoinsBuy={() => {}}
        handleStarsBuy={() => {}}
        handleBuyNft={handleBuyNft}
        isWalletConnected={isWalletConnected}
        setCurrentItem={setCurrentItem}
      />
      {currentItem && (
        <Modal
          onClose={() => setCurrentItem(null)}
          data={createModalData(currentItem)}
          bottom={"0"}
          width={"100vw"}
          height={"80vh"}
          description={descriptions[lang]}
        />
      )}
    </ScreenContainer>
  );
};

const NftTabWithTonConnect = () => <NftTab />;

export default NftTabWithTonConnect;