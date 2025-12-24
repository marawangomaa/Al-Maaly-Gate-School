import { RegisterRequest } from "./auth";

export interface ParentRegisterRequest extends RegisterRequest
{
    relation: string;
}