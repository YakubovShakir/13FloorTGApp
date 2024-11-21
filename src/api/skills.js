import { instance } from "./instance"

export const getSkills = async () => {
  try {
    let skills
    await instance
      .get(`/skills/all`)
      .then((response) => (skills = response.data.skills))
      .catch((error) => {
        console.log("Some error on /skills/all:", error)
      })
    return skills
  } catch (e) {
    console.log("Error while fetch skills ", e)
  }
}

export const buySkill = async (userId, skillId) => {
  try {
    let status
    await instance
      .post(`/skills/buy`, null, {
        params: { userId: userId, skillId: skillId },
      })
      .then((response) => console.log(response.status))
      .catch((error) => {
        console.log("Some error on /skills/buy:", error)
      })
    return status === 200 ? true : false
  } catch (error) {
    console.log("api /skills/buy catch error - ", e)
  }
}

export const getUserSkills = async (userId) => {
  try {
    let skills
    await instance
      .get(`/skills/user/${userId}`)
      .then((response) => (skills = response.data.skills))
      .catch((error) => {
        console.log("Some error on getUserSkills:", error)
      })
    return skills
  } catch (e) {
    console.log("Error while fetch skills ", e)
  }
}
