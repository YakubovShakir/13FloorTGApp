import { instance } from "../instance"

export const getFoods = async () => {
  try {
    let foods
    await instance
      .get(`/foods/all`)
      .then((response) => (foods = response.data.foods))
      .catch((error) => {
        console.log("Some error on /foods/all:", error)
      })
    return foods
  } catch (error) {
    console.log("api /foods/all catch error - ", e)
  }
}

export const buyFood = async (userId, foodId) => {
  try {
    let status
    await instance
      .post(`/foods/buy`, null, {
        params: { userId: userId, foodId: foodId },
      })
      .then((response) => console.log(response.status))
      .catch((error) => {
        console.log("Some error on /foods/buy:", error)
      })
    return status === 200 ? true : false
  } catch (error) {
    console.log("api /foods/buy catch error - ", e)
  }
}
