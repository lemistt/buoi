import { useAppState } from "../../context/AppStateContext";

export default function Statistics() {
	const { totalHours, remainingHours, perDayTarget, daysLeft, hoursGoal } =
		useAppState();
	const progress = hoursGoal
		? Math.min((totalHours / hoursGoal) * 100, 100)
		: 0;

	return (
		<section className="eink-screen">
			<p className="eink-kicker">BUOI · YEARLY PLAN</p>
			<h2>Progress</h2>
			<div className="eink-progress">
				<div className="eink-progress-label">
					<strong>{progress.toFixed(0)}%</strong>
					<span>
						{totalHours} / {hoursGoal} hrs
					</span>
				</div>
				<progress value={totalHours} max={hoursGoal} />
			</div>
			<dl className="eink-stats">
				<div>
					<dt>Remaining</dt>
					<dd>{remainingHours} hrs</dd>
				</div>
				<div>
					<dt>Days left</dt>
					<dd>{daysLeft}</dd>
				</div>
				<div>
					<dt>Daily target</dt>
					<dd>
						{perDayTarget === Infinity ? "—" : `${perDayTarget.toFixed(2)} hrs`}
					</dd>
				</div>
			</dl>
			<p className="eink-footer">Keep going, one day at a time.</p>
		</section>
	);
}
