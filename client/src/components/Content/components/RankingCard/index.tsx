import React from "react";
import { Container } from "./styles";
import UserList from "./components/UserList";

interface User {
  avatar: string;
  name: string;
  handle: string;
  value: string;
}

interface RankingCardProps {
  title: string;
  users: User[];
}

const RankingCard: React.FC<RankingCardProps> = ({ title, users }) => {
  return (
    <Container>
      <h2>{title}</h2>
      <UserList users={users} />
    </Container>
  );
};

export default RankingCard;
