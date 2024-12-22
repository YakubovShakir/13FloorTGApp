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

export const fetchTaskIsCompleted = async (taskId, userId) => {
  try {
    const response = await instance.get(`/task/checkCompleted`, {
      params: { taskId: taskId, userId: userId },
    })
    return response.data
  } catch (e) {
    console.log("Error in checkTaskIsCompleted ", e)
  }
}

export const claimTaskReward = async (taskId, userId) => {
  try {
    const response = await instance.post(`/task/claimReward`, null, {
      params: {
        taskId: taskId,
        userId: userId,
      },
    })
    return response.status
  } catch (e) {
    console.log("Error in claimTaskReward ", e)
  }
}
