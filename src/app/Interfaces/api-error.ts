export interface ApiError {
    message: string;
    errors?: {[key: string]: string[]};
    statusCode?: number;
}
