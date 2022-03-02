import "./App.css";
import {UserProvider} from "./context/UserContext";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from "./pages/Home";
import LogIn from "./pages/LogIn";
import SingUp from "./pages/SingUp";
import Search from "./pages/Search";
import Stock from "./pages/Stock";
import Portfolio from "./pages/Portfolio";

function App() {
	return (
		<UserProvider>
			<h1>test</h1>
			<Router>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="login" element={<LogIn />} />
					<Route path="singup" element={<SingUp />} />
					<Route path="login" element={<LogIn />} />
					<Route path="search" element={<Search />} />
					<Route path="stock" element={<Stock />} />
					<Route path="portfolio" element={<Portfolio />} />
				</Routes>
			</Router>
		</UserProvider>
	);
}

export default App;
