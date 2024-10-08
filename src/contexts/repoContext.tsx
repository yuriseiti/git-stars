import React, { createContext, useState, useContext, ReactNode } from 'react';

interface RepoContextType {
  repoInfo: any | null;
  stargazersInfo: any | null;
  setRepoInfo: (info: any | null) => void;
  setStargazersInfo: (info: any | null) => void;
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
  const [stargazersInfo, setStargazersInfo] = useState<string | null>(null);

  return (
    <RepoContext.Provider value={{ repoInfo, stargazersInfo, setRepoInfo, setStargazersInfo }}>
      {children}
    </RepoContext.Provider>
  );
};