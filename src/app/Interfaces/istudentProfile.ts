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
    nationality: string;
    iqamaNumber: string;
    passportNumber: string;
    gradeName?: string;
    curriculumName?: string;
    curriculumId?: string;
    parents: any[];
}
