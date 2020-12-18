import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Credentials } from './models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private data:Credentials
  sha1 = require('sha1');

  // Sets and gets the login credentials
  getCredentials():Credentials {
    return this.data
  }
  setCredentials(credentials) {
    this.data = credentials
  }

  constructor(private http:HttpClient) { }

  // Post request to login
  apiLogin (value) {
    value.password = this.sha1(value.password)
    return this.http.post('/api/login', value).toPromise()
    .then (() => {
        this.setCredentials(value)
    })
  }

  // Post request to upload form and image
  async apiUpload (value, img):Promise<any> {
    value.credentials = this.getCredentials()
    const formData:FormData = new FormData()
    formData.set('data', JSON.stringify(value))
    formData.set('file', img.imageData)
    return await this.http.post('/api/upload', formData).toPromise()
  }
}
