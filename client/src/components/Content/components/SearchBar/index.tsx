import React, { useRef, useState } from "react";
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
  NodeStorage,
  StorageFactory,
  StorageService,
  Repository,
  Storage,
  Stargazer,
} from "@gittrends-app/core";
import { useRepoContext } from "../../../../contexts/repoContext";
import { Class } from "type-fest";
// import PouchDB from "pouchdb";

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
class LocalStorageFactory implements StorageFactory {
  private repositoryStorage: NodeStorage<Repository>;
  private storageMap: Map<string, Map<string, any>>;

  constructor() {
    this.storageMap = new Map();
    this.repositoryStorage = this.create("Repository");
  }

  create(typename: "Repository"): NodeStorage<Repository>;
  create(typename: "Stargazers"): Storage<Stargazer>;
  create<T extends Node>(typename: string): NodeStorage<T>;
  create<T = any>(typename: string): Storage<any> {
    if (!this.storageMap.has(typename)) {
      this.storageMap.set(typename, new Map());
    }

    const typeMap = this.storageMap.get(typename)!;
    console.log(Array.from(typeMap.keys()));

    return {
      async get(query: Partial<any>): Promise<T | null> {
        const key = query.id;
        return typeMap.get(key) || null;
      },
      async find(query: Partial<any>): Promise<T[]> {
        return [];
      },
      async save(data: any): Promise<void> {
        const key = data.name_with_owner;
        await typeMap.set(key, data);
      },
      async count(query: Partial<any>): Promise<number> {
        return 42;
      },
    };
  }
}

const SearchBar: React.FC = () => {
  const { setRepoInfo, setStargazersInfo, setIsLoading, setStep } =
    useRepoContext();

  const [inputValue, setInputValue] = useState("jellyfin/jellyfin-kodi");
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState<string | boolean>(false);

  const isPausedRef = useRef(false);
  const inputChangedRef = useRef(true);

  const handleSearch = async () => {
    if (!validateInput(inputValue)) return;

    setIsError(false);

    if (!shouldProceed()) return;

    resetState();
    const [owner, repo] = inputValue.split("/");
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setIsError("Access token is missing");
      setIsLoading(false);
      return;
    }
    const service = createGithubService(accessToken);

    try {
      const repoInfo = await fetchRepoInfo(service, owner, repo);
      setRepoInfo(repoInfo);
      if (repoInfo) {
        await fetchStargazers(service, repoInfo.id);
      } else {
        setIsLoading(false);
        setIsError("Repositório não encontrado");
        isPausedRef.current = false;
        inputChangedRef.current = true;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  const validateInput = (input: string) => {
    if (!input) {
      setIsError("Campo obrigatório");
      return false;
    }

    if (input.split("/").length !== 2) {
      setIsError("Formato inválido. Utilize owner/repo");
      return false;
    }

    return true;
  };

  const shouldProceed = () => {
    if (!inputChangedRef.current && !isFetching) return false;

    if (!inputChangedRef.current && isFetching) {
      isPausedRef.current = !isPausedRef.current;
      return false;
    }

    return true;
  };

  const resetState = () => {
    inputChangedRef.current = false;
    setStep(1);
    setRepoInfo(null);
    setStargazersInfo(null);
    setIsLoading("repo");
  };

  const createGithubService = (accessToken: string) => {
    const localStorageFactory = new LocalStorageFactory();
    return new StorageService(
      new GithubService(
        new GithubClient("https://api.github.com", { apiToken: accessToken }),
        { factory: new CustomFactory() }
      ),
      localStorageFactory
    );
  };

  const fetchRepoInfo = async (
    service: GithubService,
    owner: string,
    repo: string
  ) => {
    return await service.repository(owner, repo);
  };

  const fetchStargazers = async (service: GithubService, repoId: string) => {
    setIsLoading("stargazers");
    setIsFetching(true);
    isPausedRef.current = false;

    let stargazersInfo: Array<{
      starred_at: Date;
      avatar_url: string;
      name: string | undefined;
      login: string;
      followers_count: number | undefined;
    }> = [];

    for await (const res of service.stargazers({
      repository: repoId,
      factory: new CustomFactory(),
    })) {
      setStep((prev) => prev + 1);
      stargazersInfo = [...stargazersInfo, ...processStargazers(res.data)];
      setStargazersInfo(stargazersInfo);

      await handlePause();

      if (inputChangedRef.current) {
        setIsLoading(false);
        break;
      }

      if (!res.metadata.has_more) {
        finalizeFetching();
        break;
      }
    }
  };

  const processStargazers = (
    data: Array<{
      starred_at: Date;
      user:
        | string
        | {
            avatar_url: string;
            name?: string;
            login: string;
            followers_count?: number;
          };
    }>
  ) => {
    return data.map((stargazer) => {
      const user = typeof stargazer.user === "string" ? null : stargazer.user;
      return {
        starred_at: stargazer.starred_at,
        avatar_url: user?.avatar_url ?? "",
        name: user?.name ?? "",
        login: user?.login ?? "",
        followers_count: user?.followers_count ?? 0,
      };
    });
  };

  const handlePause = async () => {
    while (isPausedRef.current) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  };

  const finalizeFetching = () => {
    setIsLoading(false);
    setIsFetching(false);
    isPausedRef.current = false;
    inputChangedRef.current = true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    inputChangedRef.current = true;
  };

  return (
    <Container>
      <TextField
        style={{ width: "100%" }}
        variant="outlined"
        placeholder="Buscar por um repositório"
        value={inputValue}
        error={isError ? true : false}
        helperText={isError}
        onChange={handleInputChange}
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
        {inputChangedRef.current
          ? "Buscar"
          : isPausedRef.current
          ? "Continuar"
          : "Pausar"}
      </Button>
    </Container>
  );
};

export default SearchBar;
