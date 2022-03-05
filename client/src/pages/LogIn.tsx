import ilus1 from "../assets/ilus1.svg";
import "./login-singup.css";

export default function LogIn() {
	return (
		<div className="login">
			<h1>
				Start <span>training!</span>
			</h1>
			<main>
				<div className="flash-ilus">
					<div className="flash" />
					<img src={ilus1} alt="illustration" />
				</div>
				<div className="login-card">
					<form className="form-card">
						<div className="form-fild-group">
							<label htmlFor="email-user">Email or User Name</label>
							<input
								className="text-input"
								type="text"
								id="email-user"
								name="email-user"
								required
							/>
						</div>
						<div className="form-fild-group">
							<label htmlFor="email-password">Password</label>
							<input
								className="text-input"
								type="password"
								id="email-password"
								name="email-password"
								required
							/>
						</div>
						<div className="form-btn-container">
							<button className="form-btn">Log in</button>
						</div>
					</form>
				</div>
			</main>
		</div>
	);
}
