import {Link} from "react-router-dom";
import {UseUserName} from "../context/UserContext";
import SmIcon from "../svg/SmIcon";
import "./footer.css";

export default function Footer() {
	const {userName} = UseUserName();
	return (
		<footer className="footer">
			<div className="footer-links">
				{!userName ? (
					<>
						<Link to="login">Log In</Link>
						<Link to="singup">Sing Up</Link>
						<Link to="search">Stocks</Link>
					</>
				) : (
					<>
						<Link to="/">Log Out</Link>
						<Link to="portfolio">My Portfolio</Link>
						<Link to="search">Stocks</Link>
					</>
				)}
			</div>
			<div className="footer-icon">
				<SmIcon />
			</div>
		</footer>
	);
}
