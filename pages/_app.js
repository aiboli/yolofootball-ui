import "./index.css";
import AppContextProvider from "../helper/AppContextProvider";

export default function App({ Component, pageProps }) {
  return (
    <AppContextProvider>
      <Component {...pageProps} />
    </AppContextProvider>
  );
}
