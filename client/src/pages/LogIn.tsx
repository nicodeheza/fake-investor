import "./login-singup.css";
import {UseUserName} from "../context/UserContext";
import {useNavigate} from "react-router-dom";
import {FormEvent, useState} from "react";
import {API_URL} from "../consts";

export default function LogIn() {
	const navigate = useNavigate();
	const {setUserName} = UseUserName();
	const [loginErr, setLoginErr] = useState(false);
	const [formFields, setFormFields] = useState({
		email: "",
		password: ""
	});

	function submit(e: FormEvent) {
		e.preventDefault();
		setLoginErr(false);

		fetch(`${API_URL}/user/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(formFields),
			credentials: "include"
		})
			.then((res) => res.json())
			.then((data) => {
				setUserName(data.userName);
				navigate("/portfolio");
			})
			.catch((err) => {
				console.log(err);
				setLoginErr(true);
			});
	}

	return (
		<div className="login">
			<h1>
				Start <span>training!</span>
			</h1>
			<main>
				<div className="flash-ilus">
					<div className="flash" />
					<img src="assets/ilus1.svg" alt="illustration" />
				</div>
				<div className="login-card">
					<form className="form-card" onSubmit={(e) => submit(e)}>
						<div className="form-fild-group">
							<label htmlFor="email">Email</label>
							<input
								className="text-input"
								type="text"
								id="email"
								name="email"
								value={formFields.email}
								onChange={(e) => setFormFields({...formFields, email: e.target.value})}
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
								value={formFields.password}
								onChange={(e) => setFormFields({...formFields, password: e.target.value})}
								required
							/>
						</div>
						<div className="form-btn-container">
							<button className="form-btn">Log in</button>
						</div>
						{loginErr ? (
							<p className="form-message">Incorrect email or password</p>
						) : null}
					</form>
				</div>
			</main>
		</div>
	);
}
