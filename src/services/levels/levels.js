import { instance } from "../instance"

// Получить уровни
export const getLevels = async () => {
  try {
    const response = await instance.get(`/levels/getAll`)
    return response.data.levels
  } catch (e) {
    console.log("Error in getLevels ", e)
  }
}
