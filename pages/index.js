import Home from '../components/Home';
import { useState } from "react";
import AppContext from './AppContext';

function App() {
    const [appContext, setAppContext] = useState({
        leagues: [],
        events: [],
        selectedEvents: []
    });
    return (
        <AppContext.Provider       value={{
            appContext,
            setAppContext
          }} >
            <Home />
        </AppContext.Provider>
    ) 
}
  
export default App