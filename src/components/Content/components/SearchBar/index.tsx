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
  const { setRepoInfo, setStargazersInfo } = useRepoContext();

  const [inputValue, setInputValue] = useState("");

  const handleSearch = async () => {
    const [owner, repo] = inputValue.split(" ");

    const accessToken = localStorage.getItem("accessToken");

    const service = new GithubService(
      new GithubClient("https://api.github.com", { apiToken: accessToken! })
    );

    const repoInfo = await service.repository(owner, repo);

    setRepoInfo(repoInfo);

    let stargazersInfo = [];

    for await (const res of service.stargazers({
      repository: repoInfo!.id,
      factory: new CustomFactory(),
    })) {
      for (const stargazer of res.data) {
        stargazersInfo.push({
          starred_at: stargazer.starred_at,
          avatar_url: stargazer.user.avatar_url,
          name: stargazer.user.name,
          login: stargazer.user.login,
          followers_count: stargazer.user.followers_count,
        });
      }

      if (!res.metadata.has_more) {
        setStargazersInfo(stargazersInfo);
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
