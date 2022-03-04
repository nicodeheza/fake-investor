import {Link} from "react-router-dom";
import logo from "../assets/home-logo.svg";
import ilus1 from "../assets/ilus1.svg";
import ilus2 from "../assets/ilus2.svg";
import ilus3 from "../assets/ilus3.svg";
import "./home.css";

export default function Home() {
	return (
		<div>
			<header className="home-header">
				<h1>
					<img src={logo} alt="Fake Inversor" />
				</h1>
				<div className="home-header-ele">
					<p>Train your investment skills as a champion.</p>

					<Link to="singup" className="btn-link">
						Get Started
					</Link>
				</div>
			</header>
			<article className="home-article">
				<h1>
					How it <span>works</span>
				</h1>
				<section>
					<img src={ilus1} alt="illustration" />
					<div className="home-article-text">
						<h3>
							You <span className="home-article-text-red">start</span> with one million
							FUD (fake dollar)
						</h3>
						<p>
							When you create your account you start with 100.000.000 FUD, which is the
							fake currency of the game. Is not possible to change FUD for real assets.
							Inside the game, the value of this fake money is 1FUD = 1USD. You can't buy
							more FUD, you can earn them by playing the game
						</p>
					</div>
				</section>
				<section>
					<div className="home-article-text">
						<h3>
							<span className="home-article-text-green">Buy and sell</span> stocks and
							follow your progress
						</h3>
						<p>
							With your FUD's you can buy stocks inside the game. The stocks in the game
							are not real stocks but we track the real stock value so the result of your
							fake investments will be more accurate to a real one. You can also sell your
							fake stock for more FUD's
						</p>
					</div>
					<img src={ilus2} alt="illustration" />
				</section>
				<section>
					<img src={ilus3} alt="illustration" />
					<div className="home-article-text">
						<h3>
							You can <span className="home-article-text-red">restart</span> the game all
							the times you want.
						</h3>
						<p>
							This is just a game, so if you are not happy with the result of your
							investments you can always restart the game. If you do this you are going to
							lose all your stocks and you are going to have one million FUD in your
							account.
						</p>
					</div>
				</section>
				<Link to="singup" className="btn-link">
					Get Started
				</Link>
			</article>
		</div>
	);
}
