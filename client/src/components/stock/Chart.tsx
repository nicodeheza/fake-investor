import {useEffect, useRef, useState} from "react";
import {API_URL} from "../../consts";
import chartMock from "./chartMock";
import * as d3 from "d3";

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

export default function Chart({symbol}: chart) {
	const [charData, setChartData] = useState<chartData | undefined>();
	const [grafDimensions, setGrafDimensions] = useState<grafDim | undefined>();
	const svgEle = useRef<HTMLDivElement>(null!);
	//fetch Data
	useEffect(() => {
		if (symbol) {
			// fetch(`${API_URL}/stock/chart/${symbol}`)
			// 	.then((res) => res.json())
			// 	.then((data) => {
			// 		console.log(data);
			// 		setChartData(data);
			// 	})
			// 	.catch((err) => console.log(err));
			setChartData(chartMock);
		}
	}, [symbol]);

	//get svg dimensions
	useEffect(() => {
		function getDim() {
			const width = svgEle.current.clientWidth;
			const height = svgEle.current.clientHeight;
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
		if (charData && grafDimensions !== undefined) {
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

			d3.select("#chartG").remove();
			d3.select(".tooltip-stock").remove();

			const svg = d3
				.select(svgEle.current)
				.append("svg")
				.attr("width", w + margin.left + margin.right)
				.attr("height", h + margin.top + margin.bottom)
				.append("g")
				.attr("id", "chartG")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			//x scales
			const scaleX = d3
				.scaleLinear()
				.domain([-1, charData.timestamp.length])
				.range([0, w]);
			const xBand = d3
				.scaleBand()
				.domain(charData.timestamp.map((d) => new Date(d).toString()))
				.range([0, w])
				.padding(0.15);

			//y scale
			const yMax = d3.max(charData.high) || 0;
			const yMin = d3.min(charData.low) || 0;
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
			const xAxis = d3.axisBottom(scaleX).tickFormat((d, i) => {
				const dd = parseInt(d.toString());
				const date = new Date(charData.timestamp[dd]);
				let lastDate;
				if (i > 0) {
					lastDate = new Date(charData.timestamp[ld[ld.length - 1]]);
				}
				ld.push(dd);
				const day = date.getDate();
				if (dd > 0 && dd < charData.timestamp.length) {
					return lastDate &&
						lastDate.getFullYear() === date.getFullYear() &&
						lastDate.getMonth() === date.getMonth()
						? day.toString()
						: month[date.getMonth()] + " " + date.getFullYear().toString();
				} else {
					return "";
				}
			});
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
				.select(svgEle.current) // cambiar para que se haga un append del svg
				.append("div")
				// .style("opacity", 0)
				// .attr("id", "div_template")
				.style("opacity", 0)
				.attr("class", "tooltip-stock")
				.style("background-color", "var(--color)")
				.style("border-radius", "5px")
				.style("padding", "5px")
				.style("position", "absolute")
				.style("top", "0px")
				.style("left", "0px")
				.style("display", "block")
				.style("z-index", 99999999999999);

			const mouseover = function (this: SVGRectElement, e: any, d: number) {
				console.log("over");
				tooltip.style("opacity", 1).style("display", "block");
			};
			const mousemove = function (this: SVGRectElement, e: any, d: number) {
				console.log(d3.pointer(e), e.pageX);
				tooltip
					// 	.html(
					// 		`<ul>
					//   <li>Date: ${"bla"}</li>
					//   <li></li>
					//   <li></li>
					//   <li></li>
					//   <li></li>
					//   </ul>`
					// 	)
					.html("The exact value of<br>this cell is: " + d)
					.style("left", d3.pointer(e)[0] + 40 + "px")
					.style("top", d3.pointer(e)[1] + 20 + "px")
					.style("background-color", "red");
			};
			const mouseleave = function (this: SVGRectElement, e: any, d: number) {
				console.log("leave");
				tooltip.style("opacity", 0).style("display", "none");
			};

			// draw rectangles
			const candels = chartBody
				.selectAll(".candel")
				.data(charData.open)
				.enter()
				.append("rect")
				.attr("x", (d, i) => scaleX(i) - xBand.bandwidth())
				.attr("y", (d, i) => scaleY(Math.max(d, charData.close[i])))
				.attr("width", xBand.bandwidth())
				.attr("height", (d, i) =>
					d === charData.close[i]
						? 1
						: scaleY(Math.min(d, charData.close[i])) -
						  scaleY(Math.max(d, charData.close[i]))
				)
				.style("fill", (d, i) => (d <= charData.close[i] ? "var(--green)" : "var(--red)"))
				.on("mouseover", mouseover)
				.on("mousemove", mousemove)
				.on("mouseleave", mouseleave);

			// draw high and low
			const stems = chartBody
				.selectAll("g.line")
				.data(charData.high)
				.enter()
				.append("line")
				.attr("x1", (d, i) => scaleX(i) - xBand.bandwidth() / 2)
				.attr("x2", (d, i) => scaleX(i) - xBand.bandwidth() / 2)
				.attr("y1", (d) => scaleY(d))
				.attr("y2", (d, i) => scaleY(charData.low[i]))
				.style("stroke", (d, i) =>
					charData.open[i] <= charData.close[i] ? "var(--green)" : "var(--red)"
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

				const ld: number[] = [];
				gX.call(
					d3.axisBottom(xScaleZ).tickFormat((d, i) => {
						const dd = parseInt(d.toString());
						const date = new Date(charData.timestamp[dd]);
						let lastDate;
						if (i > 0) {
							lastDate = new Date(charData.timestamp[ld[ld.length - 1]]);
						}
						ld.push(dd);
						const day = date.getDate();
						if (dd > 0 && dd < charData.timestamp.length) {
							return lastDate &&
								lastDate.getFullYear() === date.getFullYear() &&
								lastDate.getMonth() === date.getMonth()
								? day.toString()
								: month[date.getMonth()] + " " + date.getFullYear().toString();
						} else {
							return "";
						}
					})
				);

				gX.selectAll(".tick text").call(wrap, xBand.bandwidth());

				gY.call(d3.axisLeft(yScaleZ));

				candels
					.attr("x", (d, i) => xScaleZ(i) - (xBand.bandwidth() * t.k) / 2)
					.attr("width", xBand.bandwidth() * t.k)
					.attr("y", (d, i) => yScaleZ(Math.max(charData.open[i], charData.close[i])))
					.attr("height", (d, i) =>
						charData.open[i] === charData.close[i]
							? 1
							: yScaleZ(Math.min(charData.open[i], charData.close[i])) -
							  yScaleZ(Math.max(charData.open[i], charData.close[i]))
					);

				stems.attr(
					"x1",
					(d, i) => xScaleZ(i) - xBand.bandwidth() / 2 + xBand.bandwidth() * 0.5
				);
				stems.attr(
					"x2",
					(d, i) => xScaleZ(i) - xBand.bandwidth() / 2 + xBand.bandwidth() * 0.5
				);
				stems.attr("y1", (d, i) => yScaleZ(charData.high[i]));
				stems.attr("y2", (d, i) => yScaleZ(charData.low[i]));
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
			//.on("zoom.end", zoomed);

			svg.call(zoom);
			// .call(zoom.transform, d3.zoomIdentity.translate(w - 100, 0).scale(10));
		}
	}, [charData, grafDimensions]);

	return (
		<>
			<div className="stock-b-graf" ref={svgEle}></div>
		</>
	);
}
