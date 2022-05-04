import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {UseUserName} from "../context/UserContext";
import MenuBar from "../svg/MenuBar";
import SmIcon from "../svg/SmIcon";
import {API_URL} from "../consts";
import "./navBar.css";

export default function NavBar() {
	const {userName, setUserName} = UseUserName();
	const [navOpen, setNavOpen] = useState(false);

	useEffect(() => {
		fetch(`${API_URL}/user/auth`, {
			method: "GET",
			credentials: "include"
		})
			.then((res) => res.json())
			.then((data) => {
				setUserName(data.userName);
			})
			.catch((err) => console.log(err));
	}, [setUserName]);

	function logOut() {
		fetch(`${API_URL}/user/logout`, {
			method: "GET",
			credentials: "include"
		})
			.then((res) => res.json())
			.then((data) => setUserName(data.userName))
			.catch((err) => console.log(err));
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
								<Link to="login">Log In</Link>
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
						<Link to="search" onClick={() => setNavOpen((pre) => !pre)}>
							Stocks
						</Link>
						<Link to="portfolio" onClick={() => setNavOpen((pre) => !pre)}>
							My Portfolio
						</Link>
						<Link to="/" onClick={() => setNavOpen((pre) => !pre)}>
							Log Out
						</Link>
					</>
				) : (
					<>
						<Link to="search" onClick={() => setNavOpen((pre) => !pre)}>
							Stocks
						</Link>
						<Link to="login" onClick={() => setNavOpen((pre) => !pre)}>
							Log In
						</Link>
						<Link to="singup" onClick={() => setNavOpen((pre) => !pre)}>
							Sing Up
						</Link>
					</>
				)}
			</div>
		</nav>
	);
}
