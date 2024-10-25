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

import LineChart from "./components/LineChart";
import { useRepoContext } from "../../contexts/repoContext";
import { CircularProgress } from "@material-ui/core";

const Content: React.FC = () => {
  const { accessToken, repoInfo, stargazersInfo, isLoading, step } =
    useRepoContext();

  const sortedUsers = stargazersInfo
    ? stargazersInfo.sort((a: User, b: User) => {
        return (
          new Date(a.starred_at).getTime() - new Date(b.starred_at).getTime()
        );
      })
    : [];

  interface User {
    avatar_url: string;
    name: string;
    login: string;
    starred_at: string;
    followers_count: number;
  }

  const firstStargazers = sortedUsers.slice(0, 5).map((user: User) => ({
    avatar: user.avatar_url,
    name: user.name,
    handle: user.login,
    value: format(new Date(user.starred_at), "dd/MM/yyyy"),
  }));

  const lastStargazers = sortedUsers.slice(-5).map((user: User) => ({
    avatar: user.avatar_url,
    name: user.name,
    handle: user.login,
    value: format(new Date(user.starred_at), "dd/MM/yyyy"),
  }));

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat("pt-BR").format(number);
  };

  const mostFollowers = sortedUsers
    .sort((a: User, b: User) => b.followers_count - a.followers_count)
    .slice(0, 5)
    .map((user: User) => ({
      avatar: user.avatar_url,
      name: user.name,
      handle: user.login,
      value: formatNumber(user.followers_count),
    }));

  const repoStars = repoInfo?.stargazers_count ?? 0;
  const repoFollowers = repoInfo?.watchers_count ?? 0;
  const repoUpdatedAt = repoInfo?.updated_at
    ? format(new Date(repoInfo.updated_at), "dd/MM/yyyy")
    : "N/A";

  const repoOwner = {
    avatar: repoInfo?.owner?.avatar_url,
    name: repoInfo?.owner?.name,
    handle: repoInfo?.owner?.login,
  };

  return (
    <Container>
      {accessToken ? (
        <>
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

          {isLoading && (
            <>
              <CircularProgress />
              <p style={{ textAlign: "center" }}>
                {isLoading === "repo"
                  ? "Buscando informações do repositório..."
                  : `Buscando informações dos stargazers... (${step}/${
                      Math.ceil(repoInfo.stargazers_count / 100) || 1
                    })`}
              </p>
            </>
          )}

          {repoInfo && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
              }}
            >
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
          )}

          {stargazersInfo && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                  gap: "16px",
                }}
              >
                <LineChart data={stargazersInfo} />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "16px",
                }}
              >
                <RankingCard
                  title="Primeiras estrelas"
                  users={firstStargazers}
                />
                <RankingCard title="Últimas estrelas" users={lastStargazers} />
                <RankingCard title="Mais seguidores" users={mostFollowers} />
              </div>
            </>
          )}
        </>
      ) : (
        <p style={{ textAlign: "center" }}>
          Faça login para poder buscar as informações do repositório
        </p>
      )}
    </Container>
  );
};

export default Content;
