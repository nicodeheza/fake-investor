import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {API_URL} from "../../consts";
import {UseUserName} from "../../context/UserContext";
import * as d3 from "d3";
import roundTow from "../../helpers/roundTow";

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

			//remove
			d3.select("#user-svg").remove();
			d3.select("#tt-user").remove();

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

			//wrap
			const wrap = (
				text: d3.Selection<d3.BaseType, unknown, SVGGElement, unknown>,
				width: number
			) => {
				text.each(function () {
					let text = d3.select(this);
					let words = text.text().split(/\s+/).reverse();
					let word;
					let line: string[] = [];
					let lineNumber = 0;
					const lineHeight = 1.1; // ems
					const y = text.attr("y");
					const dy = parseFloat(text.attr("dy"));
					let tspan = text
						.text(null)
						.append("tspan")
						.attr("x", 0)
						.attr("y", y)
						.attr("dy", dy + "em");
					while ((word = words.pop())) {
						line.push(word);
						tspan.text(line.join(" "));
						if (tspan.node()!.getComputedTextLength() > width) {
							line.pop();
							tspan.text(line.join(" "));
							line = [word];
							tspan = text
								.append("tspan")
								.attr("x", 0)
								.attr("y", y)
								.attr("dy", ++lineNumber * lineHeight + dy + "em")
								.text(word);
						}
					}
				});
			};

			//append y axis
			const yAxis = d3.axisLeft(scaleY);
			const gY = svg.append("g").attr("class", "axis y-axis").call(yAxis);

			const chartBody = svg
				.append("g")
				.attr("class", "chartBody")
				.attr("clip-path", "url(#clip)");

			//tooltips (todo)

			const tooltip = d3
				.select(userSvgDiv.current)
				.append("div")
				.style("opacity", 0)
				.attr("id", "tt-user")
				.attr("class", "tooltip-stock")
				.style("top", "0px")
				.style("left", "0px");

			const mouseover = function (this: SVGCircleElement, e: any, d: string) {
				tooltip.style("opacity", 1).style("display", "block");
			};
			const mousemoveChartDots = function (this: SVGCircleElement, e: any, d: string) {
				const date = new Date(parseInt(d));
				const TTdata = userChartData[d];
				const showDate = `${
					month[date.getMonth()]
				}/${date.getDate()}/${date.getFullYear()}`;
				tooltip
					.html(
						`<ul>
				  <li><b>Date:</b> ${showDate}</li><br>
				  <li><b>Portfolio Value:</b> ${roundTow(TTdata.portfolioValue)}</li><br>
				  <li><b>Liquid:</b> ${roundTow(TTdata.liquid)}</li>
				  </ul>`
					)
					.style("left", d3.pointer(e)[0] + 50 + "px")
					.style("top", d3.pointer(e)[1] + 20 + "px");
			};
			const mousemoveDots = function (this: SVGCircleElement, e: any, d: string) {
				const date = new Date(parseInt(d));
				const TTdata = userChartData[d];
				const showDate = `${
					month[date.getMonth()]
				}/${date.getDate()}/${date.getFullYear()}`;

				const transactions: string[] = [];
				TTdata.transactions.forEach((ele) => {
					const s = `<li>
					${ele.buy ? "Buy" : "Sell"} ${ele.quantity} ${ele.symbol} x ${roundTow(ele.price)}FUD
					</li>`;
					transactions.push(s);
				});
				tooltip
					.html(
						`
					<h5 style="margin:5px 0px">Transactions</h5>
					<p style="font-size: 12px">${showDate}</p><br>
					<ul>
					${transactions.join("<br>")}
					</ul>
					`
					)
					.style("left", d3.pointer(e)[0] + 70 + "px")
					.style("bottom", " 10px")
					.style("top", "inherit")
					.style("height", "fit-content");
			};
			const mouseleave = function (this: SVGCircleElement, e: any, d: string) {
				tooltip.style("opacity", 0).style("display", "none");
			};

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

			const lineChartDots = chartBody
				.selectAll(".chartDots")
				.data(dataDates)
				.enter()
				.append("circle")
				.attr("class", "chartDots")
				.attr("fill", "var(--green)")
				.attr("stroke", "none")
				.attr("cx", (d, i) => scaleX(i) - xBand.bandwidth())
				.attr("cy", (d) => scaleY(userChartData[d].portfolioValue))
				.attr("r", "2px")
				.on("mouseover", mouseover)
				.on("mousemove", mousemoveChartDots)
				.on("mouseleave", mouseleave);

			const dots = chartBody
				.selectAll(".transDots")
				.data(dataDates)
				.enter()
				.append("circle")
				.attr("class", "transDots")
				.attr("fill", (d) =>
					userChartData[d].transactions.length > 0 ? "var(--color)" : "none"
				)
				.attr("stroke", "none")
				.attr("cx", (d, i) => scaleX(i) - xBand.bandwidth())
				.attr("cy", h - 10)
				.attr("r", "5px")
				.on("mouseover", mouseover)
				.on("mousemove", mousemoveDots)
				.on("mouseleave", mouseleave);

			//clip
			svg
				.append("defs")
				.append("clipPath")
				.attr("id", "clip")
				.append("rect")
				.attr("width", w)
				.attr("height", h);

			// zoom todo
			const zoomed = (e: any) => {
				const t = e.transform;
				const xScaleZ = t.rescaleX(scaleX);
				const yScaleZ = t.rescaleY(scaleY);

				gX.call(d3.axisBottom(xScaleZ).tickFormat(formatTick));

				gX.selectAll(".tick text").call(wrap, xBand.bandwidth());

				gY.call(d3.axisLeft(yScaleZ));

				const lineZoom = d3
					.line<string>()
					.x((d, i) => xScaleZ(i) - xBand.bandwidth())
					.y((d) => yScaleZ(userChartData[d].portfolioValue));

				lineChart.attr("d", lineZoom);

				lineChartDots
					.attr("cx", (d, i) => xScaleZ(i) - xBand.bandwidth())
					.attr("cy", (d) => yScaleZ(userChartData[d].portfolioValue))
					.attr("r", () => `${t.k * 2}px`);

				dots.attr("cx", (d, i) => xScaleZ(i) - xBand.bandwidth());
			};

			const extent: [[number, number], [number, number]] = [
				[0, 0],
				[w, h]
			];
			//let resizeTimer;
			const zoom = d3
				.zoom<SVGGElement, unknown>()
				.scaleExtent([1, 100])
				.translateExtent(extent)
				.extent(extent)
				.on("zoom", zoomed);

			svg.call(zoom);
		}
	}, [chartDimensions, userChartData]);
	return (
		<>
			<div
				ref={userSvgDiv}
				style={{width: "100%", height: "100%", position: "relative"}}
			></div>
		</>
	);
}
