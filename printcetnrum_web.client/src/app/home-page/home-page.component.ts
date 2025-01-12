import { Component } from '@angular/core';


@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  showTopButton = false;

  //@HostListener('window:scroll')
  //onWindowScroll() {
  //  this.showTopButton = window.scrollY > 350;
  //}

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
