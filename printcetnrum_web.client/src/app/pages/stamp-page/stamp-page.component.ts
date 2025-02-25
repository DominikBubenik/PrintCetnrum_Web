import { Component, ElementRef, HostListener, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-stamp-page',
  templateUrl: './stamp-page.component.html',
  styleUrls: ['./stamp-page.component.css']
})
export class StampPageComponent implements AfterViewInit {
  textBoxes: { text: string; x: number; y: number; fontSize: number; width: number; height: number }[] = [];
  isDragging = false;
  isResizing = false;
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
      width: 100,
      height: 40
    });
  }

  deleteSelectedTextBox() {
    if (this.selectedIndex !== null) {
      this.textBoxes.splice(this.selectedIndex, 1);
      this.selectedIndex = null;
    }
  }

  selectTextBox(event: MouseEvent, index: number) {
    event.stopPropagation();
    this.selectedIndex = index;
  }

  deselectTextBox(event: MouseEvent) {
    if (!(event.target as HTMLElement).classList.contains('text-box')) {
      this.selectedIndex = null;
    }
  }

  adjustSize(index: number) {
    const textBoxElement = document.querySelectorAll('.text-box')[index] as HTMLElement;
    if (textBoxElement) {
      const range = document.createRange();
      range.selectNodeContents(textBoxElement);
      const rect = range.getBoundingClientRect();
      this.textBoxes[index].width = rect.width + 10; // Add some padding
      this.textBoxes[index].height = rect.height + 10; // Add some padding
    }
  }

  startDrag(event: MouseEvent, index: number) {
    this.isDragging = true;
    this.activeIndex = index;
    this.selectedIndex = index;
    this.startX = event.clientX - this.textBoxes[index].x;
    this.startY = event.clientY - this.textBoxes[index].y;
    document.addEventListener('mousemove', this.onDrag);
    document.addEventListener('mouseup', this.stopDrag);
  }

  onDrag = (event: MouseEvent) => {
    if (!this.isDragging || this.activeIndex === null) return;

    let newX = event.clientX - this.startX;
    let newY = event.clientY - this.startY;
    const textBox = this.textBoxes[this.activeIndex];

    newX = Math.max(0, Math.min(this.containerWidth - textBox.width, newX));
    newY = Math.max(0, Math.min(this.containerHeight - textBox.height, newY));

    textBox.x = newX;
    textBox.y = newY;
  };

  stopDrag = () => {
    this.isDragging = false;
    this.activeIndex = null;
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.stopDrag);
  };

  startResize(event: MouseEvent, index: number) {
    event.stopPropagation();
    this.isResizing = true;
    this.activeIndex = index;
    this.startX = event.clientX;
    this.startY = event.clientY;
    document.addEventListener('mousemove', this.onResize);
    document.addEventListener('mouseup', this.stopResize);
  }

  onResize = (event: MouseEvent) => {
    if (!this.isResizing || this.activeIndex === null) return;

    const textBox = this.textBoxes[this.activeIndex];

    let newWidth = textBox.width + (event.clientX - this.startX);
    let newHeight = textBox.height + (event.clientY - this.startY);

    // Prevent shrinking too much
    newWidth = Math.max(50, Math.min(this.containerWidth - textBox.x, newWidth));
    newHeight = Math.max(20, Math.min(this.containerHeight - textBox.y, newHeight));

    textBox.width = newWidth;
    textBox.height = newHeight;

    this.startX = event.clientX;
    this.startY = event.clientY;
  };

  stopResize = () => {
    this.isResizing = false;
    this.activeIndex = null;
    document.removeEventListener('mousemove', this.onResize);
    document.removeEventListener('mouseup', this.stopResize);
  };

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Delete') {
      this.deleteSelectedTextBox();
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const target = event.target as HTMLElement;
    const index = Array.from(document.querySelectorAll('.text-box')).indexOf(target);
    if (index !== -1) {
      this.adjustSize(index);
    }
  }

  increaseFontSize(event: Event) {
    event.stopPropagation();
    if (this.selectedIndex !== null) {
      this.textBoxes[this.selectedIndex].fontSize += 2;
      this.adjustSize(this.selectedIndex);
    }
  }

  decreaseFontSize(event: Event) {
    event.stopPropagation();
    if (this.selectedIndex !== null && this.textBoxes[this.selectedIndex].fontSize > 2) {
      this.textBoxes[this.selectedIndex].fontSize -= 2;
      this.adjustSize(this.selectedIndex);
    }
  }
}
