import { instance } from "../instance"

export const getTasks = async () => {
  try {
    const response = await instance.get(`/task/getAll`)
    return response.data.tasks
  } catch (e) {
    console.log("Error while fetch tasks ", e)
  }
}

export const getUserTasks = async (userId) => {
  try {
    const response = await instance.get(`/task/getUserTasks`, {
      params: { userId: userId },
    })
    return response.data.tasks
  } catch (e) {
    console.log("Error while fetch user tasks ", e)
  }
}
