import React from "react";
import Grid from "@mui/material/Grid";
import { Paper, Typography } from "@mui/material";
import { ListContainer } from "./styles";

interface User {
  avatar: string;
  name: string;
  handle: string;
  value?: string;
  date: Date;
}

interface UserListProps {
  users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  const redirectToGithub = (handle: string) => {
    const githubUrl = `https://github.com/${handle}`;
    window.open(githubUrl, "_blank");
  };

  return (
    <ListContainer>
      {users.map((user, index) => (
        <Grid item xs={12} key={index}>
          <Paper
            elevation={0}
            style={{ padding: "16px", display: "flex", alignItems: "center" }}
          >
            <img
              src={user.avatar}
              alt="User Avatar"
              style={{
                height: "40px",
                borderRadius: "16px",
                marginRight: "16px",
              }}
            />
            <div
              style={{ flexGrow: 1, cursor: "pointer" }}
              onClick={() => redirectToGithub(user.handle)}
            >
              <Typography>{user.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                @{user.handle}
              </Typography>
            </div>
            {user.value ? (
              <Typography variant="body1">{user.value}</Typography>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography variant="body1">
                  {user.date.toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  às {user.date.toLocaleTimeString()}
                </Typography>
              </div>
            )}
          </Paper>
        </Grid>
      ))}
    </ListContainer>
  );
};

export default UserList;
