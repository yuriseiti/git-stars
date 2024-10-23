import React, { createContext, useState, useContext, ReactNode } from 'react';

interface RepoContextType {
  repoInfo: any | null;
  stargazersInfo: any | null;
  accessToken: string | null;
  isLoading: boolean | string;
  step: number;
  setRepoInfo: (info: any | null) => void;
  setStargazersInfo: (info: any | null) => void;
  setAccessToken: (token: string | null) => void;
  setIsLoading: (loading: boolean | string) => void;
  setStep: (step: number) => void;
}

const RepoContext = createContext<RepoContextType | undefined>(undefined);

export const useRepoContext = () => {
  const context = useContext(RepoContext);
  if (!context) {
    throw new Error('useRepoContext must be used within a RepoProvider');
  }
  return context;
};

interface RepoProviderProps {
  children: ReactNode;
}

export const RepoProvider: React.FC<RepoProviderProps> = ({ children }) => {
  const [repoInfo, setRepoInfo] = useState<string | null>(null);
  const [stargazersInfo, setStargazersInfo] = useState<Array<any> | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [isLoading, setIsLoading] = useState<boolean | string>(false);
  const [step, setStep] = useState<number>(0);

  return (
    <RepoContext.Provider value={{ repoInfo, stargazersInfo, accessToken, isLoading, step, setRepoInfo, setStargazersInfo, setAccessToken, setIsLoading, setStep }}>
      {children}
    </RepoContext.Provider>
  );
};