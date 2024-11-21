import { instance } from "./instance"

export const getBoosts = async () => {
  try {
    let boosts
    await instance
      .get(`/boosts/all`)
      .then((response) => (boosts = response.data.boosts))
      .catch((error) => {
        console.log("Some error on /boosts/all:", error)
      })
    return boosts
  } catch (e) {
    console.log("Error while fetch boosts ", e)
  }
}
