const translations = {
  anonUser: {
    en: "Anonymous player",
    ru: "Анонимный игрок",
  },
}

export const formUsername = (leader, lang) => {
  console.log(leader)
  const { first_name = "", last_name = "" } = leader

  const formattedName = (first_name + " " + last_name).trimStart().trimEnd()

  return formattedName === "" ? translations.anonUser[lang] : formattedName
}
