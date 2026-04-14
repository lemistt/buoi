import { useAppState } from "../../context/AppStateContext.tsx";

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

// TODO: Get country and county for holidays

export default function DataInput() {
	const { hoursPerMonth, setHoursPerMonth } = useAppState();

	const updateMonth = (month: string, value: string) => {
		const num = Number(value) || 0;
		setHoursPerMonth((prev) => ({ ...prev, [month]: num }));
	};

	return (
		<>
			<div className="grid grid-cols-3 gap-4 flex-1">
				{months.map((month) => (
					<div className="collapse bg-base-100 border-base-300 border">
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
		</>
	);
}
