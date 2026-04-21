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
				<div className="progress-bar flex gap-4">
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
			<div className="flex items-center gap-4">
				<label className={"input"}>
					<span className={"label"}>Country</span>
					<input
						type="text"
						value={country}
						minLength={2}
						maxLength={2}
						onChange={(e) => setCountry(e.target.value)}
					/>
				</label>
				<label className={"input"}>
					<span className={"label"}>County</span>
					<input
						type="text"
						value={county}
						minLength={2}
						maxLength={2}
						onChange={(e) => setCounty(e.target.value)}
					/>
				</label>
			</div>
		</div>
	);
}
