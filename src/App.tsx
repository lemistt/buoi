import "./App.css";
import { useState } from "react";
import CalendarExtended from "./components/calendar-extended/calendar-extended.tsx";
import DataInput from "./components/data-input/data-input.tsx";
import Header from "./components/header/header.tsx";
import Statistics from "./components/statistics/statistics.tsx";
import { AppStateProvider } from "./context/AppStateContext.tsx";
import { months } from "./util/date-util.ts";

function App() {
	const [firstMonth, setFirstMonth] = useState(0);

	return (
		<div className="layout h-full">
			<header className="header">
				<h1 className="title">Buoi</h1>
			</header>
			<AppStateProvider>
				<main className="body">
					<section className="settings">
						<Header />
					</section>
					<section className="desk" aria-label="Monthly planner">
						<button
							type="button"
							className="page-arrow"
							aria-label="Show previous months"
							onClick={() => setFirstMonth((month) => Math.max(0, month - 2))}
							disabled={firstMonth === 0}
						>
							<span aria-hidden="true">‹</span>
						</button>
						<div className="notebook">
							<div className="notebook-pages">
								{months.slice(firstMonth, firstMonth + 2).map((month) => (
									<article className="notebook-page" key={month}>
										<h2>{month}</h2>
										<CalendarExtended month={month} />
										<DataInput month={month} />
									</article>
								))}
							</div>
						</div>
						<button
							type="button"
							className="page-arrow"
							aria-label="Show next months"
							onClick={() =>
								setFirstMonth((month) => Math.min(months.length - 2, month + 2))
							}
							disabled={firstMonth >= months.length - 2}
						>
							<span aria-hidden="true">›</span>
						</button>
						<div className="notebook-summary">
							<Statistics />
						</div>
					</section>
				</main>
			</AppStateProvider>
			<footer className="footer">Footer</footer>
		</div>
	);
}

export default App;
