import { useAppState } from "../../context/AppStateContext.tsx";
import { months } from "../../util/date-util.ts";

export default function DataInput() {
	const { hoursPerMonth, setHoursPerMonth } = useAppState();

	const updateMonth = (month: string, value: string) => {
		const num = Number(value) || 0;
		setHoursPerMonth((prev) => ({ ...prev, [month]: num }));
	};

	return (
		<div className="flex flex-col flex-1 gap-4 h-100 overflow-auto">
			{months.map((month) => (
				<div
					key={month}
					className="collapse bg-base-100 border-base-300 border shrink-0"
				>
					<input type="checkbox" />
					<div className="collapse-title font-semibold">{month}</div>
					<div className="collapse-content text-sm">
						<label className={"input"}>
							<span className={"label"}>Worked so far:</span>
							<input
								type="number"
								className="input input-bordered w-full"
								min={0}
								value={Number(hoursPerMonth[month] ?? 0).toString()}
								onChange={(e) => updateMonth(month, e.target.value)}
							/>
						</label>
					</div>
				</div>
			))}
		</div>
	);
}
