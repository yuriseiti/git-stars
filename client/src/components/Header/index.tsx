import React, { useEffect } from "react";
import { HeaderContainer } from "./styles";
import GitStars from "../../assets/git-stars-high-resolution-logo-transparent.svg";
import { useRepoContext } from "../../contexts/repoContext";

const env = import.meta.env.VITE_ENV;

const baseURL = env === "DEV" ? "http://localhost:3000" : "https://git-stars-seven.vercel.app";

const clientId =
  env === "DEV" ? "Ov23lihCnVHMxraVFbqf" : "Ov23liOrxnWhz5RHF0ML";

const redirectUri =
  env === "DEV"
    ? "http://localhost:5173/"
    : "https://git-stars-3cyc.vercel.app/";

const Header: React.FC = () => {
  const { accessToken, setAccessToken } = useRepoContext();

  const handleLogin = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=public_repo,read:user,read:org,admin:enterprise
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
    const response = await fetch(
      `${baseURL}/getUserData`,
      {
        method: "get",
        headers: {
          Authorization: `token ${accessToken}`,
        },
      }
    );

    return await response.json();
  };

  const fetchAccessToken = async (code: string) => {
    const response = await fetch(
      `${baseURL}/getAccessToken?code=${code}`,
      {
        method: "get",
      }
    );

    const data = await response.json();
    const accessToken = data.token;

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      setAccessToken(accessToken);

      // const userData = await fetch("https://api.github.com/user", {
      //   method: "GET",
      //   headers: {
      //     Authorization: `token ${accessToken}`,
      //   },
      // });

      const userData = await getUserData(accessToken);
      console.log("🚀 ~ fetchAccessToken ~ userData:", userData);
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
