import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Stock-Search';

constructor(private router: Router) {

}

searchOpen()
{
  this.router.navigate(['/']);
}

portfolioOpen()
{
  this.router.navigate(['/portfolio']);
}

watchlistOpen()
{
  this.router.navigate(['/watchlist']);
}
}
