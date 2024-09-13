import React from "react";
import { Container, UserContainer } from "./styles";

interface User {
  avatar: string;
  name: string;
  handle: string;
}

interface OwnerCardProps {
  user: User;
}

const OwnerCard: React.FC<OwnerCardProps> = ({ user }) => {
  return (
    <Container>
      <div className="owner-card-icon">Onwer</div>
      <UserContainer>
        <div className="column">
          <img src={user.avatar} alt="User Avatar" />
        </div>
        <div className="column">
          <div>{user.name}</div>
          <div>{user.handle}</div>
        </div>
      </UserContainer>
    </Container>
  );
};

export default OwnerCard;
