import "./SocialsScreen.css";
import Screen from "../../components/section/Screen/Screen";
import HomeHeader from "../../components/complex/HomeHeader/HomeHeader";
import ScreenTabs from "../../components/section/ScreenTabs/ScreenTabs";
import ScreenBody from "../../components/section/ScreenBody/ScreenBodyFood";
import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../../UserContext";
import useTelegram from "../../hooks/useTelegram";
import TaskTab from "./tabs/TaskTab";
import LeaderboardTab from "./tabs/LeaderboardTab";
import { useSettingsProvider } from "../../hooks";

const translations = {
  tasks: {
    ru: "Задания",
    en: "Tasks",
  },
  leaderboard: {
    ru: "Рейтинг",
    en: "Leaderboard",
  },
};

const TaskScreen = () => {
  const { userParameters, setUserParameters, userId } = useContext(UserContext);
  const navigate = useNavigate();
  const { lang } = useSettingsProvider();

  const [activeTab, setActiveTab] = useState("task");

  const tabs = [
    {
      label: translations.tasks[lang],
      type: "task",
      callback: () => setActiveTab("task"),
    },
    {
      label: translations.leaderboard[lang],
      type: "leaderboard",
      callback: () => setActiveTab("leaderboard"),
    },
  ];

  useEffect(() => {
    useTelegram.setBackButton(() => navigate("/"));
  }, []);

  return (
    <Screen>
      <HomeHeader screenHeader />
     
      <ScreenBody activity={translations.tasks[lang]}>
      <ScreenTabs tabs={tabs} initialTab={tabs.findIndex(tab => tab.type === activeTab)} />
        {activeTab === "task" && (
          <TaskTab userId={userId} userParameters={userParameters} setUserParameters={setUserParameters} />
        )}
        {activeTab === "leaderboard" && <LeaderboardTab userId={userId} userParameters={userParameters} setUserParameters={setUserParameters} />}
      </ScreenBody>
    </Screen>
  );
};

export default TaskScreen;
