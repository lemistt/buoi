import {
	useEffect,
	useState,
} from "react";
import {
	CountrySelect,
	GetCountries,
	GetState,
	StateSelect,
} from "react-country-state-city";
import type { Country, State } from "react-country-state-city/dist/esm/types";
import { useAppState } from "../../context/AppStateContext.tsx";

export default function Header() {
	const {
		totalHours,
		hoursGoal,
		country,
		county,
		setCounty,
		setCountry,
		setHoursGoal,
	} = useAppState();
	const [selectedCountry, setSelectedCountry] = useState<Country>();
	const [selectedState, setSelectedState] = useState<State>();

	useEffect(() => {
		if (
			!country ||
			selectedCountry?.iso2.toLowerCase() === country.toLowerCase()
		) {
			return;
		}

		let cancelled = false;
		GetCountries()
			.then((countries) => {
				if (cancelled) return;
				setSelectedCountry(
					countries.find(
						(option) => option.iso2.toLowerCase() === country.toLowerCase(),
					),
				);
			})
			.catch((error: unknown) => {
				if (!cancelled) {
					console.error("Unable to restore the saved country selection.", error);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [country, selectedCountry?.iso2]);

	useEffect(() => {
		if (
			!selectedCountry ||
			!county ||
			selectedState?.state_code.toLowerCase() === county.toLowerCase()
		) {
			return;
		}

		let cancelled = false;
		GetState(selectedCountry.id)
			.then((states) => {
				if (cancelled) return;
				setSelectedState(
					states.find(
						(option) =>
							option.state_code.toLowerCase() === county.toLowerCase(),
					),
				);
			})
			.catch((error: unknown) => {
				if (!cancelled) {
					console.error("Unable to restore the saved state selection.", error);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [selectedCountry?.id, county, selectedState?.state_code]);

	return (
		<div className="flex flex-col gap-4 items-center">
			<div className="flex flex-col sm:flex-row items-center gap-4 w-full">
				<div>
					<label className={"input"}>
						<span className={"label"}>Year Target:</span>
						<input
							type="number"
							className="input"
							min={0}
							value={Number(hoursGoal).toString()}
							onChange={(e) => setHoursGoal(Number(e.target.value) || 0)}
						/>
					</label>
				</div>
				<div className="flex flex-col sm:flex-row gap-4 w-full">
					<CountrySelect
						containerClassName="form-group w-full sm:w-56"
						inputClassName="w-full border-0 bg-transparent p-0 shadow-none outline-none"
						defaultValue={selectedCountry as any}
						aria-label="Country"
						onChange={(value: any) => {
							const countryValue = value as Country;
							setSelectedCountry(countryValue);
							if (countryValue.iso2.toLowerCase() !== country.toLowerCase()) {
								setSelectedState(undefined);
								setCounty("");
							}
							setCountry(countryValue.iso2);
						}}
						placeHolder="Select Country"
					/>
					<StateSelect
						key={selectedCountry?.id ?? "no-country"}
						countryid={selectedCountry?.id ?? 0}
						containerClassName="form-group w-full sm:w-56"
						inputClassName="w-full border-0 bg-transparent p-0 shadow-none outline-none"
						defaultValue={selectedState as any}
						aria-label="State or province"
						disabled={!selectedCountry}
						onChange={(value: any) => {
							const stateValue = value as State;
							setSelectedState(stateValue);
							setCounty(stateValue.state_code);
						}}
						placeHolder="Select State"
					/>
				</div>
			</div>
			<div className="progress-bar flex items-center gap-4">
				<span>Progress: </span>
				<div className="flex gap-4">
					<progress value={totalHours} max={hoursGoal}/>
					<span>
						{totalHours} / {hoursGoal} (
						{(hoursGoal ? (totalHours / hoursGoal) * 100 : 0).toFixed(2)} %)
					</span>
				</div>
			</div>
		</div>
	);
}
