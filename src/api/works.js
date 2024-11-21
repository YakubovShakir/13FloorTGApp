import { instance } from "./instance"

export const getWorks = async () => {
  try {
    let works
    await instance
      .get(`/works/all`)
      .then((response) => (works = response.data.works))
      .catch((error) => {
        console.log("Some error on /works/all:", error)
      })
    return works
  } catch (e) {
    console.log("Error while fetch works ", e)
  }
}
