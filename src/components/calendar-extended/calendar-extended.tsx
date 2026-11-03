import "react-calendar/dist/Calendar.css";
import "./calendar-extended.css";
import Calendar from "react-calendar";
import type { Value } from "react-calendar/src/shared/types.ts";
import { useAppState } from "../../context/AppStateContext.tsx";
import {
	getDefaultExcludedDates,
	months,
	toKey,
} from "../../util/date-util.ts";

function CalendarExtended({ month }: { month: string }) {
	const { holidays, excludedDates, setExcludedDates } = useAppState();
	const monthIndex = months.indexOf(month);
	const year = new Date().getFullYear();
	const monthStart = new Date(year, monthIndex, 1);
	const monthEnd = new Date(year, monthIndex + 1, 0);

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
		<div className="month-calendar">
			<button type="button" className="btn" onClick={resetDays}>
				Reset Days
			</button>
			<Calendar
				defaultActiveStartDate={monthStart}
				maxDate={monthEnd < endOfYear ? monthEnd : endOfYear}
				minDate={monthStart}
				maxDetail="month"
				minDetail="month"
				showNavigation={false}
				showNeighboringMonth={false}
				onChange={(d: Value) => {
					if (d instanceof Date) {
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
