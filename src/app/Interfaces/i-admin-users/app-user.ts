export interface AppUser {
    id: string;
    fullName: string;
    email: string;
    contactInfo: string;
    pendingRole?: string;
    profileImagePath?: string;
}
