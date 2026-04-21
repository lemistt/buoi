import "react-calendar/dist/Calendar.css";
import "./calendar-extended.css";
import { useState } from "react";
import Calendar from "react-calendar";
import type { Value } from "react-calendar/src/shared/types.ts";
import { useAppState } from "../../context/AppStateContext.tsx";
import { getDefaultExcludedDates, toKey } from "../../util/date-util.ts";

function CalendarExtended() {
	const { holidays, excludedDates, setExcludedDates } = useAppState();
	const [date, setDate] = useState(new Date());

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const endOfYear = new Date(today.getFullYear(), 11, 31);

	const toggleDate = (clickedDate: Date) => {
		const key = toKey(clickedDate);

		setExcludedDates((prev) => {
			const next = new Set(prev);
			if (next.has(key)) {
				next.delete(key);
			} else {
				next.add(key);
			}
			return next;
		});
	};

	const resetDays = () => {
		setExcludedDates(
			getDefaultExcludedDates(new Date().getFullYear(), holidays),
		);
	};

	return (
		<div>
			<button type="button" className="btn" onClick={resetDays}>
				Reset Days
			</button>
			<Calendar
				value={date}
				maxDate={endOfYear}
				onChange={(d: Value) => {
					if (d instanceof Date) {
						setDate(d);
						toggleDate(d);
					}
				}}
				tileClassName={({ date, view }) => {
					if (view !== "month") return null;

					const key = toKey(date);
					if (excludedDates.has(key)) {
						return "excluded-day";
					}
				}}
				tileDisabled={({ date, view }) => view === "month" && date < today}
			/>
		</div>
	);
}

export default CalendarExtended;
