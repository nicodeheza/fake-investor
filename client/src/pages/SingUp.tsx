import ilus2 from "../assets/ilus2.svg";
import "./login-singup.css";

export default function SingUp() {
	return (
		<div className="login">
			<h1>
				Sing up to <span>start training!</span>
			</h1>
			<main>
				<div className="flash-ilus">
					<div className="flash" />
					<img src={ilus2} alt="illustration" />
				</div>
				<div className="login-card">
					<form className="form-card">
						<div className="form-fild-group">
							<label htmlFor="email">Email</label>
							<input
								className="text-input"
								type="text"
								id="email"
								name="email"
								required
							/>
						</div>
						<div className="form-fild-group">
							<label htmlFor="username">User Name</label>
							<input
								className="text-input"
								type="text"
								id="username"
								name="username"
								required
							/>
						</div>
						<div className="form-fild-group">
							<label htmlFor="password">Password</label>
							<input
								className="text-input"
								type="password"
								id="password"
								name="password"
								required
							/>
						</div>
						<div className="form-fild-group">
							<label htmlFor="repeatPassword">Repeat Password</label>
							<input
								className="text-input"
								type="password"
								id="repeatPassword"
								name="repeatPassword"
								required
							/>
						</div>
						<div className="form-btn-container">
							<button className="form-btn">Sing Up</button>
						</div>
					</form>
				</div>
			</main>
		</div>
	);
}
