interface arrow {
	pos: string;
}

export default function Arrow({pos}: arrow) {
	return (
		<svg
			width="32"
			height="26"
			viewBox="0 0 32 26"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={pos === "up" ? "arrow-up" : "arrow-down"}
		>
			<path d="M11 12.5624L11 25.1247L21 25.1247L21 12.5624L32 12.5624L16 -1.22532e-05L5.08584e-07 12.5624L11 12.5624Z" />
		</svg>
	);
}
