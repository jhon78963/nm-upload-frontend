import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor(private apiService: ApiService) {}

  create(data: any) {
    return this.apiService.filePost('images/upload', data);
  }
}
