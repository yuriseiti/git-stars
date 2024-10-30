import React, { useState } from "react";
import { Container, FlexDiv } from "./styles";
import InfoCard from "./components/InfoCard";
import RankingCard from "./components/RankingCard";
import SearchBar from "./components/SearchBar";
import OwnerCard from "./components/OwnerCard";

import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import UpdateRoundedIcon from "@mui/icons-material/UpdateRounded";
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";

import LineChart from "./components/LineChart";
import { useRepoContext } from "../../contexts/repoContext";
import { CircularProgress, Button } from "@material-ui/core";

const Content: React.FC = () => {
  const { accessToken, repoInfo, stargazersInfo, isLoading, step } =
    useRepoContext();
  const [visibleCount, setVisibleCount] = useState(5);

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

  const firstStargazers = sortedUsers
    .slice(0, visibleCount)
    .map((user: User) => ({
      avatar: user.avatar_url,
      name: user.name,
      handle: user.login,
      date: new Date(user.starred_at),
    }));

  const lastStargazers = sortedUsers
    .sort(
      (a: User, b: User) =>
        new Date(b.starred_at).getTime() - new Date(a.starred_at).getTime()
    )
    .slice(0, visibleCount)
    .map((user: User) => ({
      avatar: user.avatar_url,
      name: user.name,
      handle: user.login,
      date: new Date(user.starred_at),
    }));

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat("pt-BR").format(number);
  };

  const mostFollowers = sortedUsers
    .sort((a: User, b: User) => b.followers_count - a.followers_count)
    .slice(0, visibleCount)
    .map((user: User) => ({
      avatar: user.avatar_url,
      name: user.name,
      handle: user.login,
      value: formatNumber(user.followers_count),
    }));

  const repoStars = repoInfo?.stargazers_count ?? 0;
  const repoFollowers = repoInfo?.watchers_count ?? 0;

  const repoOwner = {
    avatar: repoInfo?.owner?.avatar_url,
    name: repoInfo?.owner?.name,
    handle: repoInfo?.owner?.login,
  };

  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 5);
  };

  return (
    <Container>
      {accessToken ? (
        <>
          <FlexDiv
            style={{
              width: "60vw",
              padding: "0 22px",
            }}
          >
            <SearchBar />
          </FlexDiv>

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
            <FlexDiv>
              <OwnerCard user={repoOwner} />
              <InfoCard
                icon={<StarBorderRoundedIcon />}
                value={repoStars.toLocaleString()}
                label="Estrelas"
              />
              <InfoCard
                icon={<PeopleOutlineRoundedIcon />}
                value={repoFollowers.toLocaleString()}
                label="Seguidores"
              />
              <InfoCard
                icon={<UpdateRoundedIcon />}
                date={new Date(repoInfo.updated_at)}
                label="Atualizado em"
              />
            </FlexDiv>
          )}

          {stargazersInfo && (
            <>
              <FlexDiv style={{ width: "100%" }}>
                <LineChart data={stargazersInfo} />
              </FlexDiv>
              <FlexDiv>
                <RankingCard
                  title="Primeiras estrelas"
                  users={firstStargazers}
                />
                <RankingCard title="Últimas estrelas" users={lastStargazers} />
                <RankingCard title="Mais seguidores" users={mostFollowers} />
              </FlexDiv>
              <FlexDiv>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleShowMore}
                  disabled={visibleCount >= sortedUsers.length}
                >
                  Mostrar mais
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setVisibleCount(5)}
                  disabled={visibleCount === 5}
                >
                  Mostrar menos
                </Button>
              </FlexDiv>
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
