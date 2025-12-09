import { AccountStatus } from "./AccountStatus";

export interface iparentViewDto {
    id: string;
    fullName: string;
    email: string;
    contactInfo: string;
    appUserId: string;
    type: string;
    relation?: string | null;
    accountStatus: AccountStatus;
}