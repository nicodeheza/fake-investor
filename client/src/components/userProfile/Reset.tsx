import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {API_URL} from "../../consts";
import {UseUserName} from "../../context/UserContext";
import Btn from "../Btn";
import "./reset.css";

export default function Reset() {
	const [showMessage, setShowMessage] = useState(false);
	const {setUserName} = UseUserName();
	const navigate = useNavigate();

	function reset() {
		// fetch(`${API_URL}/user/reset`, {
		// 	method: "DELETE",
		// 	credentials: "include"
		// })
		// 	.then((res) => res.json())
		// 	.then((data) => {
		// 		console.log(data);
		// 		if (data.userName === "") {
		// 			setUserName("");
		// 			navigate("/");
		// 		} else {
		// 			window.location.reload();
		// 		}
		// 	})
		// 	.catch((err) => console.log(err));
	}
	return (
		<>
			<button onClick={() => setShowMessage(true)} className="reset-btn">
				Reset Game
			</button>
			{showMessage ? (
				<div className="reset-waring-main-container">
					<div className="reset-waring-container">
						<p>
							<span>WARING:</span> <br />
							If you press accept you are going to lose all your stocks and your account
							will have 1.000.000 FUD
						</p>
						<Btn
							text="Accept"
							color="var(--red)"
							padding="10px 20px"
							onClick={() => reset()}
						/>
						<Btn
							text="Cancel"
							color="var(--green)"
							padding="10px 20px"
							onClick={() => setShowMessage(false)}
						/>
					</div>
				</div>
			) : null}
		</>
	);
}
