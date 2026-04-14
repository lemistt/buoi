import "react-calendar/dist/Calendar.css";
import "./calendar-extended.css";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { isWeekend } from "react-calendar/src/shared/dates.ts";
import type { Value } from "react-calendar/src/shared/types.ts";
import { useAppState } from "../../context/AppStateContext.tsx";

function CalendarExtended() {
	const { setDaysLeft } = useAppState();
	const [date, setDate] = useState(new Date());
	const [excludedDates, setExcludedDates] = useState(() =>
		getDefaultExcludedDates(new Date().getFullYear()),
	);

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const endOfYear = new Date(today.getFullYear(), 11, 31);

	useEffect(() => {
		setDaysLeft(countDaysLeft(today, excludedDates));
	}, [today, excludedDates, setDaysLeft]);

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

	return (
		<div>
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

const toKey = (date: Date) => date.toISOString().split("T")[0];

function countDaysLeft(
	startDate: string | number | Date,
	excludedDates: Set<unknown>,
) {
	const start = new Date(startDate);
	start.setHours(0, 0, 0, 0);

	const end = new Date(start.getFullYear(), 11, 31);
	end.setHours(23, 59, 59, 999);

	let count = 0;
	const current = new Date(start);

	while (current <= end) {
		const key = toKey(current);
		if (!excludedDates.has(key)) {
			count++;
		}
		current.setDate(current.getDate() + 1);
	}

	return count;
}

function getDefaultExcludedDates(year: number) {
	const excluded = new Set();
	const date = new Date(year, 0, 1);

	while (date.getFullYear() === year) {
		if (isWeekend(date)) {
			excluded.add(toKey(date));
		}
		date.setDate(date.getDate() + 1);
	}
	return excluded;
}

export default CalendarExtended;
