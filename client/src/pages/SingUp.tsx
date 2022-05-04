import {useState, FormEvent} from "react";
import {useNavigate} from "react-router-dom";
import {API_URL} from "../consts";
import {UseUserName} from "../context/UserContext";
import "./login-singup.css";

type formFields = {
	email: string;
	userName: string;
	password: string;
	repeat: string;
};

export default function SingUp() {
	const [formFields, setFormFields] = useState<formFields>({
		email: "",
		userName: "",
		password: "",
		repeat: ""
	});
	const [message, setMessage] = useState("");
	const {setUserName} = UseUserName();
	const navigate = useNavigate();

	function submit(e: FormEvent) {
		e.preventDefault();
		setMessage("");

		if (formFields.password !== formFields.repeat) {
			setMessage("Passwords don't match");
		} else {
			fetch(`${API_URL}/user/singup`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(formFields),
				credentials: "include"
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.message) {
						setMessage(data.message);
					} else if (data.userName) {
						setUserName(data.userName);
						navigate("/portfolio");
					}
				})
				.catch((err) => console.log(err));
			setFormFields({
				email: "",
				userName: "",
				password: "",
				repeat: ""
			});
		}
	}

	return (
		<div className="login">
			<h1>
				Sing up to <span>start training!</span>
			</h1>
			<main>
				<div className="flash-ilus">
					<div className="flash" />
					<img src="assets/ilus2.svg" alt="illustration" />
				</div>
				<div className="login-card">
					<form className="form-card" onSubmit={(e) => submit(e)}>
						<div className="form-fild-group">
							<label htmlFor="email">Email</label>
							<input
								className="text-input"
								type="email"
								id="email"
								name="email"
								value={formFields.email}
								onChange={(e) => setFormFields({...formFields, email: e.target.value})}
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
								value={formFields.userName}
								onChange={(e) => setFormFields({...formFields, userName: e.target.value})}
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
						<div className="form-fild-group">
							<label htmlFor="repeatPassword">Repeat Password</label>
							<input
								className="text-input"
								type="password"
								id="repeatPassword"
								name="repeatPassword"
								value={formFields.repeat}
								onChange={(e) => setFormFields({...formFields, repeat: e.target.value})}
								required
							/>
						</div>
						<div className="form-btn-container">
							<button className="form-btn" type="submit">
								Sing Up
							</button>
						</div>
						<p className="form-message">{message}</p>
					</form>
				</div>
			</main>
		</div>
	);
}
