import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiResponse } from '../Interfaces/auth'; // adjust path if needed

export class ApiResponseHandler {
    /**
     * Handles API responses in a consistent, reusable way.
     * 
     * @param request$ Observable<ApiResponse<T>>
     * @returns Observable<T>
     */
    static handleApiResponse<T>(request$: Observable<ApiResponse<T>>): Observable<T> {
        return request$.pipe(
            map(res => {
                if (!res) throw new Error('No response from server');
                if (!res.success) throw new Error(res.message || 'Operation failed');
                return res.data;
            }),
            catchError(err => {
                const backendMsg =
                    err?.error?.message ||
                    err?.message ||
                    'Unexpected server error';
                return throwError(() => new Error(backendMsg));
            })
        );
    }
}
