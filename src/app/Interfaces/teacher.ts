import { AccountStatus } from "./AccountStatus";

export interface Teacher {
    id: string;
    fullName: string;
    email: string;
    contactInfo: string;
    accountStatus: AccountStatus;
    subjects: string[];
    classNames: string[];
    pendingRole?: string;
}
