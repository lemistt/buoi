import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {countDaysLeft, getDefaultExcludedDates, months} from "../util/date-util.ts";
import type {Holiday} from "../models/Holiday.ts";

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
	country: string;
	setCountry: (v: string) => void;
	county: string;
	setCounty: (v: string) => void;
	holidays: Holiday[];
	excludedDates: Set<string>;
	setExcludedDates: (v: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
	loading: boolean;
	error: string | null;
}

interface LocalStorageState {
	hoursPerMonth: MonthsMap;
	hoursGoal: number;
	daysLeft: number;
	country: string;
	county: string;
	excludedDates: string[];
}

const initialHoursPerMonth: MonthsMap = months.reduce((acc, m) => {
	acc[m] = 0;
	return acc;
}, {} as MonthsMap);

const AppStateContext = createContext<AppState | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
	const saved: LocalStorageState = useMemo(() => {
		try {
			const raw = localStorage.getItem("appState");
			return raw ? JSON.parse(raw) : null;
		} catch {
			return null;
		}
	}, []);
	const [hoursPerMonth, setHoursPerMonth] = useState<MonthsMap>(() => {
		if (saved?.hoursPerMonth && typeof saved.hoursPerMonth === "object") {
			return { ...initialHoursPerMonth, ...saved.hoursPerMonth } as MonthsMap;
		}
		return initialHoursPerMonth;
	});
	const [hoursGoal, setHoursGoal] = useState<number>(() => {
		if (typeof saved?.hoursGoal === "number") return saved.hoursGoal;
		return 0;
	});


	const [country, setCountry] = useState(() => saved?.country || "");
	const [county, setCounty] = useState(() => saved?.county || "");

	const [apiData, setApiData] = useState<Holiday[]>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const holidays = useMemo<Holiday[]>(() => {
		if (!county || !apiData) return [];
		return apiData.filter((h) => {
			if (!h.counties || h.counties.length === 0) return true;
			return h.counties
				.map((county) => {
					return county.substring(3, 5).toLowerCase();
				})
				.includes(county.toLowerCase());
		});
	}, [apiData, county]);

	const [excludedDates, setExcludedDates] = useState<Set<string>>(() => {
		if (saved?.excludedDates && Array.isArray(saved.excludedDates)) {
			return new Set(saved.excludedDates);
		}
		return getDefaultExcludedDates(new Date().getFullYear(), []);
	});

	const today = useMemo(() => new Date(), []);

	const { totalHours, remainingHours, perDayTarget, daysLeft } = useMemo(() => {
		const total = Object.values(hoursPerMonth).reduce((s, v) => s + v, 0);
		const remaining = Math.max(0, hoursGoal - total);
		const daysLeft = countDaysLeft(today, excludedDates);
		const perDay = daysLeft > 0 ? remaining / daysLeft : remaining > 0 ? Infinity : 0;
		return {
			totalHours: total,
			remainingHours: remaining,
			perDayTarget: perDay,
			daysLeft: daysLeft
		};
	}, [hoursPerMonth, hoursGoal, excludedDates, today]);

	useEffect(() => {
		const state: LocalStorageState = {
			hoursPerMonth,
			hoursGoal,
			daysLeft,
			country,
			county,
			excludedDates: Array.from(excludedDates),
		};
		localStorage.setItem("appState", JSON.stringify(state));
	}, [hoursPerMonth, hoursGoal, daysLeft, country, county, excludedDates]);

	useEffect(() => {
		setExcludedDates((prev) => {
			const newSet = new Set(prev);
			for (const holiday of holidays) {
				newSet.add(holiday.date);
			}
			return newSet;
		});
	}, [holidays]);

	useEffect(() => {
		if (!country || country.length !== 2) return;
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const response = await fetch(
					`https://date.nager.at/api/v3/publicholidays/${today.getFullYear()}/${country}`,
				);
				if (!response.ok) throw new Error("API request failed");
				const data = await response.json();
				setApiData(data);
			} catch (err: any) {
				setError(err.detail);
			} finally {
				setLoading(false);
			}
		};

		fetchData().then();
	}, [country, today.getFullYear]);

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
				country,
				setCountry,
				county,
				setCounty,
				holidays,
				excludedDates,
				setExcludedDates,
				loading,
				error,
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

