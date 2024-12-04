import { instance } from "../instance"

export const getFoods = async () => {
  try {
    let foods
    await instance
      .get(`/food/getAll`)
      .then((response) => (foods = response.data.foods))
      .catch((error) => {
        console.log("Some error on /foods/getAll:", error)
      })
    return foods
  } catch (error) {
    console.log("api /foods/all catch error - ", e)
  }
}

