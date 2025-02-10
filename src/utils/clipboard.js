export async function copyTextToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true; // Indicate success
    } catch (err) {
      return false; // Indicate failure
    }
  }
  