import "./App.css";
import CalendarExtended from "./components/calendar-extended/calendar-extended.tsx";
import DataInput from "./components/data-input/data-input.tsx";
import Header from "./components/header/header.tsx";
import Statistics from "./components/statistics/statistics.tsx";
import { AppStateProvider } from "./context/AppStateContext.tsx";

function App() {
	return (
		<div className="layout h-full">
			<header className="header">
				<h1 className="title">Buoi</h1>
			</header>
			<AppStateProvider>
				<main className="body">
					<section className="flex justify-center">
						<Header />
					</section>
					<section className="flex justify-evenly gap-8 flex-1 items-center w-full">
						<div className="flex flex-col flex-1  items-center gap-4">
							<CalendarExtended />
							<Statistics />
						</div>
						<DataInput />
					</section>
				</main>
			</AppStateProvider>
			<footer className="footer">Footer</footer>
		</div>
	);
}

export default App;
