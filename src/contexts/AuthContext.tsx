import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	useMemo,
	useCallback,
} from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useTheme } from "./ThemeContext";

export interface AuthUser {
	id: string;
	name: string;
	email: string;
	role: "guest";
	isGuest: true;
}

interface AuthContextType {
	user: AuthUser | null;
	isAuthenticated: boolean;
	loginWithCredentials: (
		emailOrPhone: string,
		pass: string,
	) => Promise<boolean>;
	logout: () => void;
}

const AUTH_USER_KEY = "mock_dashboard_auth_user";
const AUTH_TOKEN_KEY = "mock_dashboard_auth_token";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const { t } = useTranslation();
	const { setRole } = useTheme();

	const [user, setUser] = useState<AuthUser | null>(() => {
		if (typeof window !== "undefined") {
			const stored = localStorage.getItem(AUTH_USER_KEY);
			if (stored) {
				try {
					return JSON.parse(stored);
				} catch {
					return null;
				}
			}
		}
		return null;
	});

	useEffect(() => {
		if (user) {
			localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
			setRole("client");
		} else {
			localStorage.removeItem(AUTH_USER_KEY);
			localStorage.removeItem(AUTH_TOKEN_KEY);
		}
	}, [user, setRole]);

	const loginWithCredentials = useCallback(
		async (emailOrPhone: string, pass: string): Promise<boolean> => {
			if (!emailOrPhone.trim() || !pass) {
				toast.error(t("auth.invalidCredentials"));
				return false;
			}

			const guestUser: AuthUser = {
				id: "guest-user",
				name: t("auth.guestUser"),
				email: emailOrPhone.trim().includes("@")
					? emailOrPhone.trim()
					: "guest@luna.demo",
				role: "guest",
				isGuest: true,
			};

			localStorage.setItem(AUTH_TOKEN_KEY, "mock_guest_token");
			setUser(guestUser);
			toast.success(t("auth.guestLoginSuccess"));
			return true;
		},
		[t],
	);

	const logout = useCallback(() => {
		setUser(null);
		localStorage.removeItem(AUTH_USER_KEY);
		localStorage.removeItem(AUTH_TOKEN_KEY);
		toast.info(t("auth.logoutSuccess"));
	}, [t]);

	const value = useMemo(
		() => ({
			user,
			isAuthenticated: !!user,
			loginWithCredentials,
			logout,
		}),
		[user, loginWithCredentials, logout],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
