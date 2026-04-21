import { useAppState } from "../../context/AppStateContext.tsx";
import {CountryDropdown, RegionDropdown} from "react-country-region-selector";

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

	return (
		<div className="flex flex-col gap-4 items-center">
			<div className="flex items-center gap-4">
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
				<div className="flex gap-4">
					<CountryDropdown className="select w-3xs" value={country} valueType="short" onChange={setCountry} />
					<RegionDropdown
						className="select w-3xs"
						country={country}
						countryValueType="short"
						valueType="short"
						value={county}
						onChange={(val) => setCounty(val)}
					/>
				</div>
			</div>
			<div className="progress-bar flex items-center gap-4">
				<span>Progress: </span>
				<div className="flex gap-4">
					<progress value={totalHours} max={hoursGoal} />
					<span>
							{totalHours} / {hoursGoal} (
						{(hoursGoal ? (totalHours / hoursGoal) * 100 : 0).toFixed(2)} %)
						</span>
				</div>
			</div>
		</div>
	);
}
