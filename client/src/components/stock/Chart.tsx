import {useEffect, useRef, useState} from "react";
import {API_URL} from "../../consts";
import * as d3 from "d3";
import roundTow from "../../helpers/roundTow";
import Spinner from "../Spinner";

interface chart {
	symbol: string | undefined;
}

interface chartData {
	close: number[];
	high: number[];
	low: number[];
	open: number[];
	timestamp: number[];
}
interface grafDim {
	w: number;
	h: number;
}

enum chartL {
	d5,
	m1,
	m3,
	m6,
	y1,
	y2,
	y5
}

export default function Chart({symbol}: chart) {
	const [chartData, setChartData] = useState<chartData | undefined>();
	const [grafDimensions, setGrafDimensions] = useState<grafDim | undefined>();
	const [allData, setAllData] = useState<chartData | undefined>();
	const [chartLength, setChertLength] = useState(chartL.m1);
	const svgDiv = useRef<HTMLDivElement>(null!);
	//fetch Data
	useEffect(() => {
		if (symbol) {
			fetch(`${API_URL}/stock/chart/${symbol}`, {
				method: "GET",
				credentials: "include"
			})
				.then((res) => res.json())
				.then((data) => {
					setAllData(data);
				})
				.catch((err) => console.log(err));
		}
	}, [symbol]);

	//set data length
	useEffect(() => {
		if (allData) {
			const l = allData.timestamp.length;
			switch (chartLength) {
				case chartL.d5:
					if (l >= 5) {
						setChartData({
							timestamp: allData.timestamp.slice(-5),
							close: allData.close.slice(-5),
							open: allData.open.slice(-5),
							high: allData.high.slice(-5),
							low: allData.low.slice(-5)
						});
					} else {
						setChartData({
							timestamp: [...allData.timestamp],
							close: [...allData.close],
							open: [...allData.open],
							high: [...allData.high],
							low: [...allData.low]
						});
					}
					break;
				case chartL.m1:
					if (l >= 21) {
						setChartData({
							timestamp: allData.timestamp.slice(-21),
							close: allData.close.slice(-21),
							open: allData.open.slice(-21),
							high: allData.high.slice(-21),
							low: allData.low.slice(-21)
						});
					} else {
						setChartData({
							timestamp: [...allData.timestamp],
							close: [...allData.close],
							open: [...allData.open],
							high: [...allData.high],
							low: [...allData.low]
						});
					}
					break;
				case chartL.m3:
					if (l >= 63) {
						setChartData({
							timestamp: allData.timestamp.slice(-63),
							close: allData.close.slice(-63),
							open: allData.open.slice(-63),
							high: allData.high.slice(-63),
							low: allData.low.slice(-63)
						});
					} else {
						setChartData({
							timestamp: [...allData.timestamp],
							close: [...allData.close],
							open: [...allData.open],
							high: [...allData.high],
							low: [...allData.low]
						});
					}
					break;
				case chartL.m6:
					if (l >= 126) {
						setChartData({
							timestamp: allData.timestamp.slice(-126),
							close: allData.close.slice(-126),
							open: allData.open.slice(-126),
							high: allData.high.slice(-126),
							low: allData.low.slice(-126)
						});
					} else {
						setChartData({
							timestamp: [...allData.timestamp],
							close: [...allData.close],
							open: [...allData.open],
							high: [...allData.high],
							low: [...allData.low]
						});
					}
					break;
				case chartL.y1:
					if (l >= 252) {
						setChartData({
							timestamp: allData.timestamp.slice(-252),
							close: allData.close.slice(-252),
							open: allData.open.slice(-252),
							high: allData.high.slice(-252),
							low: allData.low.slice(-252)
						});
					} else {
						setChartData({
							timestamp: [...allData.timestamp],
							close: [...allData.close],
							open: [...allData.open],
							high: [...allData.high],
							low: [...allData.low]
						});
					}
					break;
				case chartL.y2:
					if (l >= 504) {
						setChartData({
							timestamp: allData.timestamp.slice(-504),
							close: allData.close.slice(-504),
							open: allData.open.slice(-504),
							high: allData.high.slice(-504),
							low: allData.low.slice(-504)
						});
					} else {
						setChartData({
							timestamp: [...allData.timestamp],
							close: [...allData.close],
							open: [...allData.open],
							high: [...allData.high],
							low: [...allData.low]
						});
					}
					break;
				case chartL.y5:
					setChartData({
						timestamp: [...allData.timestamp],
						close: [...allData.close],
						open: [...allData.open],
						high: [...allData.high],
						low: [...allData.low]
					});
					break;
			}
		}
	}, [chartLength, allData]);

	//get svg dimensions
	useEffect(() => {
		function getDim() {
			const width = svgDiv.current.clientWidth;
			const height = svgDiv.current.clientHeight;
			setGrafDimensions({
				w: width,
				h: height
			});
		}
		getDim();
		window.addEventListener("resize", getDim);
		return () => window.removeEventListener("resize", getDim);
	}, []);

	//create chart
	useEffect(() => {
		if (chartData && grafDimensions !== undefined) {
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
			const margin = {top: 10, right: 10, bottom: 40, left: 40};
			const w = grafDimensions.w - margin.left - margin.right;
			const h = grafDimensions.h - margin.top - margin.bottom;

			d3.select("#stock-svg").remove();
			d3.select("#tt-stock").remove();

			const svg = d3
				.select(svgDiv.current)
				.append("svg")
				.attr("id", "stock-svg")
				.attr("width", w + margin.left + margin.right)
				.attr("height", h + margin.top + margin.bottom)
				.append("g")
				.attr("id", "chartG")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			//x scales
			const bandArr = [...chartData.timestamp];
			bandArr.unshift(chartData.timestamp[0] - 1000 * 60 * 60 * 24);
			const scaleX = d3
				.scaleLinear()
				.domain([-1, chartData.timestamp.length])
				.range([0, w]);
			const xBand = d3
				.scaleBand()
				.domain(chartData.timestamp.map((d) => new Date(d).toString()))
				.range([0, w])
				.padding(0.15);

			//y scale
			const yMax = d3.max(chartData.high) || 0;
			const yMin = d3.min(chartData.low) || 0;
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
				const date = new Date(chartData.timestamp[dd]);
				let lastDate;
				if (i > 0) {
					lastDate = new Date(chartData.timestamp[ld[ld.length - 1]]);
				}
				ld.push(dd);
				const day = date.getDate();
				if (dd >= 0 && dd < chartData.timestamp.length && nextDate !== day) {
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

			gX.selectAll(".tick text").call(wrap, xBand.bandwidth());
			//append y axis
			const yAxis = d3.axisLeft(scaleY);
			const gY = svg.append("g").attr("class", "axis y-axis").call(yAxis);

			const chartBody = svg
				.append("g")
				.attr("class", "chartBody")
				.attr("clip-path", "url(#clip)");

			//tooltips
			const tooltip = d3
				.select(svgDiv.current)
				.append("div")
				.style("opacity", 0)
				.attr("id", "tt-stock")
				.attr("class", "tooltip-stock")
				.style("top", "0px")
				.style("left", "0px");

			const mouseover = function (this: SVGRectElement, e: any, d: number) {
				tooltip.style("opacity", 1).style("display", "block");
			};
			const tooltipIndex = d3.local<number>();
			const mousemove = function (this: SVGRectElement, e: any, d: number) {
				const date = new Date(chartData.timestamp[tooltipIndex.get(this)!]);
				const showDate = `${
					month[date.getMonth()]
				}/${date.getDate()}/${date.getFullYear()}`;
				tooltip
					.html(
						`<ul>
					  <li><b>Date:</b> ${showDate}</li><br>
					  <li><b>Low:</b> ${roundTow(chartData.low[tooltipIndex.get(this)!])}</li><br>
					  <li><b>High:</b> ${roundTow(chartData.high[tooltipIndex.get(this)!])}</li><br>
					  <li><b>Open:</b> ${roundTow(d)}</li><br>
					  <li><b>Close:</b> ${roundTow(chartData.close[tooltipIndex.get(this)!])}</li>
					  </ul>`
					)
					.style("left", d3.pointer(e)[0] + 50 + "px")
					.style("top", d3.pointer(e)[1] + 20 + "px");
			};
			const mouseleave = function (this: SVGRectElement, e: any, d: number) {
				tooltip.style("opacity", 0).style("display", "none");
			};

			// draw rectangles
			const candels = chartBody
				.selectAll(".candel")
				.data(chartData.open)
				.enter()
				.append("rect")
				.attr("x", (d, i) => scaleX(i) - xBand.bandwidth())
				.attr("y", (d, i) => scaleY(Math.max(d, chartData.close[i])))
				.attr("width", xBand.bandwidth())
				.attr("height", function (d, i) {
					tooltipIndex.set(this, i);
					return d === chartData.close[i]
						? 1
						: scaleY(Math.min(d, chartData.close[i])) -
								scaleY(Math.max(d, chartData.close[i]));
				})
				.style("fill", (d, i) =>
					d <= chartData.close[i] ? "var(--green)" : "var(--red)"
				)
				.on("mouseover", mouseover)
				.on("mousemove", mousemove)
				.on("mouseleave", mouseleave);

			// draw high and low
			const stems = chartBody
				.selectAll("g.line")
				.data(chartData.high)
				.enter()
				.append("line")
				.attr("x1", (d, i) => scaleX(i) - xBand.bandwidth() / 2)
				.attr("x2", (d, i) => scaleX(i) - xBand.bandwidth() / 2)
				.attr("y1", (d) => scaleY(d))
				.attr("y2", (d, i) => scaleY(chartData.low[i]))
				.style("stroke", (d, i) =>
					chartData.open[i] <= chartData.close[i] ? "var(--green)" : "var(--red)"
				);

			//clip
			svg
				.append("defs")
				.append("clipPath")
				.attr("id", "clip")
				.append("rect")
				.attr("width", w)
				.attr("height", h);

			//zoom

			const zoomed = (e: any) => {
				const t = e.transform;
				const xScaleZ = t.rescaleX(scaleX);
				const yScaleZ = t.rescaleY(scaleY);

				// const ld: number[] = [];
				// let nextDate: number | undefined;
				gX.call(d3.axisBottom(xScaleZ).tickFormat(formatTick));

				gX.selectAll(".tick text").call(wrap, xBand.bandwidth());

				gY.call(d3.axisLeft(yScaleZ));

				candels
					.attr("x", (d, i) => xScaleZ(i) - (xBand.bandwidth() * t.k) / 2)
					.attr("width", xBand.bandwidth() * t.k)
					.attr("y", (d, i) => yScaleZ(Math.max(chartData.open[i], chartData.close[i])))
					.attr("height", (d, i) =>
						chartData.open[i] === chartData.close[i]
							? 1
							: yScaleZ(Math.min(chartData.open[i], chartData.close[i])) -
							  yScaleZ(Math.max(chartData.open[i], chartData.close[i]))
					);

				stems.attr(
					"x1",
					(d, i) => xScaleZ(i) - xBand.bandwidth() / 2 + xBand.bandwidth() * 0.5
				);
				stems.attr(
					"x2",
					(d, i) => xScaleZ(i) - xBand.bandwidth() / 2 + xBand.bandwidth() * 0.5
				);
				stems.attr("y1", (d, i) => yScaleZ(chartData.high[i]));
				stems.attr("y2", (d, i) => yScaleZ(chartData.low[i]));
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
	}, [chartData, grafDimensions]);

	return (
		<div>
			<div className="stock-chart-btn">
				<button
					style={chartLength === chartL.d5 ? {background: "var(--color)"} : {}}
					onClick={(e) => setChertLength(chartL.d5)}
				>
					5D
				</button>
				<button
					style={chartLength === chartL.m1 ? {background: "var(--color)"} : {}}
					onClick={(e) => setChertLength(chartL.m1)}
				>
					1M
				</button>
				<button
					style={chartLength === chartL.m3 ? {background: "var(--color)"} : {}}
					onClick={(e) => setChertLength(chartL.m3)}
				>
					3M
				</button>
				<button
					style={chartLength === chartL.m6 ? {background: "var(--color)"} : {}}
					onClick={(e) => setChertLength(chartL.m6)}
				>
					6M
				</button>
				<button
					style={chartLength === chartL.y1 ? {background: "var(--color)"} : {}}
					onClick={(e) => setChertLength(chartL.y1)}
				>
					1Y
				</button>
				<button
					style={chartLength === chartL.y2 ? {background: "var(--color)"} : {}}
					onClick={(e) => setChertLength(chartL.y2)}
				>
					2Y
				</button>
				<button
					style={chartLength === chartL.y5 ? {background: "var(--color)"} : {}}
					onClick={(e) => setChertLength(chartL.y5)}
				>
					5Y
				</button>
			</div>
			<div className="stock-b-graf" ref={svgDiv}>
				{!chartData ? (
					<div
						style={{
							width: "100%",
							height: "100%",
							display: "flex",
							justifyContent: "center",
							alignItems: "center"
						}}
					>
						<div
							style={{
								width: "10%"
							}}
						>
							<Spinner />
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}
