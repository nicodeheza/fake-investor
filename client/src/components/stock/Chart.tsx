import {useEffect, useRef, useState} from "react";
import {API_URL} from "../../consts";
import * as d3 from "d3";
import {D3ZoomEvent} from "d3";

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
	const svgEle = useRef<SVGSVGElement>(null!);
	//fetch Data
	useEffect(() => {
		if (symbol) {
			fetch(`${API_URL}/stock/chart/${symbol}`)
				.then((res) => res.json())
				.then((data) => {
					console.log(data);
					setChartData(data);
				})
				.catch((err) => console.log(err));
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
			const svg = d3
				.select(svgEle.current)
				.attr("viewBox", [0, 0, grafDimensions.w, grafDimensions.h]);
			const scaleX = d3
				.scaleTime()
				.range([0, grafDimensions.w])
				.domain([d3.min(charData.timestamp) || 0, d3.max(charData.timestamp) || 0]);

			const yMax = d3.max(charData.high);
			const scaleY = d3
				.scaleLinear()
				.range([0, grafDimensions.h])
				.nice()
				.domain([0, yMax || 0]);

			const clip = svg
				.append("defs")
				.append("SVG:clipPath")
				.attr("id", "clip")
				.append("SVG:rect")
				.attr("width", grafDimensions.w)
				.attr("height", grafDimensions.h)
				.attr("x", 0)
				.attr("y", 0);

			const line = svg.append("g").attr("clip-path", "url(#clip)");
			line
				.selectAll("line")
				.data(charData.timestamp)
				.join("line")
				.attr("y1", (d, i) => scaleY(charData.high[i]))
				.attr("y2", (d, i) => scaleY(charData.low[i]))
				.attr("x1", (d) => scaleX(new Date(d)))
				.attr("x2", (d) => scaleX(new Date(d)))
				.style("stroke", (d, i) =>
					charData.close[i] < charData.open[i] ? "var(--red)" : "var(--green)"
				)
				.style("stroke-width", "1px");

			const rect = svg.append("g").attr("clip-path", "url(#clip)");
			rect
				.selectAll("rect")
				.data(charData.timestamp)
				.join("rect")
				.attr("x", (d) => scaleX(new Date(d)))
				.attr("y", (d, i) =>
					scaleY(
						charData.open[i] > charData.close[i] ? charData.open[i] : charData.close[i]
					)
				)
				.attr("width", (d, i) =>
					Math.abs(scaleX(charData.timestamp[1]) - scaleX(charData.timestamp[0]))
				)
				.attr("height", (d, i) => {
					const r = scaleY(Math.abs(charData.close[i] - charData.open[i]));
					return r < 0 ? 0 : r;
				})
				.style("fill", (d, i) =>
					charData.close[i] < charData.open[i] ? "var(--red)" : "var(--green)"
				);

			const zoom = d3
				.zoom<SVGRectElement, unknown>()
				.scaleExtent([1, 50])
				.extent([
					[0, 0],
					[grafDimensions.w, grafDimensions.h]
				])
				.on("zoom", (e) => {
					const newX = e.transform.rescaleX(scaleX);
					const newY = e.transform.rescaleY(scaleY);

					line
						.selectAll("line")
						.data(charData.timestamp)
						.join("line")
						.attr("y1", (d, i) => newY(charData.high[i]))
						.attr("y2", (d, i) => newY(charData.low[i]))
						.attr("x1", (d) => newX(new Date(d)))
						.attr("x2", (d) => newX(new Date(d)));

					rect
						.selectAll("rect")
						.data(charData.timestamp)
						.join("rect")
						.attr("x", (d) => newX(new Date(d)))
						// .attr("y", (d, i) =>
						// 	newY(
						// 		charData.open[i] > charData.close[i]
						// 			? charData.open[i]
						// 			: charData.close[i]
						// 	)
						// )
						.attr("y", (d, i) => {
							const o = newX(charData.open[i]);
							const c = newX(charData.close[i]);
							return o > c ? o : c;
						})
						.attr("width", (d) =>
							Math.abs(newX(charData.timestamp[1]) - newX(charData.timestamp[0]))
						)
						// .attr("width", 3)
						.attr("height", (d, i) => {
							const r = newY(Math.abs(charData.close[i] - charData.open[i]));
							return r < 0 ? 0 : r;
						});
				});

			svg
				.append("rect")
				.attr("width", grafDimensions.w)
				.attr("height", grafDimensions.h)
				.style("fill", "none")
				.style("pointer-events", "all")
				.call(zoom);
		}
	}, [charData, grafDimensions]);

	return (
		<>
			<svg className="stock-b-graf" ref={svgEle}></svg>
		</>
	);
}
