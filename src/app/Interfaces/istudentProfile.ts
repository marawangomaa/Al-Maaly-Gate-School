import { AccountStatus } from "./AccountStatus";

export interface istudentProfile {
    id: string;
    fullName: string;
    className: string;
    email: string;
    contactInfo: string;
    appUserId: string;
    classYear: string;
    age: number;
    classId: string;
    accountStatus: AccountStatus;
    parents: any[];
}