export const formatCoins = (amount) => {
    if (amount >= 1e9) {
      return `${(amount / 1e9).toFixed(2)}b`;
    } else if (amount >= 1e6) {
      return `${(amount / 1e6).toFixed(2)}m`;
    } else if (amount >= 1e3) {
      return `${(amount / 1e3).toFixed(2)}k`;
    } else {
      return amount.toString();
    }
  };