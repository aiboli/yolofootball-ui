## Major component map

This project is a small Next.js UI for the Yolofootball frontend. Below are the major components and their purpose to help with development and styling decisions.

- `components/Basic/BetEntry/` — bet entry UI used in lists and modals.
- `components/Basic/OddButton/` — reusable button for odds.
- `components/GameEntry/` — individual game entry layout and styles.
- `components/Home/` — main home page container. Contains subcomponents used on the home page:
  - `HomeLogo/` — site logo/header.
  - `HomeMenu/` — top navigation menu.
  - `HomeOrder/` — displays user's active orders (order list panel).
  - `HomeReceipt/` — receipt/checkout area on the home page.
  - `ReceiptComponent.js` — small receipt helper component.
- `components/LeagueMenu/` — league navigation/sidebar used on home.
- `components/Loader/` — loading spinner/placeholder.
- `components/Login/` & `components/Signup/` — auth forms and related components.

- `helper/` — application context, cookie helpers, and provider (`AppContext.js`, `AppContextProvider.js`, `cookieHelper.js`).
- `pages/` — Next.js pages (`_app.js`, `index.js`, `login.js`, `signup.js`) and global CSS (`index.css`).
- `public/assets/` — fonts and logo assets used by the UI.

Keep this map updated when adding new components so designers and developers can quickly find where to make visual or functional changes.

---

COLOR CODE (design reference):

- DARK BLUE: <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><rect width='16' height='16' fill='%230C1420'/></svg>" alt="#0C1420" /> `#0C1420`
- GREY: <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><rect width='16' height='16' fill='%23444351'/></svg>" alt="#444351" /> `#444351`
- YELLOW: <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><rect width='16' height='16' fill='%23FECB7A'/></svg>" alt="#FECB7A" /> `#FECB7A`
- Dark Yellow: <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><rect width='16' height='16' fill='%23BB7A44'/></svg>" alt="#BB7A44" /> `#BB7A44`
- Light Blue: <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><rect width='16' height='16' fill='%233f5473'/></svg>" alt="#3f5473" /> `#3f5473`

## Development — Node version and start

Recommended Node version

- This project specifies Node 18.17.1 in `package.json` engines, so use Node 18.17.1 to avoid engine warnings and ensure compatibility.

Using nvm on Windows (nvm-windows)

1. Install nvm-windows from https://github.com/coreybutler/nvm-windows (download the installer).
2. Open a new PowerShell window and run:

```powershell
# install the exact Node version required and switch to it
nvm install 18.17.1
nvm use 18.17.1

# confirm
node -v
npm -v

# install deps and start dev server (project uses port 3001)
npm ci
npm run dev
```
