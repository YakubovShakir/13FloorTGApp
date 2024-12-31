
import { useEffect, useState, useContext } from "react";
import HomeHeader from "../../components/complex/HomeHeader/HomeHeader";
import Menu from "../../components/complex/Menu/Menu";
import Assets from "../../assets";
import Screen from "../../components/section/Screen/Screen";
import ScreenContainer from "../../components/section/ScreenContainer/ScreenContainer";
import ScreenBody from "../../components/section/ScreenBody/ScreenBody";
import useTelegram from "../../hooks/useTelegram";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/complex/Modals/Modal/Modal";
import ActivityTab from "./tabs/ActivityTab";
import SkillTab from "./tabs/SkillTab";
import WorkTab from "./tabs/WorkTab";
import UserContext from "../../UserContext";
import { useSettingsProvider } from "../../hooks";

const ActionScreen = () => {
  const [visibleModal, setVisibleModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Import from context userId, userParameters and function to update userParameters
  const { userParameters, setUserParameters, userId } = useContext(UserContext);
  const { lang } = useSettingsProvider()
  const navigate = useNavigate();

  const translations = {
    activities: {
      ru: 'Активности',
      en: 'Activities'
    },
    development: {
      ru: 'Развитие',
      en: 'Development'
    }
  }

  useEffect(() => {
    useTelegram.setBackButton(() => navigate("/"));
  }, []);

  return (
    <Screen>
      <HomeHeader>{translations.development[lang]}</HomeHeader>
      
      <ScreenBody activity={translations.activities[lang]}>
        {visibleModal && (
          <Modal
            onClose={() => setVisibleModal(false)}
            data={modalData}
            bottom={"0"}
            width={"100%"}
            height={"80%"}
          />
        )}

         {/* Контент из вкладок теперь отображается подряд */}
         <ScreenContainer >
          <WorkTab
          modalData={modalData}
          setModalData={setModalData}
          setUserParameters={setUserParameters}
          setVisibleModal={setVisibleModal}
          userParameters={userParameters}
          userId={userId}
         />

         <SkillTab
          modalData={modalData}
          setModalData={setModalData}
          setUserParameters={setUserParameters}
          setVisibleModal={setVisibleModal}
          userParameters={userParameters}
          userId={userId}
          />

          <ActivityTab
          modalData={modalData}
          setModalData={setModalData}
          setUserParameters={setUserParameters}
          setVisibleModal={setVisibleModal}
          userParameters={userParameters}
          userId={userId}
          />
        </ScreenContainer>
      </ScreenBody>
    </Screen>
  );
};

export default ActionScreen;
