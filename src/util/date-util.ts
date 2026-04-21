import type { Holiday } from "../models/Holiday.ts";

export const months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

export function toKey(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function getDefaultExcludedDates(
	year: number,
	holidays: Holiday[],
): Set<string> {
	const excluded = new Set<string>();
	const date = new Date(year, 0, 1);

	while (date.getFullYear() === year) {
		if (isWeekend(date) || isHoliday(date, holidays)) {
			excluded.add(toKey(date));
		}
		date.setDate(date.getDate() + 1);
	}
	return excluded;
}

export function countDaysLeft(startDate: Date, excludedDates: Set<string>) {
	const start = new Date(startDate.toString());
	start.setHours(0, 0, 0, 0);

	const end = new Date(start.getFullYear(), 11, 31);
	end.setHours(23, 59, 59, 999);

	let count = 0;
	const current = new Date(start.toString());

	while (current <= end) {
		const key = toKey(current);
		if (!excludedDates.has(key)) {
			count++;
		}
		current.setDate(current.getDate() + 1);
	}

	return count;
}

/*
export function countDaysLeft(start: Date, daysLeft: number) {
    let count = 0;
    const current = new Date(start);

    while (count < daysLeft) {
        current.setDate(current.getDate() + 1);
        const day = current.getDay();
        if (day !== 0 && day !== 6) {
            count++;
        }
    }

    return count;
}
*/

function isWeekend(date: Date) {
	const day = date.getDay();
	return day === 0 || day === 6; // Sunday (0) or Saturday (6)
}

function isHoliday(date: Date, holidays: Holiday[]) {
	const dateKey = toKey(date);
	return holidays.some((h) => h.date === dateKey);
}
