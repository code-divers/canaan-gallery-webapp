import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'article-actions',
  templateUrl: './article-actions.component.html',
  styleUrls: ['./article-actions.component.scss']
})
export class ArticleActionsComponent implements OnInit {
  @Input() article;
  constructor() { }

  ngOnInit() {
  }

  openLink(link){
    window.open(link, '_blank');
  }

}
