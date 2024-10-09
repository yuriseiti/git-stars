import React, { useState } from "react";
import { Container } from "./styles";
import InfoCard from "./components/InfoCard";
import RankingCard from "./components/RankingCard";
import SearchBar from "./components/SearchBar";
import OwnerCard from "./components/OwnerCard";

import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import UpdateRoundedIcon from "@mui/icons-material/UpdateRounded";
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";

import { format } from "date-fns";

import LineChart from "./components/LineChart";
import { useRepoContext } from "../../contexts/repoContext";

const Content: React.FC = () => {
  const { repoInfo, stargazersInfo } = useRepoContext();
  console.log("🚀 ~ stargazersInfo:", stargazersInfo)

  const [mode, setMode] = useState<"sum" | "variation">("sum");

  const sortedUsers = stargazersInfo ? stargazersInfo.sort((a, b) => {
    return (
      new Date(a.starred_at).getTime() -
      new Date(b.starred_at).getTime()
    );
  }) : [];

  const firstStargazers = sortedUsers.slice(0, 5).map((user) => ({
    avatar: user.avatar_url,
    name: user.name,
    handle: user.login,
    value: format(new Date(user.starred_at), "dd/MM/yyyy"),
  }));

  const lastStargazers = sortedUsers.slice(-5).map((user) => ({
    avatar: user.avatar_url,
    name: user.name,
    handle: user.login,
    value: format(new Date(user.starred_at), "dd/MM/yyyy"),
  }));

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat("pt-BR").format(number);
  };

  const mostFollowers = sortedUsers
    .sort((a, b) => b.user?.followers_count - a.user?.followers_count)
    .slice(0, 5)
    .map((user) => ({
      avatar: user.user?.avatar_url,
      name: user.user?.name,
      handle: user.user?.login,
      value: formatNumber(user.user?.followers_count),
    }));

  const repoStars = repoInfo?.stargazers_count ?? 0;
  const repoFollowers = repoInfo?.watchers_count ?? 0;
  const repoUpdatedAt = repoInfo?.updated_at
    ? format(new Date(repoInfo.updated_at), "dd/MM/yyyy")
    : "N/A";

  const repoOwner = {
    avatar: repoInfo?.owner?.avatar_url,
    name: repoInfo?.owner?.name,
    handle: repoInfo?.owner?.login,
  };

  const changeMode = () => {
    setMode(mode === "sum" ? "variation" : "sum");
  };

  return (
    <Container>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "16px",
          width: "60vw",
          padding: "0 22px",
        }}
      >
        <SearchBar />
      </div>
      {repoInfo && stargazersInfo && (
        <>
          <div
            style={{ display: "flex", justifyContent: "center", gap: "16px" }}
          >
            <InfoCard
              icon={<StarBorderRoundedIcon />}
              value={repoStars.toString()}
              label="Estrelas"
            />
            <InfoCard
              icon={<PeopleOutlineRoundedIcon />}
              value={repoFollowers.toString()}
              label="Seguidores"
            />
            <InfoCard
              icon={<UpdateRoundedIcon />}
              value={repoUpdatedAt}
              label="Atualizado em"
            />
            <OwnerCard user={repoOwner} />
          </div>
          <div
            style={{ display: "flex", justifyContent: "center", gap: "16px" }}
          >
            <button onClick={changeMode}>Mudar modo</button>
            <LineChart data={stargazersInfo} mode={mode} />
          </div>
          <div
            style={{ display: "flex", justifyContent: "center", gap: "16px" }}
          >
            <RankingCard title="Primeiras estrelas" users={firstStargazers} />
            <RankingCard title="Últimas estrelas" users={lastStargazers} />
            <RankingCard title="Mais seguidores" users={mostFollowers} />
          </div>
        </>
      )}
    </Container>
  );
};

export default Content;
