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
import WebApp from "@twa-dev/sdk";
import { useSettingsProvider } from "../../../hooks";
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { Buffer } from "buffer";
window.Buffer = Buffer;
import { beginCell } from "@ton/ton";
// Removed Buffer dependency since we're using @ton/ton exclusively

const GridItem = ({
  id,
  productType,
  icon,
  title,
  price,
  available = true,
  respect = 0,
  equipped,
  isPrem = false,
  handleCoinsBuy,
  handleStarsBuy,
}) => {
  const isDisabled = !available && price > 0;
  return (
    <div
      className="clothing-item-container"
      style={{
        borderRadius: "8px",
        borderBottom: "solid 1px rgba(117, 117, 117, 0.23)",
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
          boxShadow: "rgba(0, 0, 0, 0.24) 0px 0px 8px 2px inset",
          borderBottom: isDisabled
            ? "solid 1px rgba(117, 117, 117, 0.23)"
            : "solid 1px rgba(117, 117, 117, 0.23)",
          background: "#00000082",
          borderRadius: "7px",
          backgroundImage: isDisabled
            ? "repeating-linear-gradient(45deg, #00000036, #00000036 2px, #3939390f 2px, #3939390f 6px)"
            : "repeating-linear-gradient(45deg, #00000036, #00000036 2px, #3939390f 2px, #3939390f 6px)",
          justifyContent: "center",
        }}
      >
        <div className="clothing-item-header">
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
              {equipped && (
                <img
                  className="clothing-item-shadow"
                  src={Assets.Layers.inventoryActiveShadow}
                  style={{
                    position: "absolute",
                    height: "100%",
                    width: "100%",
                    top: 0,
                    left: 0,
                    zIndex: 1,
                  }}
                />
              )}
              <img
                className="clothing-item-icon"
                src={icon}
                alt={title}
                style={{
                  height: "100%",
                  width: "100%",
                  position: "relative",
                  zIndex: 2,
                  filter: isDisabled ? "grayscale(100%)" : "none",
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
      <div
        className="clothing-item-bottom"
        style={{
          color: "#ffffff",
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
            textAlign: "center",
            fontWeight: "100",
            fontFamily: "Oswald",
            width: "100%",
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
                  paddingRight: 2,
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
        {isPrem ? (
          <Button
            className="clothing-item-unequip-button"
            shadowColor={"#22c7a3"}
            width={"88%"}
            marginBottom={"5"}
            height={44}
            fontFamily={"Oswald"}
            fontWeight={"300"}
            text={price}
            icon={Assets.Icons.starsIcon}
            fontSize={14}
            borderColor={"rgb(34, 199, 163)"}
            color={"rgb(255, 255, 255)"}
            ownColor={
              "linear-gradient(to bottom, rgb(34 199 163 / 0%), rgb(34 199 163 / 24%))"
            }
            bgColor={"rgb(255, 118, 0)"}
            onClick={() => handleStarsBuy({ id, productType })}
          />
        ) : (
          <Button
            className="clothing-item-equip-button"
            shadowColor={"rgb(199, 80, 21)"}
            width={"88%"}
            color={"rgb(255, 255, 255)"}
            marginBottom={"5"}
            height={44}
            active={available}
            fontFamily={"Oswald"}
            fontWeight={"300"}
            icon={price > 0 ? Assets.Icons.balance : undefined}
            text={price === 0 ? "Забрать" : price}
            fontSize={14}
            ownColor={"rgb(255, 118, 0)"}
            bgColor={"rgb(255, 118, 0)"}
            onClick={() =>
              available || price === 0
                ? handleCoinsBuy({ id, productType })
                : null
            }
            style={isDisabled ? { filter: "grayscale(100%)" } : {}}
          />
        )}
      </div>
    </div>
  );
};

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
        <div className="clothing-item-header">
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
                  paddingRight: 2,
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
        {isPrem ? (
          <Button
            className="clothing-item-equip-button"
            shadowColor={"#AF370F"}
            width={"88%"}
            marginBottom={"5"}
            color={"rgb(255, 255, 255)"}
            height={44}
            fontFamily={"Oswald"}
            fontWeight={"300"}
            text={price}
            icon={Assets.Icons.starsIcon}
            fontSize={14}
            borderColor={"rgb(34, 199, 163)"}
            ownColor={
              "linear-gradient(to bottom, rgb(34 199 163 / 0%), rgb(34 199 163 / 24%))"
            }
            bgColor={
              "linear-gradient(to bottom, rgb(34 199 163 / 0%), rgb(34 199 163 / 24%))"
            }
            onClick={() => handleStarsBuy({ id, productType })}
          />
        ) : showBuyNFT ? (
          <div style={{ textAlign: "center", width: "88%" }}>
            <p
              style={{ color: "white", fontFamily: "Oswald", fontSize: "14px" }}
            >
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
              Supply: {supply} available
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
              onClick={() =>
                handleBuyNft({ id, productType, title, icon, tonPrice })
              }
              active={supply > 0}
            />
          </div>
        ) : (
          <Button
            className="clothing-item-equip-button"
            shadowColor={"rgb(199, 80, 21)"}
            width={"88%"}
            marginBottom={"5"}
            color={"rgb(255, 255, 255)"}
            height={44}
            active={available || price === 0}
            fontFamily={"Oswald"}
            fontWeight={"300"}
            icon={price > 0 ? Assets.Icons.balance : undefined}
            text={price === 0 ? "Забрать" : price}
            fontSize={14}
            ownColor={"rgb(255, 118, 0)"}
            bgColor={"rgb(255, 118, 0)"}
            onClick={() =>
              available || price === 0
                ? handleCoinsBuy({ id, productType })
                : null
            }
          />
        )}
      </div>
    </div>
  );
};

const GridLayout = ({ items, handleCoinsBuy, handleStarsBuy, handleBuyNft }) => {
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
                available={item.available}
                handleCoinsBuy={handleCoinsBuy}
                handleStarsBuy={handleStarsBuy}
                handleBuyNft={handleBuyNft}
                clothingId={item.clothing_id}
                type={item.category}
                isPrem={item.isPrem}
                description={item.description}
                id={item.id}
                productType={item.productType}
              />
            );
          } else {
            return (
              <GridItem
                key={index}
                icon={item.image}
                title={item.name}
                price={item.price}
                respect={item.respect}
                equipped={item.equipped}
                available={item.available}
                handleCoinsBuy={handleCoinsBuy}
                handleStarsBuy={handleStarsBuy}
                clothingId={item.clothing_id}
                type={item.category}
                id={item.id}
                productType={item.productType}
              />
            );
          }
        })}
      </div>
    </div>
  );
};

