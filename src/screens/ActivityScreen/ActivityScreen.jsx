import { useEffect, useState, useContext } from "react"
import HomeHeader from "../../components/complex/HomeHeader/HomeHeader"
import Menu from "../../components/complex/Menu/Menu"
import Assets from "../../assets"
import Screen from "../../components/section/Screen/Screen"
import ScreenBody from "../../components/section/ScreenBody/ScreenBody"
import ScreenTabs from "../../components/section/ScreenTabs/ScreenTabs"
import ScreenContainer from "../../components/section/ScreenContainer/ScreenContainer"
import useTelegram from "../../hooks/useTelegram"
import { useNavigate, useParams } from "react-router-dom"
import ItemCard from "../../components/simple/ItemCard/ItemCard"
import skillsTab from "./assets/skillsTab.png"

import { buyWork, getWorks } from "../../services/work/work"
import UserContext from "../../UserContext"
import { getSkills, getUserSkills } from "../../services/skill/skill"
import { getParameters, getTrainingParameters } from "../../services/user/user"
import { getProcesses, startProcess } from "../../services/process/process"
import Modal from "../../components/complex/Modals/Modal/Modal"
import formatTime from "../../utils/formatTime"
import ActivityTab from "./tabs/ActivityTab"
import SkillTab from "./tabs/SkillTab"
import WorkTab from "./tabs/WorkTab"
import { useSettingsProvider } from "../../hooks"
const ActivityScreen = () => {

  const { lang } = useSettingsProvider()

  const translations = {
    career: {
      ru: 'Карьера',
      en: 'Career'
    },
    learning: {
      ru: 'Обучения',
      en: 'Skills'
    },
    development: {
      ru: 'Развитие',
      en: 'Progress'
    }
  }

  // Object with titles for each tab
  const tabTitles = {

    works: translations.career[lang],
    skills: translations.learning[lang],
  };

  // Works and Skills
  const [works, setWorks] = useState(null);

  // Modal showed on button click
  const [visibleModal, setVisibleModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Import from context userId, userParameters and function to update userParameters
  const { userParameters, setUserParameters, userId } = useContext(UserContext);

  const navigate = useNavigate();

  const { Icons } = Assets;

  const { type } = useParams()

  const tabs = [
    { icon: Icons.workTabIcon, label: tabTitles.works, callback: () => setActiveTab("works"), type: "works" },
    { icon: Icons.skillTabIcon, label: tabTitles.skills, callback: () => setActiveTab("skills"), type: "skills" },
  ];

  const [activeTab, setActiveTab] = useState(type || 'works');
  const [initialTabIndex] = useState(tabs.findIndex(tab => tab.type === type))

  useEffect(() => {
    useTelegram.setBackButton(() => navigate("/"));
  }, []);

  return (
    <Screen>
      {/* Название вкладки передаем в HomeHeader */}
      <HomeHeader>{tabTitles[activeTab]}</HomeHeader>


      <ScreenBody activity={translations.development[lang]}>


        {visibleModal && (
          <Modal
            onClose={() => setVisibleModal(false)}
            data={modalData}
            bottom={"0"}
            width={"100%"}
            height={"80%"}
          />
        )}
        <ScreenTabs tabs={tabs} initialTab={initialTabIndex} />

        {/* Контент для вкладки "Активности" */}
        {activeTab === "activities" && (
          <ActivityTab
            modalData={modalData}
            setModalData={setModalData}
            setUserParameters={setUserParameters}
            setVisibleModal={setVisibleModal}
            userParameters={userParameters}
            userId={userId}
          />
        )}

        {/* Works Data */}
        {activeTab === "works" && (
          <WorkTab
            modalData={modalData}
            setModalData={setModalData}
            setUserParameters={setUserParameters}
            setVisibleModal={setVisibleModal}
            userParameters={userParameters}
            userId={userId}
          />
        )}
        {/* Skills Data */}
        {activeTab === "skills" && (
          <SkillTab
            modalData={modalData}
            setModalData={setModalData}
            setUserParameters={setUserParameters}
            setVisibleModal={setVisibleModal}
            userParameters={userParameters}
            userId={userId}
          />
        )}
        {/* Store Data */}
      </ScreenBody>
    </Screen>
  );
};


export default ActivityScreen
