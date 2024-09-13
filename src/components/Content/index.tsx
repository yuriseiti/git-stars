import React from "react";
import { Container } from "./styles";
import InfoCard from "./components/InfoCard";
import RankingCard from "./components/RankingCard";
import SearchBar from "./components/SearchBar";
import OwnerCard from "./components/OwnerCard";

import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import UpdateRoundedIcon from '@mui/icons-material/UpdateRounded';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';

import { format } from "date-fns";

import usersMock from "../../mocks/django@django.Stargazer.100.json";
import repositoryMock from "../../mocks/django@django.Repository.json";

const Content: React.FC = () => {
  // get the 5 first stargazers from the mock, sort by starred_at, which is a Date object
  const firstStargazers = usersMock.slice(0, 5).sort((a, b) => {
    return new Date(a.starred_at?.$date).getTime() - new Date(b.starred_at?.$date).getTime();
  }).map(user => {
    return {
      avatar: user.user?.avatar_url,
      name: user.user?.name,
      handle: user.user?.login,
      value: format(new Date(user.starred_at?.$date), "dd/MM/yyyy"),
    }
  });

  // get the 5 last stargazers from the mock, sort by starred_at, which is a Date object
  const lastStargazers = usersMock.slice(-5).sort((a, b) => {
    return new Date(a.starred_at?.$date).getTime() - new Date(b.starred_at?.$date).getTime();
  }).map(user => {
    return {
      avatar: user.user?.avatar_url,
      name: user.user?.name,
      handle: user.user?.login,
      value: format(new Date(user.starred_at?.$date), "dd/MM/yyyy"),
    }
  });

  // get the 5 users with most followers from the mock, sort by user.followers_count
  const mostFollowers = usersMock.sort((a, b) => {
    return b.user?.followers_count - a.user?.followers_count;
  }).slice(0, 5).map(user => {
    return {
      avatar: user.user?.avatar_url,
      name: user.user?.name,
      handle: user.user?.login,
      value: user.user?.followers_count,
    }
  });  

  return (
    <Container>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "16px",
          width: "60vw",
          padding: "0 22px"
        }}
      >
        <SearchBar />
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
        <InfoCard icon={<StarBorderRoundedIcon />} value="42" label="Estrelas" />
        <InfoCard icon={<PeopleOutlineRoundedIcon />} value="42" label="Seguidores" />
        <InfoCard icon={<UpdateRoundedIcon />} value="42" label="Atualizado em" />
        <OwnerCard user={ { avatar: "null", name: "teste", handle: "teste"}} />
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
        <RankingCard
          title="Primeiras estrelas"
          users={firstStargazers}
        />
        <RankingCard
          title="Últimas estrelas"
          users={lastStargazers}
        />
        <RankingCard
          title="Mais seguidores"
          users={mostFollowers}
        />
      </div>
    </Container>
  );
};

export default Content;
