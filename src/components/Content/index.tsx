import React from "react";
import { Container } from "./styles";
import InfoCard from "./components/InfoCard";
import RankingCard from "./components/RankingCard";
import SearchBar from "./components/SearchBar";

const Content: React.FC = () => {
  return (
    <Container>
      <div style={{ display: "flex", justifyContent: "center", gap: "16px", width: "100%" }}>
        <SearchBar />
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
        <InfoCard icon="🦄" value="42" label="Unicorn" />
        <InfoCard icon="🚀" value="42" label="Rocket" />
        <InfoCard icon="🌈" value="42" label="Rainbow" />
        <InfoCard icon="🍕" value="42" label="Pizza" />
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
        <RankingCard
          title="Top 5 Users"
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
          title="Top 5 Users"
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
          title="Top 5 Users"
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
