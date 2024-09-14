import React from "react";
import { Container } from "./styles";
import InfoCard from "./components/InfoCard";
import RankingCard from "./components/RankingCard";
import SearchBar from "./components/SearchBar";
import OwnerCard from "./components/OwnerCard";

import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import UpdateRoundedIcon from "@mui/icons-material/UpdateRounded";
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";

import { format } from "date-fns";

import usersMock from "../../mocks/django@django.Stargazer.100.json";
import repositoryMock from "../../mocks/django@django.Repository.json";
import LineChart from "./components/LineChart";

const Content: React.FC = () => {
  const firstStargazers = usersMock
    .slice(0, 5)
    .sort((a, b) => {
      return (
        new Date(a.starred_at?.$date).getTime() -
        new Date(b.starred_at?.$date).getTime()
      );
    })
    .map((user) => {
      return {
        avatar: user.user?.avatar_url,
        name: user.user?.name,
        handle: user.user?.login,
        value: format(new Date(user.starred_at?.$date), "dd/MM/yyyy"),
      };
    });

  const lastStargazers = usersMock
    .slice(-5)
    .sort((a, b) => {
      return (
        new Date(a.starred_at?.$date).getTime() -
        new Date(b.starred_at?.$date).getTime()
      );
    })
    .map((user) => {
      return {
        avatar: user.user?.avatar_url,
        name: user.user?.name,
        handle: user.user?.login,
        value: format(new Date(user.starred_at?.$date), "dd/MM/yyyy"),
      };
    });

  const mostFollowers = usersMock
    .sort((a, b) => {
      return b.user?.followers_count - a.user?.followers_count;
    })
    .slice(0, 5)
    .map((user) => {
      return {
        avatar: user.user?.avatar_url,
        name: user.user?.name,
        handle: user.user?.login,
        value: user.user?.followers_count,
      };
    });

  const repoStars = repositoryMock[0].stargazers_count;
  const repoFollowers = repositoryMock[0].watchers_count;
  const repoUpdatedAt = format(
    new Date(repositoryMock[0].updated_at.$date),
    "dd/MM/yyyy"
  );
  const repoOwner = {
    avatar:
      "https://avatars.githubusercontent.com/u/12102640?u=9846c91150e82225b23e2e03d1a012bc9782ba9f&v=4",
    name: "Charles-A. Francisco",
    handle: "charlesfranciscodev",
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
      <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
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
      <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
        <LineChart data={usersMock} />
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
        <RankingCard title="Primeiras estrelas" users={firstStargazers} />
        <RankingCard title="Últimas estrelas" users={lastStargazers} />
        <RankingCard title="Mais seguidores" users={mostFollowers} />
      </div>
    </Container>
  );
};

export default Content;
