import { AuthResponse } from "./AuthResponse";
import { ParentProfileDto } from "./ParentProfileDto";

// Parent registration response DTO

export interface ParentRegistrationResponse extends AuthResponse {
    parentProfile: ParentProfileDto;
}
