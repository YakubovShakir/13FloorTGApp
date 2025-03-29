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

const GridItem = ({ id, productType, icon, title, price, available = true, respect = 0, equipped, isPrem = false, handleCoinsBuy, handleStarsBuy }) => {
  const isDisabled = !available && price > 0;
  return (
    <div className="clothing-item-container" style={{ borderRadius: "8px", borderBottom: "solid 1px rgba(117, 117, 117, 0.23)", background: "0% 0% / cover rgb(32, 32, 32)", padding: "10px" }}>
      <div className="clothing-item-top" style={{ display: "flex", alignItems: "center", gap: "1rem", flexDirection: "column", overflow: "hidden", boxShadow: "rgba(0, 0, 0, 0.24) 0px 0px 8px 2px inset", borderBottom: isDisabled ? "solid 1px rgba(117, 117, 117, 0.23)" : "solid 1px rgba(117, 117, 117, 0.23)", background: "#00000082", borderRadius: "7px", backgroundImage: isDisabled ? "repeating-linear-gradient(45deg, #00000036, #00000036 2px, #3939390f 2px, #3939390f 6px)" : "repeating-linear-gradient(45deg, #00000036, #00000036 2px, #3939390f 2px, #3939390f 6px)", justifyContent: "center" }}>
        <div className="clothing-item-header">
          <div></div>
          <motion.div className="clothing-item-icon-wrapper" style={{ width: "100%", display: "flex", justifyContent: "center" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <div className="clothing-item-icon-container" style={{ height: "100%", width: "100%", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", marginTop: -5.5, position: "relative" }}>
              {equipped && <img className="clothing-item-shadow" src={Assets.Layers.inventoryActiveShadow} style={{ position: "absolute", height: "100%", width: "100%", top: 0, left: 0, zIndex: 1 }} />}
              <img className="clothing-item-icon" src={icon} alt={title} style={{ height: "100%", width: "100%", position: "relative", zIndex: 2, filter: isDisabled ? "grayscale(100%)" : "none" }} />
            </div>
          </motion.div>
        </div>
      </div>
      <div className="clothing-item-bottom" style={{ color: "#ffffff", paddingBottom: "12px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <p style={{ padding: "10px 5px 10px 5px", height: "45px", textAlign: "center", fontWeight: "100", fontFamily: "Oswald", width: "100%" }}>{title}</p>
        <div className="clothing-item-respect" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 5, marginBottom: 10, height: 60, color: "white" }}>
          {respect > 0 && (
            <>
              <img src={Assets.Icons.respect} height={22} />
              <p style={{ textAlign: "center", fontWeight: "100", fontFamily: "Oswald", paddingLeft: 8, fontSize: "20px", paddingBottom: 4, paddingRight: 2 }}>+</p>
              <p style={{ textAlign: "center", fontWeight: "100", fontFamily: "Oswald", fontSize: "20px", paddingBottom: 4 }}>{respect}</p>
            </>
          )}
        </div>
        {isPrem ? (
          <Button className="clothing-item-unequip-button" shadowColor={"#22c7a3"} width={"88%"} marginBottom={"5"} height={44} fontFamily={"Oswald"} fontWeight={"300"} text={price} icon={Assets.Icons.starsIcon} fontSize={14} borderColor={"rgb(34, 199, 163)"} color={"rgb(255, 255, 255)"} ownColor={"linear-gradient(to bottom, rgb(34 199 163 / 0%), rgb(34 199 163 / 24%))"} bgColor={"rgb(255, 118, 0)"} onClick={() => handleStarsBuy({ id, productType })} />
        ) : (
          <Button className="clothing-item-equip-button" shadowColor={"rgb(199, 80, 21)"} width={"88%"} color={"rgb(255, 255, 255)"} marginBottom={"5"} height={44} active={available} fontFamily={"Oswald"} fontWeight={"300"} icon={price > 0 ? Assets.Icons.balance : undefined} text={price === 0 ? "Забрать" : price} fontSize={14} ownColor={"rgb(255, 118, 0)"} bgColor={"rgb(255, 118, 0)"} onClick={() => (available || price === 0 ? handleCoinsBuy({ id, productType }) : null)} style={isDisabled ? { filter: "grayscale(100%)" } : {}} />
        )}
      </div>
    </div>
  );
};

const GridItemShelf = ({ id, productType, icon, title, isPrem, price, tonPrice, supply, available = true, respect = 0, handleCoinsBuy, handleStarsBuy, handleBuyNft }) => {
  const isNftItem = id >= 9 && id <= 38;
  const showBuyNFT = isNftItem;
  const { lang } = useSettingsProvider();

  return (
    <div className="clothing-item-container" style={{ borderRadius: "8px", border: "1px solid rgb(57, 57, 57)", background: "0% 0% / cover rgb(32, 32, 32)", padding: "10px" }}>
      <div className="clothing-item-top" style={{ display: "flex", alignItems: "center", gap: "1rem", flexDirection: "column", overflow: "hidden", borderBottom: "solid 1px rgba(117, 117, 117, 0.23)", boxShadow: "rgba(0, 0, 0, 0.24) 0px 0px 8px 2px inset", background: "#00000082", borderRadius: "7px", backgroundImage: "repeating-linear-gradient(45deg, #00000036, #00000036 2px, #3939390f 2px, #3939390f 6px)", justifyContent: "center" }}>
        <div className="clothing-item-header">
          <div></div>
          <motion.div className="clothing-item-icon-wrapper" style={{ width: "100%", display: "flex", justifyContent: "center" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <div className="clothing-item-icon-container" style={{ height: "100%", width: "100%", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", marginTop: -5.5, position: "relative" }}>
              <img src={icon} alt={title} style={{ width: "100%", position: "relative", zIndex: 2 }} />
            </div>
          </motion.div>
        </div>
      </div>
      <div className="clothing-item-bottom" style={{ paddingBottom: "12px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <p style={{ padding: "10px 5px 10px 5px", height: "45px", color: "white", textAlign: "center", fontWeight: "100", fontFamily: "Oswald", width: "90%" }}>{title}</p>
        <div className="clothing-item-respect" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 5, marginBottom: 10, height: 60, color: "white" }}>
          {respect > 0 && (
            <>
              <img src={Assets.Icons.respect} height={22} />
              <p style={{ textAlign: "center", fontWeight: "100", fontFamily: "Oswald", paddingLeft: 8, fontSize: "20px", paddingBottom: 4, paddingRight: 2 }}>+</p>
              <p style={{ textAlign: "center", fontWeight: "100", fontFamily: "Oswald", fontSize: "20px", paddingBottom: 4 }}>{respect}</p>
            </>
          )}
        </div>
        {isPrem ? (
          <Button className="clothing-item-equip-button" shadowColor={"#AF370F"} width={"88%"} marginBottom={"5"} color={"rgb(255, 255, 255)"} height={44} fontFamily={"Oswald"} fontWeight={"300"} text={price} icon={Assets.Icons.starsIcon} fontSize={14} borderColor={"rgb(34, 199, 163)"} ownColor={"linear-gradient(to bottom, rgb(34 199 163 / 0%), rgb(34 199 163 / 24%))"} bgColor={"linear-gradient(to bottom, rgb(34 199 163 / 0%), rgb(34 199 163 / 24%))"} onClick={() => handleStarsBuy({ id, productType })} />
        ) : showBuyNFT ? (
          <div style={{ textAlign: "center", width: "88%" }}>
            <p style={{ color: "white", fontFamily: "Oswald", fontSize: "14px" }}>{tonPrice} TON</p>
            <p style={{ color: "white", fontFamily: "Oswald", fontSize: "12px", marginBottom: "5px" }}>Supply: {supply} available</p>
            <Button className="clothing-item-equip-button" shadowColor={"#AF370F"} width={"100%"} marginBottom={"5"} color={"rgb(255, 255, 255)"} height={44} fontFamily={"Oswald"} fontWeight={"300"} text={lang === "en" ? "Buy NFT" : "Купить NFT"} fontSize={14} ownColor={"rgb(255, 118, 0)"} bgColor={"rgb(255, 118, 0)"} onClick={() => handleBuyNft({ id, productType, title, icon, tonPrice })} active={supply > 0} />
          </div>
        ) : (
          <Button className="clothing-item-equip-button" shadowColor={"rgb(199, 80, 21)"} width={"88%"} marginBottom={"5"} color={"rgb(255, 255, 255)"} height={44} active={available || price === 0} fontFamily={"Oswald"} fontWeight={"300"} icon={price > 0 ? Assets.Icons.balance : undefined} text={price === 0 ? "Забрать" : price} fontSize={14} ownColor={"rgb(255, 118, 0)"} bgColor={"rgb(255, 118, 0)"} onClick={() => (available || price === 0 ? handleCoinsBuy({ id, productType }) : null)} />
        )}
      </div>
    </div>
  );
};

const GridLayout = ({ items, handleCoinsBuy, handleStarsBuy, handleBuyNft }) => {
  return (
    <div style={{ width: "100vw", display: "flex", justifyContent: "center", paddingBottom: 55 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", width: "90vw" }}>
        {items.map((item, index) => {
          if (item.category === "Shelf") {
            return (
              <GridItemShelf key={index} icon={item.image} title={item.name} price={item.price} tonPrice={item.tonPrice} supply={item.supply} respect={item.respect} equipped={item.equipped} available={item.available} handleCoinsBuy={handleCoinsBuy} handleStarsBuy={handleStarsBuy} handleBuyNft={handleBuyNft} clothingId={item.clothing_id} type={item.category} isPrem={item.isPrem} description={item.description} id={item.id} productType={item.productType} />
            );
          } else {
            return (
              <GridItem key={index} icon={item.image} title={item.name} price={item.price} respect={item.respect} equipped={item.equipped} available={item.available} handleCoinsBuy={handleCoinsBuy} handleStarsBuy={handleStarsBuy} clothingId={item.clothing_id} type={item.category} id={item.id} productType={item.productType} />
            );
          }
        })}
      </div>
    </div>
  );
};
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
      console.log("Backend Response:", {
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
  
      // Validate Address (TON mainnet, bounceable, EQ prefix)
      if (!address || !address.match(/^EQ[0-9A-Za-z_-]{46}$/)) {
        throw new Error(`Invalid TON address: ${address} (expected EQ + 46 base64 chars)`);
      }
  
      // Validate Amount (string nanotons, matches tonPrice)
      const expectedNanotons = String(BigInt(Math.floor(item.tonPrice * 1e9)));
      const amountInNanotons = String(amount);
      if (!/^\d+$/.test(amountInNanotons) || BigInt(amountInNanotons) <= 0) {
        throw new Error(`Invalid amount: ${amountInNanotons} (must be positive integer nanotons)`);
      }
      if (amountInNanotons !== expectedNanotons) {
        console.warn(`Amount mismatch: Backend=${amountInNanotons}, Expected=${expectedNanotons} for ${item.tonPrice} TON`);
      }
  
      // Validate Memo and Payload (max 128 bytes raw, ~172 chars base64)
      let trimmedMemo = memo && typeof memo === "string" ? memo : "";
      if (trimmedMemo.length > 120) {
        trimmedMemo = trimmedMemo.substring(0, 120);
        console.warn("Memo trimmed to 120 chars:", trimmedMemo);
      }
      const rawPayload = trimmedMemo ? Buffer.from(trimmedMemo, "utf8") : null;
      const payload = rawPayload ? rawPayload.toString("base64") : undefined;
      if (rawPayload && rawPayload.length > 128) {
        throw new Error(`Raw payload exceeds 128 bytes: ${rawPayload.length}`);
      }
  
      // Set validUntil (5 minutes)
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
  
      console.log("Transaction for Wallet:", {
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
  
      console.log("Wallet Response:", result);
  
      // Optional backend verification
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

  const handleStarsBuy = async (item) => {
    try {
      setIsLoading(true);
      await handleStarsPayment(userId, item.productType, item.id, lang);
      await refreshData();
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
    } catch (err) {
      console.error("Stars payment failed:", err);
      WebApp.showAlert("Failed to process stars payment.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoinsBuy = async (item) => {
    try {
      setIsLoading(true);
      await buyItemsForCoins(userId, item.id, item.productType);
      await refreshData();
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
    } catch (err) {
      console.error("Coins purchase failed:", err);
      WebApp.showAlert("Failed to process coins purchase.");
    } finally {
      setIsLoading(false);
    }
  };

  const addComplexFilter = ({ filteredValue, filteredField }) => {
    setCurrentComplexFilters([...currentComplexFilters, { filteredField, filteredValue }]);
  };

  const removeComplexFilter = ({ filteredValue, filteredField }) => {
    setCurrentComplexFilters(currentComplexFilters.filter((filter) => filter.filteredField !== filteredField || filter.filteredValue !== filteredValue));
  };

  const applyFilter = (items) => {
    if (!filterTypeInUse) return items;
    if (filterTypeInUse === BaseFilters.Complex) {
      if (!currentComplexFilters || currentComplexFilters.length === 0) return items;
      const tags = currentComplexFilters.filter((filter) => filter.filteredField === "tag").map((filter) => filter.filteredValue);
      const tiers = currentComplexFilters.filter((filter) => filter.filteredField === "tier").map((filter) => filter.filteredValue);
      return items.filter((item) => {
        const isCorrectByTier = tiers.length > 0 ? tiers.includes(item.tier) : true;
        const isCorrectByTags = tags.length > 0 ? item.tags?.some((tag) => tags.includes(tag)) : true;
        return isCorrectByTier && isCorrectByTags;
      });
    }
    if (filterTypeInUse === BaseFilters.Hat) return items.filter((item) => item.category === "Hat");
    if (filterTypeInUse === BaseFilters.Top) return items.filter((item) => item.category === "Top");
    if (filterTypeInUse === BaseFilters.Pants) return items.filter((item) => item.category === "Pants");
    if (filterTypeInUse === BaseFilters.Shoes) return items.filter((item) => item.category === "Shoes");
    if (filterTypeInUse === BaseFilters.Accessories) return items.filter((item) => item.category === "Accessory");
    if (filterTypeInUse === BaseFilters.Shelf) return items.filter((item) => item.productType === "shelf");
    if (filterTypeInUse === BaseFilters.Stars) return items.filter((item) => item.isPrem === true);
  };

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
            <p>{lang === "en" ? "Item:" : "Товар:"} {transactionDetails?.item?.title || "N/A"}</p>
            <p>{lang === "en" ? "Price:" : "Цена:"} {transactionDetails?.item?.tonPrice || "N/A"} TON</p>
            <p>{lang === "en" ? "To:" : "Кому:"} {transactionDetails?.address?.slice(0, 6)}...{transactionDetails?.address?.slice(-4)}</p>
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

const NftTabWithTonConnect = () => <NftTab />;

export default NftTabWithTonConnect;