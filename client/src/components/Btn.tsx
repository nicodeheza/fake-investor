import React from "react";
import "./btn.css";

interface btn {
	text: string;
	color?: string;
	padding: string;
	onClick?(e: React.MouseEvent): void;
}
export default function Btn({text, color = "var(--green)", padding, onClick}: btn) {
	return (
		<button
			style={{color: color, padding: padding}}
			className="main-btn"
			onClick={onClick}
		>
			{text}
		</button>
	);
}
