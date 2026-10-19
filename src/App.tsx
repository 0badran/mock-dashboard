import { Routes, Route, Navigate } from "react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import DashboardPage from "@/pages/DashboardPage";
import ClientsPage from "@/pages/ClientsPage";
import GuestsPage from "@/pages/GuestsPage";
import RsvpsPage from "@/pages/RsvpsPage";
import ConfirmedAttendeesPage from "@/pages/ConfirmedAttendeesPage";
import CheckInPage from "@/pages/CheckInPage";
import InvitationsPage from "@/pages/InvitationsPage";
import HallsPage from "@/pages/HallsPage";
import EventsPage from "@/pages/EventsPage";
import EventRequestsPage from "@/pages/EventRequestsPage";
import HallLayoutsPage from "@/pages/HallLayoutsPage";
import NotesPage from "@/pages/NotesPage";
import BroadcastsPage from "@/pages/BroadcastsPage";
import RolesPage from "@/pages/RolesPage";
import AdminAssistantsPage from "@/pages/AdminAssistantsPage";
import MemoriesPage from "@/pages/MemoriesPage";
import LookupsPage from "@/pages/LookupsPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";

export default function App() {
	return (
		<Routes>
			<Route element={<DashboardLayout />}>
				{/* Core Dashboard */}
				<Route path="/" element={<DashboardPage />} />
				<Route path="/client/dashboard" element={<Navigate to="/" replace />} />

				{/* Clients & Guests */}
				<Route path="/clients" element={<ClientsPage />} />
				<Route path="/guests" element={<GuestsPage />} />
				<Route path="/invitations" element={<InvitationsPage />} />

				{/* RSVP & Attendance */}
				<Route path="/rsvps" element={<RsvpsPage />} />
				<Route
					path="/confirmed-attendees"
					element={<ConfirmedAttendeesPage />}
				/>
				<Route path="/check-in" element={<CheckInPage />} />
				<Route
					path="/client/check-in"
					element={<Navigate to="/check-in" replace />}
				/>

				{/* Events, Requests & Halls */}
				<Route path="/events" element={<EventsPage />} />
				<Route
					path="/event-hall-reservations"
					element={<Navigate to="/events" replace />}
				/>
				<Route path="/event-requests" element={<EventRequestsPage />} />
				<Route
					path="/client/event-requests"
					element={<Navigate to="/event-requests" replace />}
				/>
				<Route path="/hall-layouts" element={<HallLayoutsPage />} />
				<Route path="/halls" element={<HallsPage />} />
				<Route
					path="/client/halls"
					element={<Navigate to="/halls" replace />}
				/>

				{/* Operations & Communications */}
				<Route path="/notes" element={<NotesPage />} />
				<Route path="/notify-broadcasts" element={<BroadcastsPage />} />

				{/* Media & Lookups */}
				<Route path="/memories" element={<MemoriesPage />} />
				<Route path="/media" element={<Navigate to="/memories" replace />} />
				<Route path="/lookups" element={<LookupsPage />} />

				{/* Administration */}
				<Route path="/roles" element={<RolesPage />} />
				<Route path="/admin-assistants" element={<AdminAssistantsPage />} />
				<Route path="/settings" element={<SettingsPage />} />
				<Route path="/profile" element={<Navigate to="/settings" replace />} />
				<Route path="/about-us" element={<Navigate to="/settings" replace />} />

				{/* 404 */}
				<Route path="*" element={<NotFound />} />
			</Route>
		</Routes>
	);
}
