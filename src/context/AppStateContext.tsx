import {
	createContext,
	type ReactNode,
	useContext, useEffect,
	useMemo,
	useState,
} from "react";

type MonthsMap = Record<string, number>;

interface AppState {
	hoursPerMonth: MonthsMap;
	setHoursPerMonth: (
		updater: MonthsMap | ((prev: MonthsMap) => MonthsMap),
	) => void;
	totalHours: number;
	remainingHours: number;
	perDayTarget: number;
	hoursGoal: number;
	setHoursGoal: (v: number) => void;
	daysLeft: number;
	setDaysLeft: (d: number) => void;
}

interface Holiday {
	date: string;
	localName: string;
	name: string;
	countryCode: string;
	fixed: boolean;
	global: boolean;
	counties?: string[] | null;
	launchYear?: number | null;
	types: string[];
}

const months = [
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

const initialHoursPerMonth: MonthsMap = months.reduce((acc, m) => {
	acc[m] = 0;
	return acc;
}, {} as MonthsMap);

function countDaysLeft(start: Date, daysLeft: number) {
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

const AppStateContext = createContext<AppState | undefined>(undefined);

interface LocalStorageState {
	hoursPerMonth: MonthsMap;
	hoursGoal: number;
	daysLeft: number;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
	const saved: LocalStorageState = useMemo(() => {
		try {
			const raw = localStorage.getItem("appState");
			return raw ? JSON.parse(raw) : null;
		} catch {
			return null;
		}
	}, []);
	const [hoursPerMonth, setHoursPerMonth] =
		useState<MonthsMap>(() => {
			if (saved?.hoursPerMonth && typeof saved.hoursPerMonth === "object") {
				return { ...initialHoursPerMonth, ...saved.hoursPerMonth };
			}
			return initialHoursPerMonth;
		});
	const [hoursGoal, setHoursGoal] = useState<number>(() => {
		if (typeof saved?.hoursGoal === "number") return saved.hoursGoal;
		return 0;
	});

	const [daysLeft, setDaysLeft] = useState<number>(() => {
		if (typeof saved?.daysLeft === "number") return saved.daysLeft;
		return 0;
	});

	const today = useMemo(() => new Date(), []);

	const { totalHours, remainingHours, perDayTarget } = useMemo(() => {
		const total = Object.values(hoursPerMonth).reduce((s, v) => s + v, 0);
		const remaining = Math.max(0, hoursGoal - total);
		const days = countDaysLeft(today, daysLeft);
		const perDay = days > 0 ? remaining / days : remaining > 0 ? Infinity : 0;
		return {
			totalHours: total,
			remainingHours: remaining,
			perDayTarget: perDay,
		};
	}, [hoursPerMonth, hoursGoal, daysLeft, today]);

	useEffect(() => {
		const state: LocalStorageState = {
			hoursPerMonth,
			hoursGoal,
			daysLeft,
		};
		localStorage.setItem("appState", JSON.stringify(state));
	}, [hoursPerMonth, hoursGoal, daysLeft]);

	return (
		<AppStateContext.Provider
			value={{
				hoursPerMonth,
				setHoursPerMonth,
				totalHours,
				remainingHours,
				perDayTarget,
				hoursGoal,
				setHoursGoal,
				daysLeft,
				setDaysLeft,
			}}
		>
			{children}
		</AppStateContext.Provider>
	);
}

export function useAppState() {
	const ctx = useContext(AppStateContext);
	if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
	return ctx;
}
