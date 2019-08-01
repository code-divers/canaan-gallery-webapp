import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { switchMap, map } from 'rxjs/operators';

export interface IGiphy{
    preview_gif: string;
    slug: string;
}


@Injectable({
    providedIn: 'root'
})
export class GiphyApiService {
    apiKey: string;
    constructor(private http: HttpClient) {
        this.apiKey = environment.giphy.apiKey;
    }

    search(query: string) {
        return this.http.get(`https://api.giphy.com/v1/gifs/search?api_key=${this.apiKey}&q=${query}&limit=25&offset=0&rating=G&lang=en`)
        .pipe(map(result => {
            return (<any>result).data.map(item => {
                return <IGiphy>{
                    preview_gif: item.images.preview_gif,
                    slug: item.slug
                };
            });
        }));
    }

}