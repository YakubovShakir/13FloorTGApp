import { instance } from "../instance"

export const getWorks = async () => {
  try {
    let works
    await instance
      .get(`/work/getAll`)
      .then((response) => (works = response.data.works))
      .catch((error) => {
        console.log("Some error on /works/all:", error)
      })
    return works
  } catch (e) {
    console.log("Error while fetch works ", e)
  }
}

export const buyWork = async (userId, workId) => {
  try {
    let response = await instance.post(`/work/buy`, null, {
      params: {id: userId, workId: workId}
    })
    return response.status
  } catch (e) {
    console.log("Error while fetch works ", e)
  }
}

export const switchWork = async (userId, workId) => {
  try {
    let response = await instance.post(`/work/switch`, null, {
      params: {id: userId, workId: workId}
    })
    return response.status
  } catch (e) {
    console.log("Error while fetch works ", e)
  }
}
