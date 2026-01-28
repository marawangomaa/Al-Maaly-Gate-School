export interface AdminCreateUserBaseDto {
    email: string;
    userName: string;
    fullName: string;
    gender: string;
    birthDay: string; // ISO string (yyyy-MM-dd)
    contactInfo?: string;
}
