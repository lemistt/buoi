import { useAppState } from "../../context/AppStateContext.tsx";

export default function DataInput({ month }: { month: string }) {
	const { hoursPerMonth, setHoursPerMonth } = useAppState();

	const updateMonth = (month: string, value: string) => {
		const num = Number(value) || 0;
		setHoursPerMonth((prev) => ({ ...prev, [month]: num }));
	};

	return (
		<label className="month-input">
			<span>Hours worked</span>
			<input
				type="number"
				className="input input-bordered"
				min={0}
				value={Number(hoursPerMonth[month] ?? 0).toString()}
				onChange={(e) => updateMonth(month, e.target.value)}
				aria-label={`Hours worked in ${month}`}
			/>
		</label>
	);
}
