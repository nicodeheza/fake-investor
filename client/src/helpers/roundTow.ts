export default function roundTow(num: number) {
	return Math.round((num + Number.EPSILON) * 100) / 100;
}
