import { AuthResponse } from "./AuthResponse";
import { DocumentInfo } from "./DocumentInfo";
import { ParentProfileDto } from "./ParentProfileDto";

// Parent registration response DTO

export interface ParentRegistrationResponse extends AuthResponse {
    uploadedDocuments: DocumentInfo[];
    parentProfile: ParentProfileDto;
}
