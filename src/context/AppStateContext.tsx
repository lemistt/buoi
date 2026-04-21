import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
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
	country: string;
	setCountry: (v: string) => void;
	county: string;
	setCounty: (v: string) => void;
	holidays: Holiday[];
	loading: boolean;
	error: string | null;
}

export interface Holiday {
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

interface LocalStorageState {
	hoursPerMonth: MonthsMap;
	hoursGoal: number;
	daysLeft: number;
	country: string;
	county: string;
}

type ApiError = {
	detail: null | string;
	instance: null | string;
	status: null | number;
	title: null | string;
	type: null | string;
};

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

	const [daysLeft, setDaysLeft] = useState<number>(() => {
		if (typeof saved?.daysLeft === "number") return saved.daysLeft;
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
			country,
			county,
		};
		localStorage.setItem("appState", JSON.stringify(state));
	}, [hoursPerMonth, hoursGoal, daysLeft, country, county]);

	useEffect(() => {
		if (!country || country.length !== 2) return; // Skip if dependencies are not set
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

		fetchData();
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
				setDaysLeft,
				country,
				setCountry,
				county,
				setCounty,
				holidays,
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
