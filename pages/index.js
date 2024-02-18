import Home from "../components/Home";
import AppContextProvider from "../helper/AppContextProvider";

function App() {
  return (
    <AppContextProvider>
      <Home />
    </AppContextProvider>
  );
}

export default App;
