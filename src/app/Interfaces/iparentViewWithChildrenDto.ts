import { istudentMinimalDto } from "./istudentMinimalDto";

export interface iparentViewWithChildrenDto {
    id: string;
    fullName: string;
    email: string;
    contactInfo: string;
    appUserId: string;
    type: string;
    relation?: string | null;
    students: istudentMinimalDto[];
}