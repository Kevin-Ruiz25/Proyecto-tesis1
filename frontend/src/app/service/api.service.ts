import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  get(url: string, options?: any) {
    if(options)
      return this.http.get(`${environment.apiUrl}/${url}`, options);
    return this.http.get(`${environment.apiUrl}/${url}`);
  }

  getFile(url: string, options: any = { responseType: 'blob'}) {
    return this.http.get(`${environment.apiUrl}/${url}`, options);
  }

  getReport(url: string, options: any = { responseType: 'blob'}) {
      return this.http.get(`${environment.reportUrl}/${url}`, options);
  }

  postReport(url: string, payload? : any, options: any = { responseType: 'blob'}) {
    return this.http.post(`${environment.reportUrl}/${url}`, payload,  options);
  }

  post(url: string, payload?: any, options?: any) {
    if(options)
      return this.http.post(`${environment.apiUrl}/${url}`, payload, options);
    return this.http
      .post(`${environment.apiUrl}/${url}`, payload);
  }

  put(url: string, payload?: any, options?: any) {
    if(options)
      return this.http.put(`${environment.apiUrl}/${url}`, payload, options);
    return this.http
      .put(`${environment.apiUrl}/${url}`, payload);
  }

  delete(url : string, payload?: any) {
    return this.http
      .delete(`${environment.apiUrl}/${url}`, payload);
  }
}