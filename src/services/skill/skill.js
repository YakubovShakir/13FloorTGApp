import { instance } from "../instance"

export const getSkills = async () => {
  try {
    let skills
    await instance
      .get(`/skill/getAll`)
      .then((response) => (skills = response.data.skills))
      .catch((error) => {
        console.log("Some error on /skills/all:", error)
      })
    return skills
  } catch (e) {
    console.log("Error while fetch skills ", e)
  }
}


export const getUserSkills = async (userId) => {
  try {
    let skills
    await instance
      .get(`/skill/user/${userId}`)
      .then((response) => (skills = response.data.skills))
      .catch((error) => {
        console.log("Some error on getUserSkills:", error)
      })
    return skills
  } catch (e) {
    console.log("Error while fetch skills ", e)
  }
}

export const getUserConstantEffects = async (userId) => {
  try {
    let skills
    await instance
      .get(`/skill/user/${userId}/constant-effects`)
      .then((response) => {
        skills = response.data.constant_effects
        console.log(skills)
      })
      .catch((error) => {
        console.log("Some error on getUserSkills:", error)
      })
    return skills
  } catch (e) {
    console.log("Error while fetch constant effects ", e)
  }
}