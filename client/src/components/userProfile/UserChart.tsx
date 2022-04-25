import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {API_URL} from "../../consts";
import {UseUserName} from "../../context/UserContext";
import * as d3 from "d3";

interface userChartData {
	[key: string]: {
		liquid: number;
		portfolioValue: number;
		transactions: {
			buy: boolean;
			price: number;
			quantity: number;
			symbol: string;
		}[];
	};
}

export default function UserChart() {
	const [userChartData, setUserChartData] = useState<userChartData>();
	const [chartDimensions, setChartDimensions] = useState<{w: number; h: number}>();
	const {setUserName} = UseUserName();
	const navigate = useNavigate();
	const userSvgDiv = useRef<HTMLDivElement>(null!);

	//fetch data
	useEffect(() => {
		fetch(`${API_URL}/user/userChart`, {
			method: "GET",
			credentials: "include"
		})
			.then((res) => res.json())
			.then((data) => {
				console.log(data);
				if (data.userName === "") {
					setUserName("");
					navigate("/");
				} else {
					setUserChartData(data);
				}
			})
			.catch((err) => console.log(err));
	}, [navigate, setUserName]);

	//set chart dimensions
	useEffect(() => {
		function getDim() {
			const width = userSvgDiv.current.clientWidth;
			const height = userSvgDiv.current.clientHeight;
			setChartDimensions({
				w: width,
				h: height
			});
		}

		getDim();
		window.addEventListener("resize", getDim);
		return () => window.removeEventListener("resize", getDim);
	}, [userChartData]);

	//draw chart
	useEffect(() => {
		const month = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec"
		];
		if (chartDimensions !== undefined && userChartData) {
			const margin = {top: 15, right: 10, bottom: 40, left: 55};
			const w = chartDimensions.w - margin.left - margin.right;
			const h = chartDimensions.h - margin.top - margin.bottom;

			//remove (todo)
			d3.select("#user-svg").remove();

			const svg = d3
				.select(userSvgDiv.current)
				.append("svg")
				.attr("id", "user-svg")
				.attr("width", w + margin.left + margin.right)
				.attr("height", h + margin.top + margin.bottom)
				.append("g")
				.attr("id", "userChartG")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			//x scales
			const dates = Object.keys(userChartData).sort();
			const dataDates = [...dates];
			dates.unshift((parseInt(dates[0]) - 1000 * 60 * 60 * 24).toString());
			const scaleX = d3.scaleLinear().domain([-1, dates.length]).range([0, w]);
			const xBand = d3
				.scaleBand()
				.domain(dates.map((d) => new Date(parseInt(d)).toString()))
				.range([0, w])
				.padding(0.15);

			//y scale
			const portfolioValues = dataDates.map((e) => userChartData[e].portfolioValue);
			const yMax = d3.max<number>(portfolioValues) || 0;
			const yMin = d3.min<number>(portfolioValues) || 0;
			const scaleY = d3.scaleLinear().domain([yMin, yMax]).range([h, 0]).nice();

			//pointer rect
			svg
				.append("rect")
				.attr("id", "rect")
				.attr("width", w)
				.attr("height", h)
				.style("fill", "none")
				.style("pointer-events", "all")
				.attr("clip-path", "url(#clip)");

			//append x axis
			const ld: number[] = [];
			let nextDate: number | undefined;
			const formatTick = (d: d3.AxisDomain, i: number) => {
				const dd = parseInt(d.toString());
				const date = new Date(parseInt(dates[dd]));
				let lastDate;
				if (i > 0) {
					lastDate = new Date(parseInt(dates[ld[ld.length - 1]]));
				}
				ld.push(dd);
				const day = date.getDate();
				if (dd >= 0 && dd < dates.length && nextDate !== day) {
					nextDate = day;
					return lastDate &&
						lastDate.getFullYear() === date.getFullYear() &&
						lastDate.getMonth() === date.getMonth()
						? day.toString()
						: month[date.getMonth()] + " " + date.getFullYear().toString();
				} else {
					nextDate = day;

					return "";
				}
			};

			const xAxis = d3.axisBottom(scaleX).tickFormat(formatTick);
			var gX = svg
				.append("g")
				.attr("class", "axis x-axis") //Assign "axis" class
				.attr("transform", "translate(0," + h + ")")
				.call(xAxis);

			//wrap (todo)

			//append y axis
			const yAxis = d3.axisLeft(scaleY);
			const gY = svg.append("g").attr("class", "axis y-axis").call(yAxis);

			const chartBody = svg
				.append("g")
				.attr("class", "chartBody")
				.attr("clip-path", "url(#clip)");

			//tooltips (todo)

			//draw line
			const line = d3
				.line<string>()
				.x((d, i) => scaleX(i) - xBand.bandwidth())
				.y((d) => scaleY(userChartData[d].portfolioValue));

			const lineChart = chartBody
				.append("path")
				.datum(dataDates)
				.attr("fill", "none")
				.attr("stroke", "var(--green)")
				.attr("stroke-width", 1.5)
				.attr("d", line);

			const dots = chartBody
				.selectAll("circle")
				.data(dataDates)
				.enter()
				.append("circle")
				.attr("fill", (d) =>
					userChartData[d].transactions.length > 0 ? "var(--color)" : "none"
				)
				.attr("stroke", "none")
				.attr("cx", (d, i) => scaleX(i) - xBand.bandwidth())
				.attr("cy", h - 10)
				.attr("r", "5px")
				.exit();

			// zoom todo
		}
	}, [chartDimensions, userChartData]);
	return (
		<>
			<div ref={userSvgDiv} style={{width: "100%", height: "100%"}}></div>
		</>
	);
}
