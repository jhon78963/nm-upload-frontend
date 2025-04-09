
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL, BASE_FILE_URL, TOKEN, FILE_TOKEN } from '../utils/constants';

@Injectable({ providedIn: 'root' })
export class ApiService {
  BASE_URL = BASE_URL;
  BASE_FILE_URL = BASE_FILE_URL;
  TOKEN = TOKEN;
  FILE_TOKEN = FILE_TOKEN;
  constructor(private readonly http: HttpClient) {}

  get<T>(path: string, headers?: any) {
    const httpHeaders = TOKEN ? { ...headers, Authorization: `Bearer ${TOKEN}` } : headers;
    return this.http.get<T>(`${this.BASE_URL}/${path}`, { headers: httpHeaders });
  }

  post<T>(path: string, body: any, headers?: any) {
    const httpHeaders = TOKEN ? { ...headers, Authorization: `Bearer ${TOKEN}` } : headers;
    return this.http.post<T>(`${this.BASE_URL}/${path}`, body, { headers: httpHeaders });
  }

  filePost<T>(path: string, body: any, headers?: any) {
    const httpHeaders = TOKEN ? { ...headers, Authorization: `Bearer ${FILE_TOKEN}` } : headers;
    return this.http.post<T>(`${this.BASE_FILE_URL}/${path}`, body, { headers: httpHeaders });
  }

  put<T>(path: string, body: any, headers?: any) {
    const httpHeaders = TOKEN ? { ...headers, Authorization: `Bearer ${TOKEN}` } : headers;
    return this.http.put<T>(`${this.BASE_URL}/${path}`, body, { headers: httpHeaders });
  }

  patch<T>(path: string, body: any, headers?: any) {
    const httpHeaders = TOKEN ? { ...headers, Authorization: `Bearer ${TOKEN}` } : headers;
    return this.http.patch<T>(`${this.BASE_URL}/${path}`, body, { headers: httpHeaders });
  }

  delete<T>(path: string, headers?: any) {
    const httpHeaders = TOKEN ? { ...headers, Authorization: `Bearer ${TOKEN}` } : headers;
    return this.http.delete<T>(`${this.BASE_URL}/${path}`, { headers: httpHeaders });
  }
}
