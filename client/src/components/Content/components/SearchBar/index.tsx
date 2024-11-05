import React, { useRef, useState, useEffect } from "react";
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
  Metadata,
} from "@gittrends-app/core";
import { useRepoContext } from "../../../../contexts/repoContext";
import { Class } from "type-fest";

import PouchDB from "pouchdb";
import PouchDBFind from "pouchdb-find";

PouchDB.plugin(PouchDBFind);

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
  private repositoryDB: PouchDB.Database;
  private stargazerDB: PouchDB.Database;
  private metadataDB: PouchDB.Database;

  constructor(
    repositoryDB: PouchDB.Database,
    stargazerDB: PouchDB.Database,
    metadataDB: PouchDB.Database
  ) {
    this.repositoryDB = repositoryDB;
    this.stargazerDB = stargazerDB;
    this.metadataDB = metadataDB;
  }

  create(typename: "Metadata"): NodeStorage<Metadata>;
  create(typename: "Repository"): NodeStorage<Repository>;
  create(typename: "Stargazer"): Storage<Stargazer>;
  create<T extends { id: string; __typename: string }>(
    typename: string
  ): NodeStorage<T>;
  create<T = any>(typename: string): Storage<any> {
    const repositoryDB = this.repositoryDB;
    const stargazerDB = this.stargazerDB;
    const metadataDB = this.metadataDB;

    return {
      async get(query: Partial<any>): Promise<T | null> {
        try {
          const data = await repositoryDB.get(query.id);
          return data as T;
        } catch (error) {
          return null;
        }
      },

      async find(
        query: Partial<any>,
        // opts?: { limit: number; offset?: number }
      ): Promise<T[]> {
        switch (typename) {
          case "Stargazer":
            try {
              const stargazersData = await stargazerDB.find({
                selector: { _id: query.repository },
              });
              const stargazersDoc = stargazersData.docs[0] as PouchDB.Core.ExistingDocument<{ data: T[] }>;
              return stargazersDoc.data;
            } catch (error) {
              return [];
            }
          case "Metadata":
            try {
              // debugger;
              const metadata = await metadataDB.find({
                selector: { _id: query.id },
              });
              return metadata.docs as unknown as T[];
            } catch (error) {
              return [];
            }
          default:
            return [];
        }
      },

      async save(data: any): Promise<void> {
        const saveWithConflictHandling = async (
          db: PouchDB.Database,
          id: string,
          saveData: any
        ) => {
          try {
            delete saveData.__typename;
            // Try to get existing document
            let existingDoc;
            try {
              existingDoc = await db.get(id);
              // Update existing document
              await db.put({
                ...saveData,
                _id: id,
                _rev: existingDoc._rev,
              });
            } catch (error: any) {
              if (error.name === "not_found") {
                // Document doesn't exist yet, create new one
                await db.put({
                  _id: id,
                  ...saveData,
                });
              } else if (error.name === "conflict") {
                // Handle conflict by getting latest version and retrying
                const latest = await db.get(id);
                await db.put({
                  ...saveData,
                  _id: id,
                  _rev: latest._rev,
                });
              } else {
                throw error;
              }
            }
          } catch (error) {
            console.error(`Error saving ${typename}:`, error);
            throw error;
          }
        };

        const saveStargazersArrayWithConflictHandling = async (
          db: PouchDB.Database,
          id: string,
          saveData: any[]
        ) => {
          try {
            // Try to get existing document
            let existingDoc;
            try {
              existingDoc = await db.get(id);
              // Update existing document
              await db.put({
                data: [...(existingDoc as any).data, ...saveData],
                _id: id,
                _rev: existingDoc._rev,
              });
            } catch (error: any) {
              if (error.name === "not_found") {
                // Document doesn't exist yet, create new one
                await db.put({
                  _id: id,
                  data: [...saveData],
                });
              } else if (error.name === "conflict") {
                // Handle conflict by getting latest version and retrying
                const latest = await db.get(id);
                await db.put({
                  data: [...(latest as any).data, ...saveData],
                  _id: id,
                  _rev: latest._rev,
                });
              } else {
                throw error;
              }
            }
          } catch (error) {
            console.error(`Error saving ${typename}:`, error);
            throw error;
          }
        };

        switch (typename) {
          case "Repository":
            console.log("Saving Repository:", data);
            const repoData = { ...data };
            delete repoData.__typename;
            await saveWithConflictHandling(repositoryDB, data.id, repoData);
            break;

          case "Stargazer":
            console.log("Saving Stargazer:", data);
            if (Array.isArray(data) && data.length > 0) {
              await saveStargazersArrayWithConflictHandling(
                stargazerDB,
                data[0].repository,
                data
              );
            }
            break;

          case "Metadata":
            console.log("Saving Metadata:", data);
            await saveWithConflictHandling(metadataDB, data.id, data);
            break;

          default:
            console.warn(`Unhandled typename: ${typename}`);
            break;
        }
      },

      async count(query: Partial<any>): Promise<number> {
        try {
          console.log(query)
          const result = await repositoryDB.allDocs();
          return result.total_rows;
        } catch (error) {
          console.error("Error counting documents:", error);
          return 0;
        }
      },
    };
  }
}

const SearchBar: React.FC = () => {
  const { setRepoInfo, setStargazersInfo, setIsLoading, setStep, accessToken } =
    useRepoContext();

  const [inputValue, setInputValue] = useState("jellyfin/jellyfin-kodi");
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState<string | boolean>(false);

  const isPausedRef = useRef(false);
  const inputChangedRef = useRef(true);

  const localStorageFactoryRef = useRef<LocalStorageFactory | null>(null);

  const repositoryDB = new PouchDB("repository");
  const stargazerDB = new PouchDB("stargazer");
  const metadataDB = new PouchDB("metadata");

  if (!localStorageFactoryRef.current) {
    localStorageFactoryRef.current = new LocalStorageFactory(
      repositoryDB,
      stargazerDB,
      metadataDB
    );
  }

  const [storageServiceInstance, setStorageServiceInstance] =
    useState<StorageService | null>(null);

  useEffect(() => {
    if (accessToken) {
      const instance = new StorageService(
        new GithubService(
          new GithubClient("https://api.github.com", { apiToken: accessToken }),
          { factory: new CustomFactory() }
        ),
        localStorageFactoryRef.current!
      );
      setStorageServiceInstance(instance);
    }
  }, [accessToken]);

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
    const service = storageServiceInstance;

    try {
      if (!service) {
        setIsError("Storage service is not initialized");
        setIsLoading(false);
        return;
      }
      const repoInfo = await fetchRepoInfo(service, owner, repo);
      setRepoInfo(repoInfo);
      if (repoInfo && service) {
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

  const fetchRepoInfo = async (
    service: StorageService,
    owner: string,
    repo: string
  ) => {
    return await service.repository(owner, repo);
  };

  const fetchStargazers = async (service: StorageService, repoId: string) => {
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
