// Update your existing AuthResponse interface

export interface AuthResponse {
    userId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    token: string;
    roles: string[];
    profileImageUrl?: string;
    roleEntityIds?: { [key: string]: string; };
}
