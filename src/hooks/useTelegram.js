import WebApp from "@twa-dev/sdk"; 
import{ postEvent } from '@telegram-apps/sdk';

const Telegram = WebApp

const useTelegram = {
  setReady: () => {
    try {
      console.log(WebApp.version)
      postEvent('web_app_expand')
      postEvent('web_app_request_fullscreen')
      postEvent('web_app_ready')
    } catch(err) {
      console.log(err)
    }
  },
  setFullScreen: () => {
    // try {
    //   // doesnt work in browsers
    //   Telegram.expand()
    //   postEvent('web_app_expand')
    // } catch(_) {}
  },
  setBackButton: (callback) => {
    // Telegram.BackButton.onClick(callback)
    // Telegram.BackButton.show()
  },
  getUserId: Telegram?.initDataUnsafe?.user?.id,

  hideBackButton: () => {
    // Telegram.BackButton.show()
    // Telegram.BackButton.hide()
  },
  setHeaderColor: (color) => {
    // Telegram.setHeaderColor(color)
  },
}

export default useTelegram
