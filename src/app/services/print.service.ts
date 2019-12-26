import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  isPrinting = false;

  constructor(private router: Router) { }

  printDocument(documentName: string, documentData: string) {
    this.isPrinting = true;
    this.router.navigate(['/',
      { outlets: {
        'print': ['print', documentName, documentData]
      }}]);
  }

  onDataReady() {
    console.log('ready to print');
    setTimeout(() => {
      window.print();
      setTimeout(()=>{
        this.isPrinting = false;
        this.router.navigate([{ outlets: { print: null }}]);
      }, 3000)
    }, 1000);
  }
}
