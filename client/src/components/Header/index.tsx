import React, { useEffect, useState } from "react";
import { HeaderContainer } from "./styles";
import GitStars from "../../assets/git-stars-high-resolution-logo-transparent.svg";
import { useRepoContext } from "../../contexts/repoContext";
import {
  Menu,
  MenuItem,
  Avatar,
  IconButton,
  Typography,
  Box,
  Divider,
  Button,
} from "@mui/material";
import { Logout } from "@mui/icons-material";

const env = import.meta.env.VITE_ENV;

const baseURL =
  env === "DEV"
    ? "http://localhost:3000"
    : "https://git-stars-seven.vercel.app";

const clientId =
  env === "DEV" ? "Ov23lihCnVHMxraVFbqf" : "Ov23liOrxnWhz5RHF0ML";

const redirectUri =
  env === "DEV"
    ? "http://localhost:5173/"
    : "https://git-stars-project.vercel.app/";

const Header: React.FC = () => {
  const { accessToken, setAccessToken } = useRepoContext();
  const [userData, setUserData] = useState<any | null>(
    JSON.parse(localStorage.getItem("userData") || "null")
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogin = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=public_repo,read:user,read:org,admin:enterprise`;
    window.location.href = githubAuthUrl;
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    setAccessToken(null);
    setUserData(null);
    handleClose();
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      const path =
        location.pathname +
        location.search
          .replace(/\b(code|state)=\w+/g, "")
          .replace(/[?&]+$/, "");
      history.replaceState({}, "", path);
      fetchAccessToken(code);
    }
  }, []);

  const getUserData = async (accessToken: string) => {
    const response = await fetch(`${baseURL}/getUserData`, {
      method: "get",
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    return await response.json();
  };

  const fetchAccessToken = async (code: string) => {
    const response = await fetch(`${baseURL}/getAccessToken?code=${code}`, {
      method: "get",
    });

    const data = await response.json();
    const accessToken = data.token;

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      setAccessToken(accessToken);

      const userData = await getUserData(accessToken);
      localStorage.setItem("userData", JSON.stringify(userData));
      setUserData(userData);
    }
  };

  return (
    <HeaderContainer>
      <img
        src={GitStars}
        alt="GitStars"
        style={{ height: "24px", cursor: "pointer" }}
        onClick={() => window.location.reload()}
      />
      {!accessToken ? (
        <Button
          variant="contained"
          color="warning"
          onClick={handleLogin}
          sx={{ height: 40 }}
        >
          Logar com GitHub
        </Button>
      ) : (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Box style={{ marginRight: "12px" }}>
            <IconButton onClick={handleClick}>
              <Avatar
                src={userData?.avatar_url}
                alt={userData?.name || "User avatar"}
                sx={{ width: 40, height: 40 }}
              />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              disableScrollLock
            >
              <Box sx={{ px: 10, py: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {userData?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  @{userData?.login}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ ml: 2, mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </div>
      )}
    </HeaderContainer>
  );
};

export default Header;
