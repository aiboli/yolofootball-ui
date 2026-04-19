import "./index.css";
import { Roboto } from "next/font/google";
import AppContextProvider from "../helper/AppContextProvider";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export default function App({ Component, pageProps }) {
  return (
    <div className={roboto.className}>
      <AppContextProvider>
        <Component {...pageProps} />
      </AppContextProvider>
    </div>
  );
}
