import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const NOMINATIM_BASE_URL = 'nominatim.openstreetmap.org';

@Injectable({
  providedIn: 'root'
})
export class NominatimService {
  constructor(private httpClient: HttpClient) { }

  searchAddress(address) {
    return this.httpClient.get(`https://${NOMINATIM_BASE_URL}/search?q=${address}&format=json&polygon=1&addressdetails=1`);
  }
}
