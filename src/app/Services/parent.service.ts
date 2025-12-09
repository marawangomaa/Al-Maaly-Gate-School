import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../Interfaces/auth';
import { iparentViewDto } from '../Interfaces/iparentViewDto';

@Injectable({
  providedIn: 'root'
})
export class ParentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/parent`;
  _Auth = inject(AuthService);

  GetAllParents(): Observable<ApiResponse<iparentViewDto[]>> {
    const token = this._Auth?.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<ApiResponse<iparentViewDto[]>>(`${this.apiUrl}/all`, { headers });
  }


}
