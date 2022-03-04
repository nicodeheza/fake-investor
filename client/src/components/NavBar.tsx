import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {UseUserName} from "../context/UserContext";
import MenuBar from "../svg/MenuBar";
import SmIcon from "../svg/SmIcon";
import "./navBar.css";

export default function NavBar() {
	const {userName, setUserName} = UseUserName();
	const [navOpen, setNavOpen] = useState(false);
	useEffect(() => {
		console.log(userName);
	}, [userName]);

	function logOut() {
		setUserName("");
		console.log("logout");
	}
	function logIn() {
		setUserName("nico");
		console.log("login");
	}
	return (
		<nav className="navBarContainer">
			<div className="navBar">
				<div className="navBarIcon">
					<SmIcon />
				</div>
				<div className="navBarLinks">
					<div className="navBarStock">
						<Link to="search">Stocks</Link>
					</div>
					<div className="navBarUser">
						{userName ? (
							<>
								<Link to="portfolio">My Portfolio</Link>
								<Link to="/" onClick={() => logOut()}>
									Log Out
								</Link>
							</>
						) : (
							<>
								<Link to="login" onClick={() => logIn()}>
									Log In
								</Link>
								<Link to="singup">Sing Up</Link>
							</>
						)}
					</div>
				</div>
				<div className="navBar-menuIcon" onClick={() => setNavOpen((pre) => !pre)}>
					<MenuBar />
				</div>
			</div>
			<div className={`navBar-mobile ${navOpen ? "nav-on" : "nav-off"}`}>
				{userName ? (
					<>
						<Link to="search">Stocks</Link>
						<Link to="portfolio">My Portfolio</Link>
						<Link to="/" onClick={() => logOut()}>
							Log Out
						</Link>
					</>
				) : (
					<>
						<Link to="search">Stocks</Link>
						<Link to="login" onClick={() => logIn()}>
							Log In
						</Link>
						<Link to="singup">Sing Up</Link>
					</>
				)}
			</div>
		</nav>
	);
}
