import {
  Component, Input, EventEmitter, ElementRef, AfterViewInit, ViewChild, Output
} from '@angular/core';
import { fromEvent, Observable, BehaviorSubject } from 'rxjs';
import { switchMap, takeUntil, pairwise, map } from 'rxjs/operators';
import { AngularFireStorage } from 'angularfire2/storage';


@Component({
  selector: 'sketch',
  templateUrl: './sketch.component.html',
  styleUrls: ['./sketch.component.scss']
})
export class SketchComponent implements AfterViewInit {
  // a reference to the canvas element from our template
  @ViewChild('canvas') public canvas: ElementRef;

  // setting a width and height for the canvas
  @Input() public width = null;
  @Input() public height = null;
  @Input() public imageName = 'noId';
  @Input() public bgUrl: Observable<string>;

  private cx: CanvasRenderingContext2D;

  @Output() public canvasSave = new EventEmitter<string>();
  isLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private storage: AngularFireStorage) {
    
  }
  
  public ngAfterViewInit() {
    // get the context
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = canvasEl.getContext('2d');

    // set the width and height
    canvasEl.width = this.width ? this.width : canvasEl.offsetWidth;
    canvasEl.height = this.height ? this.height : canvasEl.offsetHeight;

    // set some default properties about the line
    this.cx.lineWidth = 3;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#000';
    
    // we'll implement this method to start capturing mouse events
    this.captureEvents(canvasEl);

    this.bgUrl.subscribe(value => {
      if (value) {
        const background = new Image();
        background.crossOrigin = 'anonymous';
        background.src = value;

        // Make sure the image is loaded first otherwise nothing will draw.
        const that = this;
        background.onload = function() {
           that.cx.drawImage(background, 0, 0);
        };
      }
    });
  }

  private captureEvents(canvasEl: HTMLCanvasElement) {
    // this will capture all mousedown events from the canvas element
    fromEvent(canvasEl, 'mousedown')
      .pipe(
        switchMap((e) => {
          // after a mouse down, we'll record all mouse moves
          return fromEvent(canvasEl, 'mousemove')
            .pipe(
              // we'll stop (and unsubscribe) once the user releases the mouse
              // this will trigger a 'mouseup' event    
              takeUntil(fromEvent(canvasEl, 'mouseup')),
              // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
              takeUntil(fromEvent(canvasEl, 'mouseleave')),
              // pairwise lets us get the previous value to draw a line from
              // the previous point to the current point    
              pairwise()
            )
        })
      )
      .subscribe((res: [MouseEvent, MouseEvent]) => {
        const rect = canvasEl.getBoundingClientRect();
  
        // previous and current position with the offset
        const prevPos = {
          x: res[0].clientX - rect.left,
          y: res[0].clientY - rect.top
        };
  
        const currentPos = {
          x: res[1].clientX - rect.left,
          y: res[1].clientY - rect.top
        };
  
        // this method we'll implement soon to do the actual drawing
        this.drawOnCanvas(prevPos, currentPos);
      });
  }

  private drawOnCanvas(
    prevPos: { x: number, y: number }, 
    currentPos: { x: number, y: number }
  ) {
    // incase the context is not set
    if (!this.cx) { return; }
  
    // start our drawing path
    this.cx.beginPath();
  
    // we're drawing lines so we need a previous position
    if (prevPos) {
      // sets the start point
      this.cx.moveTo(prevPos.x, prevPos.y); // from
  
      // draws a line from the start pos until the current position
      this.cx.lineTo(currentPos.x, currentPos.y);
  
      // strokes the current path with the styles we set earlier
      this.cx.stroke();
    }
  }

  saveCanvas() {
    this.isLoading.next(true);
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    const dataUrl = canvasEl.toDataURL();
    this.uploadCanvas(dataUrl).then((url) => {
      url.ref.getDownloadURL().then(downloadUrl => {
        this.canvasSave.next(downloadUrl);
        this.isLoading.next(false);
      });
    })
  }

  private uploadCanvas(dataUrl) {
    const storageRef = this.storage.ref(`sketches/order-${this.imageName}.png`);
    return storageRef.putString(dataUrl, 'data_url');
  }

  notIsLoading() {
    return this.isLoading.pipe(map(value => {
      return !value;
    }));
  }
}