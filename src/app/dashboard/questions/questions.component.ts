import { Component, OnInit } from '@angular/core';
import { ServerApiService } from '../../services/server-api.service';

@Component({
  selector: 'dashboard-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss']
})
export class QuestionsComponent implements OnInit {
  questions = null;
  languages = ['en','pt'];
  selectedLanguage = 'en';
  constructor(private api: ServerApiService) { }

  ngOnInit() {
    this.filter(this.selectedLanguage, null);
  }

  filter(lang, query){
    this.api.getQuestions(lang, query).subscribe((results) => {
      this.questions = results;
    });
  }

  onFilterKey(value){
    this.filter(this.selectedLanguage, value);
  }

  onLanguageChange(event){
    this.selectedLanguage = event.value;
    this.filter(this.selectedLanguage, null);
  }

  loadResults(question){
    return this.api.getQuestionArticles(question.query).subscribe((results) => {
      question.results = results;
   });
  }

  openLink(link){
    window.open(link, '_blank');
  }
}
