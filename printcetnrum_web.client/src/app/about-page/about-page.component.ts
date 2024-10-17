import { Component } from '@angular/core';


@Component({
  selector: 'app-about-page',
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.css'
})
export class AboutPageComponent {
  showTopButton = false;

  //@HostListener('window:scroll')
  //onWindowScroll() {
  //  this.showTopButton = window.scrollY > 350;
  //}

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

//function HostListener(arg0: string): (target: AboutPageComponent, propertyKey: "onWindowScroll", descriptor: TypedPropertyDescriptor<() => void>) => void | TypedPropertyDescriptor<() => void> {
//    throw new Error('Function not implemented.');
//}
