import {
	useEffect,
	useState,
} from "react";
import {
	CircleMarker,
	MapContainer,
	TileLayer,
	Tooltip,
} from "react-leaflet";
import {
	CountrySelect,
	GetCountries,
	GetState,
	StateSelect,
} from "react-country-state-city";
import type { Country, State } from "react-country-state-city/dist/esm/types";
import { useAppState } from "../../context/AppStateContext.tsx";

function getCoordinates(
	location: Country | State | undefined,
): [number, number] | undefined {
	if (!location?.latitude?.trim() || !location.longitude?.trim()) return;

	const coordinates: [number, number] = [
		Number(location.latitude),
		Number(location.longitude),
	];
	return coordinates.every(Number.isFinite) ? coordinates : undefined;
}

function getGeocodedCoordinates(value: unknown): [number, number] | undefined {
	if (!Array.isArray(value) || typeof value[0] !== "object" || !value[0]) {
		return;
	}

	const result = value[0];
	if (!("lat" in result) || !("lon" in result)) return;
	if (typeof result.lat !== "string" || typeof result.lon !== "string") return;

	const coordinates: [number, number] = [Number(result.lat), Number(result.lon)];
	return coordinates.every(Number.isFinite) ? coordinates : undefined;
}

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
	const stateCenter = getCoordinates(selectedState);
	const countryCenter = getCoordinates(selectedCountry);
	const stateKey =
		selectedCountry && selectedState
			? `${selectedCountry.iso2}-${selectedState.state_code}`
			: "";
	const [geocodedState, setGeocodedState] = useState<{
		key: string;
		center: [number, number];
	}>();
	const [stateLookupStatus, setStateLookupStatus] = useState<
		"loading" | "unavailable" | undefined
	>();
	const geocodedCenter =
		geocodedState?.key === stateKey ? geocodedState.center : undefined;
	const mapCenter = stateCenter ?? geocodedCenter ?? countryCenter;
	const mapLocation =
		stateCenter || geocodedCenter ? selectedState : selectedCountry;
	const mapKey = `${selectedCountry?.iso2}-${selectedState?.state_code ?? ""}-${mapCenter?.join(",")}`;
	const showingCountryCenterForState = Boolean(
		selectedState && !stateCenter && !geocodedCenter,
	);

	useEffect(() => {
		if (!selectedCountry || !selectedState || stateCenter) {
			setStateLookupStatus(undefined);
			return;
		}

		const controller = new AbortController();
		const query = new URLSearchParams({
			q: `${selectedState.name}, ${selectedCountry.name}`,
			format: "jsonv2",
			limit: "1",
			featuretype: "state",
		});
		setStateLookupStatus("loading");

		fetch(`https://nominatim.openstreetmap.org/search?${query}`, {
			headers: { Accept: "application/json" },
			signal: controller.signal,
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(`State lookup failed with status ${response.status}`);
				}
				return response.json() as Promise<unknown>;
			})
			.then((result) => {
				const center = getGeocodedCoordinates(result);
				if (center) {
					setGeocodedState({ key: stateKey, center });
					setStateLookupStatus(undefined);
				} else {
					setStateLookupStatus("unavailable");
				}
			})
			.catch((error: unknown) => {
				if (controller.signal.aborted) return;
				console.error("Unable to find coordinates for the selected state.", error);
				setStateLookupStatus("unavailable");
			});

		return () => controller.abort();
	}, [selectedCountry?.name, selectedState?.name, stateCenter, stateKey]);

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
			{selectedCountry && (
				<section className="selection-map" aria-label="Selected location map">
					<h2>
						{selectedState
							? `${selectedState.name}, ${selectedCountry.name}`
							: selectedCountry.name}
					</h2>
					{mapCenter && mapLocation ? (
						<MapContainer
							key={mapKey}
							center={mapCenter}
							zoom={stateCenter || geocodedCenter ? 10 : 4}
							scrollWheelZoom={false}
							aria-label={`Map showing ${mapLocation.name}`}
						>
							<TileLayer
								attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
								url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
							/>
							<CircleMarker center={mapCenter} radius={8}>
								<Tooltip permanent>{mapLocation.name}</Tooltip>
							</CircleMarker>
						</MapContainer>
					) : (
						<p>Map coordinates are unavailable for this selection.</p>
					)}
					{stateLookupStatus === "loading" && (
						<p>Locating the selected state...</p>
					)}
					{showingCountryCenterForState &&
						stateLookupStatus === "unavailable" && (
							<p>
								Unable to locate the selected state; showing the country center.
							</p>
						)}
				</section>
			)}
		</div>
	);
}
