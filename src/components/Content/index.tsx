import React from "react";
import { Container } from "./styles";
import InfoCard from "./components/InfoCard";
import RankingCard from "./components/RankingCard";
import SearchBar from "./components/SearchBar";
import OwnerCard from "./components/OwnerCard";

import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import UpdateRoundedIcon from '@mui/icons-material/UpdateRounded';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';

const Content: React.FC = () => {
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
          users={[
            {
              avatar: "🦄",
              name: "João da silva",
              handle: "@joãodasilva123",
              value: "2043",
            },
          ]}
        />
        <RankingCard
          title="Últimas estrelas"
          users={[
            {
              avatar: "🦄",
              name: "João da silva",
              handle: "@joãodasilva123",
              value: "2043",
            },
            {
              avatar: "🦄",
              name: "João da silva",
              handle: "@joãodasilva123",
              value: "2043",
            },
            {
              avatar: "🦄",
              name: "João da silva",
              handle: "@joãodasilva123",
              value: "2043",
            },
            {
              avatar: "🦄",
              name: "João da silva",
              handle: "@joãodasilva123",
              value: "2043",
            },
            {
              avatar: "🦄",
              name: "João da silva",
              handle: "@joãodasilva123",
              value: "2043",
            },
          ]}
        />
        <RankingCard
          title="Mais seguidores"
          users={[
            {
              avatar: "🦄",
              name: "João da silva",
              handle: "@joãodasilva123",
              value: "2043",
            },
          ]}
        />
      </div>
    </Container>
  );
};

export default Content;
