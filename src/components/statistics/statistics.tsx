import { useAppState } from "../../context/AppStateContext";

export default function Statistics() {
	const { totalHours, remainingHours, perDayTarget, daysLeft } = useAppState();

	return (
		<section>
			<div>
				<strong>Accumulation: </strong> {totalHours}
			</div>
			<div>
				<strong>Remaining Hours: </strong> {remainingHours}
			</div>
			<div>
				<strong>Remaining Days: </strong> {daysLeft}
			</div>
			<div>
				<strong>Average per Day:</strong>{" "}
				{perDayTarget === Infinity
					? "No business days left"
					: perDayTarget.toFixed(2)}
			</div>
		</section>
	);
}
