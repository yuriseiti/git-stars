import React, { useEffect } from "react";
import { HeaderContainer } from "./styles";
import GitStars from "../../assets/git-stars-high-resolution-logo-transparent.svg";
import { GithubService, GithubClient } from "@gittrends-app/core";
import { useRepoContext } from "../../contexts/repoContext";

const clientId = "Ov23liOrxnWhz5RHF0ML";
const redirectUri = "http://localhost:5173";

const Header: React.FC = () => {
  const { accessToken, setAccessToken } = useRepoContext();

  const handleLogin = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=public_repo,read:user,read:org
`;
    window.location.href = githubAuthUrl;
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setAccessToken(null);
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
    const response = await fetch("http://localhost:3000/getUserData", {
      method: "get",
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    return await response.json();
  };

  const fetchAccessToken = async (code: string) => {
    const response = await fetch(
      `http://localhost:3000/getAccessToken?code=` + code,
      {
        method: "get",
      }
    );

    const data = await response.json();
    const accessToken = data.token;

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      setAccessToken(accessToken);

      const service = new GithubService(
        new GithubClient("https://api.github.com", { apiToken: accessToken })
      );

      const userInfo = await service.user(accessToken);
      console.log("🚀 ~ fetchAccessToken ~ userInfo:", userInfo);
    }
  };

  return (
    <HeaderContainer>
      <img src={GitStars} alt="GitStars" style={{ height: "24px" }} />
      {!accessToken ? (
        <button onClick={handleLogin}>Log in with GitHub</button>
      ) : (
        <button onClick={handleLogout}>Log out</button>
      )}
    </HeaderContainer>
  );
};

export default Header;
