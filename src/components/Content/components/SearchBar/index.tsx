import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import SearchIcon from "@material-ui/icons/Search";
import { Container } from "./styles";
import { InputAdornment } from "@material-ui/core";
import { GithubService, GithubClient } from "@gittrends-app/core";
import { useRepoContext } from "../../../../contexts/repoContext";

const SearchBar: React.FC = () => {
  const { setRepoInfo } = useRepoContext();

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

    for await (const res of service.resource("stargazers", {
      respository: repoInfo!.id,
    })) {
      console.log(res);

      if (!res.metadata.has_more) {
        break;
      }
    }

    localStorage.setItem("repoInfo", JSON.stringify(repoInfo));
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
