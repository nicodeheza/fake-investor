import "./App.css";
import {UserProvider} from "./context/UserContext";
import {BrowserRouter as Router, Routes, Route, useLocation} from "react-router-dom";
import Home from "./pages/Home";
import LogIn from "./pages/LogIn";
import SingUp from "./pages/SingUp";
import Search from "./pages/Search";
import Stock from "./pages/Stock";
import Portfolio from "./pages/Portfolio";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import {useLayoutEffect} from "react";
import RedirectToHome from "./components/RedirectToHome";
import ErrorPage from "./pages/ErrorPage";

function Wrapper({children}: {children: JSX.Element}) {
	const location = useLocation();
	useLayoutEffect(() => {
		document.documentElement.scrollTo(0, 0);
	}, [location.pathname]);
	return children;
}

function App() {
	return (
		<UserProvider>
			<Router>
				<Wrapper>
					<>
						<NavBar />
						<Routes>
							<Route path="/" element={<Home />} />
							<Route path="login" element={<LogIn />} />
							<Route path="singup" element={<SingUp />} />
							<Route path="search" element={<Search />} />
							<Route path="stock/:symbol" element={<Stock />} />
							<Route path="portfolio" element={<Portfolio />} />
							<Route path="error" element={<ErrorPage />} />
							<Route path="*" element={<RedirectToHome />} />
						</Routes>
						<Footer />
					</>
				</Wrapper>
			</Router>
		</UserProvider>
	);
}

export default App;
