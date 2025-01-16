import { postEvent } from '@telegram-apps/sdk';

const Telegram = window.Telegram.WebApp

const useTelegram = {
  setReady: () => {
    postEvent('web_app_request_fullscreen')
    postEvent('web_app_expand')
    Telegram?.ready()
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
