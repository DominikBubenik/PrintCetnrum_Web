import {Component, ElementRef, HostListener, ViewChild} from '@angular/core';

@Component({
  selector: 'app-stamp-page',
  templateUrl: './stamp-page.component.html',
  styleUrl: './stamp-page.component.css'
})
export class StampPageComponent {
  textBoxes: { text: string; x: number; y: number; fontSize: number }[] = [];
  isDragging = false;
  activeIndex: number | null = null;
  selectedIndex: number | null = null;
  startX = 0;
  startY = 0;
  containerWidth = 400;
  containerHeight = 200;

  @ViewChild('stampContainer', { static: false }) stampContainer!: ElementRef;

  ngAfterViewInit() {
    this.containerWidth = this.stampContainer.nativeElement.clientWidth;
    this.containerHeight = this.stampContainer.nativeElement.clientHeight;
  }

  addTextBox() {
    this.textBoxes.push({
      text: 'New Text',
      x: 50,
      y: 50,
      fontSize: 20,
    });
  }

  deleteSelectedTextBox() {
    if (this.selectedIndex !== null) {
      this.textBoxes.splice(this.selectedIndex, 1);
      this.selectedIndex = null;
    }
  }

  selectTextBox(event: MouseEvent, index: number) {
    event.stopPropagation(); // Prevents deselection when clicking inside the text box
    this.selectedIndex = index;
  }

  deselectTextBox(event: MouseEvent) {
    if (!(event.target as HTMLElement).classList.contains('text-box')) {
      this.selectedIndex = null;
    }
  }

  startDrag(event: MouseEvent, index: number) {
    this.isDragging = true;
    this.activeIndex = index;
    this.selectedIndex = index; // Selects the text box when dragging
    this.startX = event.clientX - this.textBoxes[index].x;
    this.startY = event.clientY - this.textBoxes[index].y;
    document.addEventListener('mousemove', this.onDrag);
    document.addEventListener('mouseup', this.stopDrag);
  }

  onDrag = (event: MouseEvent) => {
    if (!this.isDragging || this.activeIndex === null) return;

    let newX = event.clientX - this.startX;
    let newY = event.clientY - this.startY;
    const textBoxWidth = 100;
    const textBoxHeight = 30;

    newX = Math.max(0, Math.min(this.containerWidth - textBoxWidth, newX));
    newY = Math.max(0, Math.min(this.containerHeight - textBoxHeight, newY));

    this.textBoxes[this.activeIndex].x = newX;
    this.textBoxes[this.activeIndex].y = newY;
  };

  stopDrag = () => {
    this.isDragging = false;
    this.activeIndex = null;
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.stopDrag);
  };

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Delete') {
      this.deleteSelectedTextBox();
    }
  }
}
