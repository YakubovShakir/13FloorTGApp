const Telegram = window.Telegram.WebApp

const useTelegram = {
  setReady: () => Telegram?.ready(),
  setFullScreen: () => Telegram.expand(),
  setBackButton: (callback) => {
    Telegram.BackButton.onClick(callback)
    Telegram.BackButton.show()
  },
  getUserId: Telegram?.initDataUnsafe?.user?.id,

  hideBackButton: () => {
    Telegram.BackButton.show()
    Telegram.BackButton.hide()
  },
  setHeaderColor: (color) => Telegram.setHeaderColor(color),
}

export default useTelegram
