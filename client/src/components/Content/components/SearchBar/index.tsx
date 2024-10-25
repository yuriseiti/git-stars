import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import SearchIcon from "@material-ui/icons/Search";
import { Container } from "./styles";
import { InputAdornment } from "@material-ui/core";
import {
  ActorFragment,
  BaseFragmentFactory,
  Fragment,
  GithubService,
  GithubClient,
} from "@gittrends-app/core";
import { useRepoContext } from "../../../../contexts/repoContext";
import { Class } from "type-fest";

class CustomFactory extends BaseFragmentFactory {
  create<T extends Fragment>(Ref: Class<T>): T {
    if (Ref.name == ActorFragment.name) {
      return new ActorFragment(Ref.name, {
        factory: this,
        fields: {
          starred_at: true,
          avatar_url: true,
          name: true,
          login: true,
          followers_count: true,
        },
      }) as unknown as T;
    }
    return super.create(Ref);
  }
}

const SearchBar: React.FC = () => {
  const { setRepoInfo, setStargazersInfo, setIsLoading, setStep } =
    useRepoContext();

  const [inputValue, setInputValue] = useState("");

  const handleSearch = async () => {
    setStep(1);
    setRepoInfo(null);
    setStargazersInfo(null);
    setIsLoading("repo");
    const [owner, repo] = inputValue.split("/");

    const accessToken = localStorage.getItem("accessToken");

    const service = new GithubService(
      new GithubClient("https://api.github.com", { apiToken: accessToken! })
    );

    const repoInfo = await service.repository(owner, repo);

    setRepoInfo(repoInfo);
    setIsLoading("stargazers");

    let stargazersInfo: Array<{
      starred_at: Date;
      avatar_url: string;
      name: string | undefined;
      login: string;
      followers_count: number | undefined;
    }> = [];

    for await (const res of service.stargazers({
      repository: repoInfo!.id,
      factory: new CustomFactory(),
    })) {
      setStep((prev: number) => prev + 1);
      const newStargazers = res.data.map((stargazer) => ({
        starred_at: stargazer.starred_at,
        avatar_url: typeof stargazer.user === "string" ? "" : stargazer.user.avatar_url,
        name: typeof stargazer.user === "string" || !('name' in stargazer.user) ? "" : stargazer.user.name,
        login: typeof stargazer.user === "string" ? "" : stargazer.user.login,
        followers_count: typeof stargazer.user === "string" || !('followers_count' in stargazer.user) ? 0 : stargazer.user.followers_count,
      }));
  
      stargazersInfo = [...stargazersInfo, ...newStargazers];
      setStargazersInfo(stargazersInfo);
      
      if (!res.metadata.has_more) {
        setIsLoading(false);
        break;
      }
    }
  };

  return (
    <Container>
      <TextField
        style={{ width: "100%" }}
        variant="outlined"
        placeholder="Buscar por um repositório"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <Button
        style={{ width: "170px", height: "56px" }}
        variant="contained"
        color="primary"
        onClick={handleSearch}
      >
        BUSCAR
      </Button>
    </Container>
  );
};

export default SearchBar;
