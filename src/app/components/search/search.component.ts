import { Component, OnInit, Input } from '@angular/core';
import { MatAutocomplete } from '@angular/material/autocomplete'
import { FormGroup, FormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NgModule } from '@angular/core'

import { Router } from '@angular/router';
import { HttpHeaders, HttpParams, HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, tap,finalize, switchMap } from 'rxjs/operators';



@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  autocompleteBool = null;
  tickers = [];
  loadBool = false;
  tickSymbol: string;

  searchForm = new FormGroup({
    ticker: new FormControl('', Validators.required)
  });

  constructor(private http: HttpClient, private router: Router) { }


  ngOnInit(): void {
    this.searchForm.valueChanges.subscribe(console.log);
    this.searchForm.get('ticker').valueChanges.pipe(debounceTime(1000),tap(() => this.loadBool = true)
    ).pipe(finalize(() =>this.loadBool =false)).subscribe(
      term => {
        //console.log(term);
        this.loadBool = true;
        if (term != '') {
          this.autoComplete(term);
        }
      }
    );
  }

  autoComplete(term) {
    //console.log("Autocomplete!");
    //console.log("Term: " + term);
    var solutions = [];
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const params = new HttpParams()
      .set('term', term)

    this.http.get("/autoComplete", {
      headers: headers,
      params: params
    }).subscribe((autoData: any[]) => {
      //console.log("response from get call");
      //console.log(autoData);
      this.autocompleteBool = autoData;
      this.tickers = [];
      var suggestions = this.autocompleteBool;
      //console.log(suggestions);
      var x = 0;
      while (x < suggestions.length) {
        solutions.push(suggestions[x]["ticker"] + " | " + suggestions[x]["name"]);
        x++;
      }
      this.tickers = solutions;
      //console.log(this.tickers);
      this.loadBool = false;
    });
  }

  openDetailPage(event) {
    event.preventDefault()
    //console.log("Here:" + this.tickSymbol);
    this.router.navigate(['/details', this.tickSymbol.split(' | ')[0]]);
  }

}