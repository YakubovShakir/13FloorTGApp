import homeBackgroundImage from "./IMG/homeBG.png"
import homeBackground from "./IMG/bg/homeBackground.png"
import avatar from "./IMG/avatar.png"
import plus from "./IMG/icons/plus.png"
import happiness from "./IMG/icons/happiness.png"
import hungry from "./IMG/icons/hungry.png"
import energy from "./IMG/icons/energy.png"
import balance from "./IMG/icons/balance.png"
import cup from "./IMG/icons/cup.png"
import settings from "./IMG/icons/settings.png"
import activity from "./IMG/icons/activity.png"
import care from "./IMG/icons/care.png"
import tasks from "./IMG/icons/tasks.png"
import contacts from "./IMG/icons/contacts.png"
import clock from "./IMG/icons/clock.png"
import training from "./IMG/icons/training.png"
import notify from "./IMG/icons/notify.png"
import cancel from "./IMG/icons/cancel.png"
import respect from "./IMG/icons/respect.png"
import book from "./IMG/icons/book.png"
import phone from "./IMG/icons/phone.png"
import trainingCardBG from "./IMG/bg/trainingCard.png"
import workCardBG from "./IMG/bg/workCard.png"
import organizer from "./IMG/icons/organizer.png"

import cleaner from "./IMG/icons/cleaner.png"
import cleanerDark from "./IMG/icons/cleaner.png"

import courier from "./IMG/icons/courier.png"
import courierDark from "./IMG/icons/courier.png"

import loader from "./IMG/icons/loader.png"
import loaderDark from "./IMG/icons/loader.png"

import waiter from "./IMG/icons/waiter.png"
import waiterDark from "./IMG/icons/waiter.png"

import internDark from "./IMG/icons/intern-dark.png"
import intern from "./IMG/icons/intern.png"

import journalistAssistent from "./IMG/icons/journalistAssistent.png"
import journalistAssistentDark from "./IMG/icons/journalistAssistent-dark.png"

import juniorDev from "./IMG/icons/juniorDev.png"
import juniorDevDark from "./IMG/icons/juniorDev-dark.png"

import host from "./IMG/icons/host.png"
import hostDark from "./IMG/icons/host.png"

import marketolog from "./IMG/icons/marketolog.png"
import marketologDark from "./IMG/icons/marketolog-dark.png"

import middleDev from "./IMG/icons/middleDev.png"
import middleDevDark from "./IMG/icons/middleDev-dark.png"

import reporter from "./IMG/icons/reporter.png"
import reporterDark from "./IMG/icons/reporter.png"

import security from "./IMG/icons/security.png"
import securityDark from "./IMG/icons/security.png"

import coachAssistent from "./IMG/icons/coachAssistent.png"
import coachAssistentDark from "./IMG/icons/coachAssistent-dark.png"

import store from "./IMG/icons/store.png"
import starStore from "./IMG/icons/starStore.png"

import burger from "./IMG/icons/burger.png"
import cake from "./IMG/icons/cake.png"
import donat from "./IMG/icons/donat.png"
import shoes from "./IMG/icons/shoes.png"
import iphone from "./IMG/icons/iphone.png"
import sneakers from "./IMG/icons/sneakers.png"
import play from "./IMG/icons/play.png"

import barber from "./IMG/icons/barber.png"
import calc from "./IMG/icons/calc.png"
import coffeeShop from "./IMG/icons/coffeeShop.png"

import brownPlus from "./IMG/icons/brownPlus.png"

import ton from "./IMG/icons/ton.png"
import manager from "./IMG/icons/manager.png"

import arrowRight from "./IMG/icons/arrowRight.png"
import happinessDown from "./IMG/icons/happinessDown.png"

import backgroundSun from "./IMG/bg/backSun.png"

import storeShoes from "./IMG/icons/storeShoes.png"
import broom from "./IMG/icons/broom.png"
import cap from "./IMG/icons/cap.png"
import headphones from "./IMG/icons/headphones.png"
import pants from "./IMG/icons/pants.png"
import jacket from "./IMG/icons/jacket.png"
import filter from "./IMG/icons/filter.png"
import jeans from "./IMG/icons/jeans.png"

import manAsia from "./IMG/avatars/mans/manAsia.png"
import euGirl from "./IMG/avatars/girls/europe.png"
import blackSkin from "./IMG/avatars/girls/clothes/top/blackSkin.png"
import miniSkirt from "./IMG/avatars/girls/clothes/legs/mini.png"
import hightHeels from "./IMG/avatars/girls/clothes/feet/HighHeels.png"
import hair from "./IMG/avatars/girls/clothes/head/hair.png"

import typeShoes from "./IMG/icons/typeShoes.png"
import legs from "./IMG/icons/legs.png"
import head from "./IMG/icons/head.png"
import body from "./IMG/icons/body.png"
import accessory from "./IMG/icons/accessory.png"

import afro from "./IMG/avatars/girls/clothes/head/afro.png"

import StartCustomizeBG from "./IMG/bg/StartCustomizeBG.png"

import male from "./IMG/icons/StartCustomize/male.png"
import female from "./IMG/icons/StartCustomize/female.png"
import femaleBlack from "./IMG/icons/StartCustomize/black.png"
import femaleAzia from "./IMG/icons/StartCustomize/azia.png"
import femaleEurope from './IMG/icons/StartCustomize/europe.png'

export function getImgUrl(name) {
  return new URL(`${name}`, import.meta.url).href
}

const Assets = {
  Images: {
    homeBackgroundImage,
    avatar,
    manAsia,
    euGirl,
    blackSkin,
    miniSkirt,
    hightHeels,
    hair,
    afro
  },
  Icons: {
    femaleAzia,
    femaleBlack,
    femaleEurope,
    female,
    male,
    typeShoes,
    legs,
    head,
    body,
    accessory,
    plus,
    happiness,
    hungry,
    energy,
    balance,
    cup,
    settings,
    activity,
    care,
    tasks,
    contacts,
    clock,
    training,
    notify,
    cancel,
    respect,
    book,
    phone,
    organizer,
    cleaner,
    cleanerDark,
    courier,
    courierDark,
    loader,
    loaderDark,
    waiter,
    waiterDark,
    internDark,
    intern,
    journalistAssistent,
    journalistAssistentDark,
    juniorDev,
    juniorDevDark,
    host,
    hostDark,
    marketolog,
    marketologDark,
    middleDev,
    middleDevDark,
    reporter,
    reporterDark,
    security,
    securityDark,
    coachAssistent,
    coachAssistentDark,
    store,
    starStore,
    burger,
    cake,
    shoes,
    sneakers,
    iphone,
    donat,
    play,
    barber,
    coffeeShop,
    calc,
    brownPlus,
    ton,
    manager,
    arrowRight,
    happinessDown,
    storeShoes,
    jacket,
    pants,
    headphones,
    broom,
    cap,
    filter,
    jeans
  },
  BG: {
    trainingCardBG,
    workCardBG,
    backgroundSun,
    homeBackground,
    StartCustomizeBG,

  },
}

// export const getIcon = (name) => (
//   <img src={require(`./IMG/icons/${name}.png`)} alt={`${name}Icon`} />
// )

export default Assets
