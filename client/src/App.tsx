import Content from "./components/Content";
import Header from "./components/Header";
import { PageContainer } from "./styles";
import { RepoProvider } from "./contexts/repoContext";

function App() {
  return (
    <RepoProvider>
      <PageContainer>
        <Header />
        <Content />
      </PageContainer>
    </RepoProvider>
  );
}

export default App;
