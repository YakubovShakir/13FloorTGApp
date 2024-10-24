
const Telegram = window.Telegram.WebApp

const useTelegram = {
  waitReady: Telegram.ready(),
  setFullScreen: Telegram.expand(),
  setHeaderColor: (color) => Telegram.setHeaderColor(color)
}

export default useTelegram