import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'article-general',
  templateUrl: './article-general.component.html',
  styleUrls: ['./article-general.component.scss']
})
export class ArticleGeneralComponent implements OnInit {
  @Input() article;
  constructor() { }

  ngOnInit() {
  }

}