// Utility to convert TON (decimal string) to nanotons (BigInt)
const toNano = (tonAmount) => {
  if (typeof tonAmount !== "string" || !/^\d+(\.\d+)?$/.test(tonAmount)) {
    throw new Error(`Invalid TON amount: ${tonAmount}`);
  }
  const [integerPart, decimalPart = ""] = tonAmount.split(".");
  const paddedDecimal = decimalPart.padEnd(9, "0");
  const fullNumber = `${integerPart}${paddedDecimal}`;
  return BigInt(fullNumber);
};

const handleSendTransactionTonConnect = async (
  tonConnectUI,
  WebApp,
  walletAddress,
  amount,
  UUID,
  userId,
  instance,
  setIsTransactionModalOpen,
  setIsLoading,
  refreshData,
  fetchShopItems
) => {
  // Create payload with UUID as a comment
  const body = beginCell()
    .storeUint(0, 32) // 32-bit 0 opcode for comment
    .storeStringTail(UUID) // Use UUID as memo
    .endCell();

  const paymentRequest = {
    messages: [
      {
        address: walletAddress,
        amount: toNano(amount).toString(),
        payload: body.toBoc().toString("base64"), // Proper TON cell serialization
      },
    ],
    validUntil: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    network: "-239", // Mainnet
  };

  try {
    setIsLoading(true);

    // Step 1: Ensure wallet is connected
    if (!tonConnectUI.connected) {
      console.log("Wallet not connected, opening modal...");
      await tonConnectUI.openModal();
      if (!tonConnectUI.connected) {
        WebApp.showAlert("Wallet connection cancelled.");
        return;
      }
    }

    console.log("Connected Wallet Details:", {
      wallet: tonConnectUI.wallet,
      connected: tonConnectUI.connected,
      chain: tonConnectUI.wallet?.account?.chain,
      address: tonConnectUI.wallet?.account?.address,
      appName: tonConnectUI.wallet?.appName,
      platform: WebApp.platform,
    });

    // // Step 2: Validate address
    // if (!walletAddress || !/^[A-Za-z0-9+/=-]{48}$/.test(walletAddress)) {
    //   throw new Error(`Invalid TON address: ${walletAddress}`);
    // }
    console.log("Destination Address:", walletAddress);

    // Step 3: Log transaction details
    console.log("Amount in TON:", amount);
    console.log("Amount in Nanotons:", toNano(amount).toString());
    console.log("Memo (raw):", UUID);
    console.log("Payload (base64):", body.toBoc().toString("base64"));
    console.log("Full Transaction Object:", JSON.stringify(paymentRequest, null, 2));

    // Step 4: Construct universal link as fallback
    const universalLink = `ton://transfer/${walletAddress}?amount=${toNano(amount)}&text=${encodeURIComponent(UUID)}`;
    const isTelegramBrowser = WebApp.platform !== "unknown" && WebApp.platform !== undefined;

    // Step 5: Send transaction via TonConnect
    const result = await tonConnectUI.sendTransaction(paymentRequest, {
      modals: "all",
      skipRedirectToWallet: "never",
    });
    console.log("TonConnect Transaction Result:", result);

    // Step 6: Verify with backend (include more data for flexibility)
    const verifyResponse = await instance.post(`/users/nft/verify-transaction`, {
      userId,
      transactionId: result.boc,
      memo: UUID,
      amount: toNano(amount).toString(),
      destination: walletAddress,
    });
    console.log("Backend Verification Response:", verifyResponse.data);

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

    // // Fallback to universal link if TonConnect fails
    // const universalLink = `ton://transfer/${walletAddress}?amount=${toNano(amount)}&text=${encodeURIComponent(UUID)}`;
    // console.log("Universal Link (fallback):", universalLink);
    // if (isTelegramBrowser) {
    //   WebApp.openLink(universalLink);
    //   WebApp.showAlert("TonConnect failed. Opening wallet with memo via link.");
    // } else {
    //   window.open(universalLink, "_blank");
    //   WebApp.showAlert("TonConnect failed. Opening wallet in a new tab.");
    // }
  } finally {
    setIsTransactionModalOpen(false);
    setIsLoading(false);
  }
};

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
  const wallet = useTonWallet();

  // Debug TonConnectUI state
  useEffect(() => {
    console.log("TonConnectUI Initial State:", {
      connected: tonConnectUI.connected,
      wallet: tonConnectUI.wallet,
      availableWallets: tonConnectUI.availableWallets,
      platform: WebApp.platform,
    });

    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      console.log("TonConnectUI Wallet Status Changed:", {
        connected: tonConnectUI.connected,
        wallet: wallet,
        platform: WebApp.platform,
      });
    });

    return () => unsubscribe();
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

  // Fetch shop items when the tab is active
  const fetchShopItems = async () => {
    try {
      console.log("Fetching shop items for userId:", userId, "lang:", lang);
      setIsLoading(true);
      const data = await getShopItems(userId);
      console.log("getShopItems Response:", data);

      const loadedShelfItems = await Promise.all(
        data.shelf
          .filter((item) => item.type === "neko")
          .map(async (item) => {
            const supplyResponse = await instance.get(
              `/users/nft/supply/${item.id}`
            );
            console.log(`Supply for item ${item.id}:`, supplyResponse.data);
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
              available:
                item.cost.stars > 0 ||
                item.cost.coins === 0 ||
                userParameters.coins >= item.cost.coins,
              description: item.description && item.description[lang],
              respect: item.respect,
            };
          })
      );
      console.log("Loaded Shelf Items:", loadedShelfItems);
      setShelfItems(loadedShelfItems);
    } catch (error) {
      console.error("Error fetching shop items:", error);
      WebApp.showAlert(`Failed to load shop items: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Run fetchShopItems when the tab is mounted or dependencies change
  useEffect(() => {
    console.log("useEffect triggered for fetchShopItems");
    fetchShopItems();
  }, [userId, lang, userParameters.coins]);

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Tab became visible, re-fetching items...");
        fetchShopItems();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [userId, lang, userParameters.coins]);

  const handleConfirmTransaction = async () => {
    try {
      setIsLoading(true);

      const { address, item } = transactionDetails;

      // if (!address || !/^[A-Za-z0-9+/=-]{48}$/.test(address)) {
      //   throw new Error(`Invalid TON address from backend: ${address}`);
      // }

      const tonPriceString = item.tonPrice.toString();
      const UUID = "081598dc-efb9-45d7-910f-d1dab767a3a0";

      await handleSendTransactionTonConnect(
        tonConnectUI,
        WebApp,
        address,
        tonPriceString,
        UUID,
        userId,
        instance,
        setIsTransactionModalOpen,
        setIsLoading,
        refreshData,
        fetchShopItems
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
      console.log("Backend Transaction Details:", {
        address: response.data.address,
        amount: response.data.amount,
        memo: response.data.memo,
        itemId: item.id,
        tonPrice: item.tonPrice,
      });
      if (item.tonPrice !== 1 && item.tonPrice !== "1") {
        item.tonPrice = "1"; // Force 1 TON
      }
      setTransactionDetails({ ...response.data, item });
      setIsTransactionModalOpen(true);
      await handleConfirmTransaction();
    } catch (error) {
      console.error("Failed to fetch transaction details:", error);
      WebApp.showAlert("Failed to fetch transaction details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addComplexFilter = ({ filteredValue, filteredField }) => {
    setCurrentComplexFilters([
      ...currentComplexFilters,
      { filteredField, filteredValue },
    ]);
  };

  const removeComplexFilter = ({ filteredValue, filteredField }) => {
    setCurrentComplexFilters(
      currentComplexFilters.filter(
        (filter) =>
          filter.filteredField !== filteredField ||
          filter.filteredValue !== filteredValue
      )
    );
  };

  const applyFilter = (items) => {
    if (!filterTypeInUse) return items;
    if (filterTypeInUse === BaseFilters.Complex) {
      if (!currentComplexFilters || currentComplexFilters.length === 0)
        return items;
      const tags = currentComplexFilters
        .filter((filter) => filter.filteredField === "tag")
        .map((filter) => filter.filteredValue);
      const tiers = currentComplexFilters
        .filter((filter) => filter.filteredField === "tier")
        .map((filter) => filter.filteredValue);
      return items.filter((item) => {
        const isCorrectByTier =
          tiers.length > 0 ? tiers.includes(item.tier) : true;
        const isCorrectByTags =
          tags.length > 0 ? item.tags?.some((tag) => tags.includes(tag)) : true;
        return isCorrectByTier && isCorrectByTags;
      });
    }
    if (filterTypeInUse === BaseFilters.Hat)
      return items.filter((item) => item.category === "Hat");
    if (filterTypeInUse === BaseFilters.Top)
      return items.filter((item) => item.category === "Top");
    if (filterTypeInUse === BaseFilters.Pants)
      return items.filter((item) => item.category === "Pants");
    if (filterTypeInUse === BaseFilters.Shoes)
      return items.filter((item) => item.category === "Shoes");
    if (filterTypeInUse === BaseFilters.Accessories)
      return items.filter((item) => item.category === "Accessory");
    if (filterTypeInUse === BaseFilters.Shelf)
      return items.filter((item) => item.productType === "shelf");
    if (filterTypeInUse === BaseFilters.Stars)
      return items.filter((item) => item.isPrem === true);
    return items;
  };

  if (isLoading) {
    return <FullScreenSpinner />;
  }

  return (
    <ScreenContainer withTab>
      {isFilterModalOpen && (
        <FilterModal
          baseStyles={{
            position: "fixed",
            height: "100vh",
            width: "100vw",
            backgroundColor: "black",
            zIndex: 10,
            top: 0,
            left: 0,
          }}
          addComplexFilter={addComplexFilter}
          removeComplexFilter={removeComplexFilter}
          setIsFilterModalOpen={setIsFilterModalOpen}
          currentComplexFilters={currentComplexFilters}
        />
      )}
      <GridLayout
        items={applyFilter([...(shelfItems || [])])}
        handleCoinsBuy={() => {}}
        handleStarsBuy={() => {}}
        handleBuyNft={handleBuyNft}
      />
      {isTransactionModalOpen && (
        <Modal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          title={lang === "en" ? "Confirm Transaction" : "Подтвердить транзакцию"}
        >
          <p>{lang === "en" ? "Confirm your purchase" : "Подтвердите покупку"}</p>
          <Button
            text={lang === "en" ? "Confirm" : "Подтвердить"}
            onClick={handleConfirmTransaction}
            disabled={isLoading}
          />
        </Modal>
      )}
    </ScreenContainer>
  );
};

const NftTabWithTonConnect = () => <NftTab />;

export default NftTabWithTonConnect;