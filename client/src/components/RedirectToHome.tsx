import {useEffect} from "react";
import {useNavigate} from "react-router-dom";

export default function RedirectToHome() {
	const navigate = useNavigate();
	useEffect(() => {
		navigate("/");
	}, [navigate]);
	return <></>;
}
