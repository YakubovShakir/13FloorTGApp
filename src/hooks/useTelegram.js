
const Telegram = window.Telegram.WebApp

const useTelegram = {
  waitReady: () => Telegram.ready(),
  setFullScreen: () => Telegram.expand(),
  setBackButton: (callback) => {
    Telegram.BackButton.onClick(callback)
    Telegram.BackButton.show()
  },
  hideBackButton: () => Telegram.BackButton.show(),
  setHeaderColor: (color) => Telegram.setHeaderColor(color)
}

export default useTelegram