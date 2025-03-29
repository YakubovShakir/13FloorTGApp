import { useState, useEffect, useContext } from "react";
import Assets from "../../../assets";
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer";
import { getShopItems } from "../../../services/user/user";
import Button from "../../../components/simple/Button/Button";
import Modal from "../../../components/complex/Modals/Modal/Modal";
import { motion } from "framer-motion";
import UserContext, { useUser } from "../../../UserContext";
import FullScreenSpinner from "../../Home/FullScreenSpinner";
import FilterModal from "../../../components/complex/FilterModal/FilterModal";
import { instance } from "../../../services/instance";
import { buyItemsForCoins } from "../../../services/user/user";
import WebApp from "@twa-dev/sdk";
import { useSettingsProvider } from "../../../hooks";
import { useNotification } from "../../../NotificationContext";
import { handleStarsPayment } from "../../../utils/handleStarsPayment";
import { TonConnectUIProvider, useTonConnectUI } from "@tonconnect/ui-react";
import { Buffer } from "buffer";

// ... (GridItem, GridItemShelf, GridLayout remain unchanged)

const NftTab = () => {
  const [filterTypeInUse, setFilterTypeInUse] = useState(null);
  const [shelfItems, setShelfItems] = useState(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentComplexFilters, setCurrentComplexFilters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const { userParameters } = useContext(UserContext);
  const { lang } = useSettingsProvider();
  const { userId, refreshData } = useUser();
  const [tonConnectUI] = useTonConnectUI();

  // Log TonConnectUI state for debugging
  useEffect(() => {
    console.log("TonConnectUI State:", {
      connected: tonConnectUI.connected,
      wallet: tonConnectUI.wallet,
      availableWallets: tonConnectUI.availableWallets,
    });
  }, [tonConnectUI]);

  const BaseFilters = {
    Hat: "Hat",
    Top: "Top",
    Pants: "Pants",
    Shoes: "Shoes",
    Accessories: "Accessory",
    Shelf: "Shelf",
    Complex: "Complex",
    Stars: "Stars",
  };

  useEffect(() => {
    const fetchShopItems = async () => {
      try {
        setIsLoading(true);
        const data = await getShopItems(userId);
        const loadedShelfItems = await Promise.all(
          data.shelf.filter(item => item.type === 'neko').map(async (item) => {
            const supplyResponse = await instance.get(`/users/nft/supply/${item.id}`);
            return {
              id: item.id,
              productType: "shelf",
              name: item.name[lang],
              image: item.link,
              price: item.cost.stars || item.cost.coins,
              tonPrice: item.tonPrice || 0,
              supply: supplyResponse.data.availableSupply,
              category: "Shelf",
              isPrem: item.cost.stars > 0,
              available: item.cost.stars > 0 || item.cost.coins === 0 || userParameters.coins >= item.cost.coins,
              description: item.description && item.description[lang],
              respect: item.respect,
            };
          })
        );
        setShelfItems(loadedShelfItems);
      } catch (error) {
        console.error("Error fetching shop items:", error);
        WebApp.showAlert("Failed to load shop items.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchShopItems();
  }, [userId, lang, userParameters.coins]);

  const handleBuyNft = async (item) => {
    try {
      setIsLoading(true);
      const response = await instance.get(`/users/nft/transaction-details`, {
        params: { userId, productId: item.id },
      });
      console.log("Backend Transaction Details:", {
        address: response.data.address,
        amount: response.data.amount,
        memo: response.data.memo,
        itemId: item.id,
        tonPrice: item.tonPrice,
      });
      setTransactionDetails({ ...response.data, item });
      setIsTransactionModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch transaction details:", error);
      WebApp.showAlert("Failed to fetch transaction details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmTransaction = async () => {
    if (!tonConnectUI.connected) {
      WebApp.showAlert("Please connect your TON wallet first.");
      await tonConnectUI.openModal();
      if (!tonConnectUI.connected) return;
    }

    try {
      setIsLoading(true);
      const { address, amount, memo, item } = transactionDetails;

      // Validate transaction fields
      if (!address || !address.match(/^EQ[0-9A-Za-z_-]{46}$/)) {
        throw new Error(`Invalid TON address: ${address}`);
      }

      const amountInNanotons = String(amount);
      if (!/^\d+$/.test(amountInNanotons) || BigInt(amountInNanotons) <= 0) {
        throw new Error(`Invalid amount: ${amountInNanotons}`);
      }

      let trimmedMemo = memo && typeof memo === "string" ? memo : "";
      if (trimmedMemo.length > 120) {
        trimmedMemo = trimmedMemo.substring(0, 120);
        console.warn("Memo trimmed:", trimmedMemo);
      }
      const payload = trimmedMemo ? Buffer.from(trimmedMemo, "utf8").toString("base64") : undefined;

      const validUntil = Math.floor(Date.now() / 1000) + 300;

      const transaction = {
        validUntil,
        messages: [
          {
            address,
            amount: amountInNanotons,
            payload,
          },
        ],
      };

      console.log("Transaction to Send:", {
        validUntil,
        address,
        amount: amountInNanotons,
        memo: trimmedMemo || "None",
        payload: payload || "None",
        tonPrice: item.tonPrice,
      });

      const result = await tonConnectUI.sendTransaction(transaction, {
        modals: "all",
        notifications: "all",
      });

      console.log("Transaction Result:", result);

      // Backend verification
      const verifyResponse = await instance.post(`/users/nft/verify-transaction`, {
        userId,
        transactionId: result.boc,
      });

      if (verifyResponse.data.success) {
        WebApp.showAlert("Transaction confirmed successfully!");
        await refreshData();
        const data = await getShopItems(userId);
        const updatedShelfItems = await Promise.all(
          data.shelf.filter(item => item.type === 'neko').map(async (item) => {
            const supplyResponse = await instance.get(`/users/nft/supply/${item.id}`);
            return {
              id: item.id,
              productType: "shelf",
              name: item.name[lang],
              image: item.link,
              price: item.cost.stars || item.cost.coins,
              tonPrice: item.tonPrice || 0,
              supply: supplyResponse.data.availableSupply,
              category: "Shelf",
              isPrem: item.cost.stars > 0,
              available: item.cost.stars > 0 || item.cost.coins === 0 || userParameters.coins >= item.cost.coins,
              description: item.description && item.description[lang],
              respect: item.respect,
            };
          })
        );
        setShelfItems(updatedShelfItems);
      } else {
        WebApp.showAlert("Transaction sent but verification failed. Check your wallet.");
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      WebApp.showAlert(`Transaction failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsTransactionModalOpen(false);
      setIsLoading(false);
    }
  };

  // ... (rest of the component remains unchanged)

  if (isLoading) {
    return <FullScreenSpinner />;
  }

  return (
    <ScreenContainer withTab>
      {isFilterModalOpen && (
        <FilterModal
          baseStyles={{ position: "fixed", height: "100vh", width: "100vw", backgroundColor: "black", zIndex: 10, top: 0, left: 0 }}
          addComplexFilter={addComplexFilter}
          removeComplexFilter={removeComplexFilter}
          setIsFilterModalOpen={setIsFilterModalOpen}
          currentComplexFilters={currentComplexFilters}
        />
      )}
      {isTransactionModalOpen && (
        <Modal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          title={lang === "en" ? "Confirm NFT Purchase" : "Подтвердить покупку NFT"}
        >
          <div style={{ color: "white", textAlign: "center" }}>
            <p>{lang === "en" ? "Item:" : "Товар:"} {transactionDetails?.item.title}</p>
            <p>{lang === "en" ? "Price:" : "Цена:"} {transactionDetails?.item.tonPrice} TON</p>
            <p>{lang === "en" ? "To:" : "Кому:"} {transactionDetails?.address.slice(0, 6)}...{transactionDetails?.address.slice(-4)}</p>
            <Button
              text={lang === "en" ? "Confirm" : "Подтвердить"}
              onClick={handleConfirmTransaction}
              width="100%"
              height={44}
              fontFamily="Oswald"
              fontWeight="300"
              fontSize={14}
              ownColor="rgb(255, 118, 0)"
              bgColor="rgb(255, 118, 0)"
              style={{ marginTop: "20px" }}
            />
          </div>
        </Modal>
      )}
      <GridLayout
        items={applyFilter([...shelfItems])}
        handleCoinsBuy={handleCoinsBuy}
        handleStarsBuy={handleStarsBuy}
        handleBuyNft={handleBuyNft}
      />
    </ScreenContainer>
  );
};

// Ensure TonConnectUIProvider is properly configured
const NftTabWithTonConnect = () => (<NftTab />);

export default NftTabWithTonConnect;