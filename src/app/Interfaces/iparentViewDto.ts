import { AccountStatus } from "./AccountStatus";

export interface iparentViewDto {
    id: string;
    fullName: string;
    email: string;
    contactInfo: string;
    appUserId: string;
    type: string;
    accountStatus: AccountStatus;
    gender: string;
    pendingRole?: string;
}

export interface iparentViewDtoWithDocs extends iparentViewDto {
    docCount?: number;
}