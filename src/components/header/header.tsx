import { useEffect, useState } from "react";
import {
	CountrySelect,
	GetCountries,
	GetState,
	StateSelect,
} from "react-country-state-city";
import type { Country, State } from "react-country-state-city/dist/esm/types";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
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

	const coordinates: [number, number] = [
		Number(result.lat),
		Number(result.lon),
	];
	return coordinates.every(Number.isFinite) ? coordinates : undefined;
}

export default function Header() {
	const { country, county, setCounty, setCountry } = useAppState();
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
				console.error(
					"Unable to find coordinates for the selected state.",
					error,
				);
				setStateLookupStatus("unavailable");
			});

		return () => controller.abort();
	}, [selectedCountry, selectedState, stateCenter, stateKey]);

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
					console.error(
						"Unable to restore the saved country selection.",
						error,
					);
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
	}, [selectedCountry, county, selectedState?.state_code]);

	return (
		<div className="planner-controls">
			<div className="smartphone">
				<div className="phone-speaker" aria-hidden="true" />
				<div className="phone-screen">
					<section className="selection-map" aria-label="Selected location map">
						{selectedCountry && mapCenter && mapLocation ? (
							<MapContainer
								key={mapKey}
								center={mapCenter}
								zoom={stateCenter || geocodedCenter ? 10 : 4}
								scrollWheelZoom={false}
								zoomControl={false}
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
							<div className="map-placeholder">
								Select a country to preview it on the map.
							</div>
						)}
						{stateLookupStatus === "loading" && (
							<p className="map-status">Locating the selected state...</p>
						)}
						{showingCountryCenterForState &&
							stateLookupStatus === "unavailable" && (
								<p className="map-status">
									Unable to locate the selected state; showing the country
									center.
								</p>
							)}
					</section>
					<div className="location-fields">
						<span className="location-field">
							<span>Country</span>
							<CountrySelect
								containerClassName="form-group"
								inputClassName="w-full border-0 bg-transparent p-0 shadow-none outline-none"
								defaultValue={selectedCountry as any}
								aria-label="Country"
								onChange={(value: any) => {
									const countryValue = value as Country;
									setSelectedCountry(countryValue);
									if (
										countryValue.iso2.toLowerCase() !== country.toLowerCase()
									) {
										setSelectedState(undefined);
										setCounty("");
									}
									setCountry(countryValue.iso2);
								}}
								placeHolder="Select Country"
							/>
						</span>
						<span className="location-field">
							<span>State or province</span>
							<StateSelect
								key={selectedCountry?.id ?? "no-country"}
								countryid={selectedCountry?.id ?? 0}
								containerClassName="form-group"
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
						</span>
					</div>
				</div>
				<div className="phone-home-button" aria-hidden="true" />
			</div>
		</div>
	);
}
