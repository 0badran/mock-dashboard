import type { ComponentType } from "react";
import {
  LayoutDashboard,
  Shield,
  UserCog,
  Settings,
  Database,
  Contact,
  Users,
  MailOpen,
  UserCheck,
  Camera,
  ClipboardList,
  Bell,
  Building2,
  Mails,
  MapPin,
  CalendarCheck2,
  CalendarClock,
  LayoutGrid,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  children?: { title: string; href: string }[];
}

export const adminNavItems: NavItem[] = [
  { title: "dashboard", href: "/", icon: LayoutDashboard },
  { title: "clients", href: "/clients", icon: Contact },
  { title: "guests", href: "/guests", icon: Users },
  { title: "rsvps", href: "/rsvps", icon: MailOpen },
  { title: "confirmed_attendees", href: "/confirmed-attendees", icon: UserCheck },
  { title: "check_in", href: "/check-in", icon: MapPin },
  { title: "invitations_templates", href: "/invitations", icon: Mails },
  { title: "halls", href: "/halls", icon: Building2 },
  { title: "events", href: "/events", icon: CalendarCheck2 },
  { title: "events_requests", href: "/event-requests", icon: CalendarClock },
  { title: "hall_layouts", href: "/hall-layouts", icon: LayoutGrid },
  { title: "notes", href: "/notes", icon: ClipboardList },
  { title: "notify_broadcasts", href: "/notify-broadcasts", icon: Bell },
  { title: "memories", href: "/memories", icon: Camera },
  { title: "lookups", href: "/lookups", icon: Database },
  { title: "roles", href: "/roles", icon: Shield },
  { title: "admin_assistants", href: "/admin-assistants", icon: UserCog },
  { title: "settings", href: "/settings", icon: Settings },
];
