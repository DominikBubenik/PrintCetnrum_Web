import { Component, ElementRef, HostListener, ViewChild, AfterViewInit, signal, inject } from '@angular/core';
import { Stamp } from '../../models/stamp';
import { StampService } from '../../services/stamp.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-stamp-page',
  templateUrl: './stamp-page.component.html',
  styleUrls: ['./stamp-page.component.css']
})
export class StampPageComponent implements AfterViewInit {
  private stampService = inject(StampService);
  private route = inject(ActivatedRoute);
  textBoxes: Stamp[] = [];
  isDragging = false;
  isResizing = false;
  activeIndex: number | null = null;
  selectedIndex: number | null = null;
  history: Stamp[][] = [];
  startX = 0;
  startY = 0;
  isMoved = false;
  containerWidth = 400;
  containerHeight = 200;
  currentSize = signal<number>(20);
  stampId = 0;
  spaceCounter = 0;
  stampName = 'New Stamp';
  stampType = 'default';
  stampDescription = '';

  @ViewChild('stampContainer', { static: false }) stampContainer!: ElementRef;

  ngOnInit() {
    this.stampId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.stampId !== -1) {
      this.stampService.getStampsById(this.stampId).subscribe(data => {
        //this.stampName = data.StampName;
        this.parseJson(data);
        }
      );
    }
    this.history.push([...this.textBoxes]);
  }

  ngAfterViewInit() {
    this.containerWidth = this.stampContainer.nativeElement.clientWidth;
    this.containerHeight = this.stampContainer.nativeElement.clientHeight;
  }

  addTextBox() {
    this.saveToHistory();
    this.textBoxes.push({
      text: 'New Text',
      image: null,
      x: 50,
      y: 50,
      fontSize: this.currentSize(),
      width: 150,
      height: 40,
      isBold: false
    });
  }

  deleteSelectedTextBox() {
    if (this.selectedIndex !== null) {
      this.saveToHistory();
      this.textBoxes.splice(this.selectedIndex, 1);
      this.selectedIndex = null;
    }
  }

  selectTextBox(event: MouseEvent, index: number) {
    event.stopPropagation();
    this.selectedIndex = index;
    this.currentSize.set(this.textBoxes[index].fontSize);
  }

  deselectTextBox(event: MouseEvent) {
    if (!(event.target as HTMLElement).classList.contains('text-box')) {
      this.selectedIndex = null;
    }
  }

  saveToHistory() {
    if (this.history.length > 10) {
      this.history.shift();
    }
    this.saveText();
    this.history.push(JSON.parse(JSON.stringify(this.textBoxes)));
    console.log(this.history);
  }

  adjustSize(index: number) {
    const textBoxElement = document.querySelectorAll('.text-box')[index] as HTMLElement;
    if (textBoxElement) {
      const range = document.createRange();
      range.selectNodeContents(textBoxElement);
      const rect = range.getBoundingClientRect();
      console.log(range);
      this.textBoxes[index].height = rect.height + 10;
      //this.textBoxes[index].width =  rect.width + 10; 
      //this.textBoxes[index].height = rect.height + 10; 
    }
  }

  startDrag(event: MouseEvent, index: number) {
    if (!this.isNearEdge(event)) return;
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
    if (newX !== textBox.x || newY !== textBox.y) this.isMoved = true;
    textBox.x = newX;
    textBox.y = newY;
  };

  stopDrag = () => {
    this.isDragging = false;
    this.activeIndex = null;
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.stopDrag);
    if (this.isMoved) {
      this.saveToHistory();
      this.isMoved = false;
    }
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
    this.saveToHistory();
  };

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Delete') {
      this.deleteSelectedTextBox();
    }
  }

  increaseFontSize(event: Event) {
    event.stopPropagation();
    if (this.selectedIndex !== null) {
      this.saveToHistory();
      this.currentSize.update(value => value += 2);
      this.textBoxes[this.selectedIndex].fontSize = this.currentSize();
    }
  }

  decreaseFontSize(event: Event) {
    event.stopPropagation();
    if (this.selectedIndex !== null && this.textBoxes[this.selectedIndex].fontSize > 2) {
      this.saveToHistory();
      this.currentSize.update(value => value -= 2);
      this.textBoxes[this.selectedIndex].fontSize = this.currentSize();
    }
  }

  isNearEdge(event: MouseEvent): boolean {
    const element = event.target as HTMLElement;
    const rect = element.getBoundingClientRect();
    const edgeMargin = 10;

    return event.clientX < rect.left + edgeMargin ||
      event.clientX > rect.right - edgeMargin ||
      event.clientY < rect.top + edgeMargin ||
      event.clientY > rect.bottom - edgeMargin;
  }

  updateCursor(event: MouseEvent, index: number) {
    const element = event.target as HTMLElement;
    element.style.cursor = this.isNearEdge(event) ? 'move' : 'default';
  }

  setFontSize(event: Event) {
    event.stopPropagation();
    const inputValue = (event.target as HTMLInputElement).valueAsNumber;
    if (inputValue > 2 && this.selectedIndex !== null) {
      this.currentSize.set(inputValue);
      this.textBoxes[this.selectedIndex].fontSize = inputValue;
    }
  }

  toggleBold(event: Event) {
    event.stopPropagation();
    if (this.selectedIndex !== null) {
      this.saveToHistory();
      this.textBoxes[this.selectedIndex].isBold = !this.textBoxes[this.selectedIndex].isBold;
    }
  }

  undo() {
    var state = this.history.pop();
    if (state) {
      this.textBoxes = state;
    }
    console.log(this.textBoxes);
  }

  addImage(event: Event) {
    this.saveToHistory();
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.textBoxes.push({
          text: '',
          image: reader.result as string, 
          x: 50,
          y: 50,
          fontSize: 20,
          width: 100,
          height: 100,
          isBold: false
        });
      };

      reader.readAsDataURL(file);
    }
  }

  saveText() {
    Array.from(document.querySelectorAll('.text-box')).forEach((box, index) => {
      this.textBoxes[index].text = box.textContent as string
    });
  }
  
  downloadStamp() {
    this.saveText();
    const stampData = JSON.stringify(this.textBoxes);
    const blob = new Blob([stampData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'stamp.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  saveStamp() {
    this.saveText();
    const stampData = JSON.stringify(this.textBoxes);
    const blob = new Blob([stampData], { type: 'application/json' });
    const file = new File([blob], 'stamp.json', { type: 'application/json' });
    const finalType = this.stampType === 'other' ? this.stampDescription : this.stampType;
    this.stampService.uploadStamp(file, this.stampName, finalType, this.stampId).subscribe(
      response => {
        console.log('Stamp saved successfully', response);
      },
      error => {
        console.error('Error saving stamp', error);
      }
    );
  }

  parseJson(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (Array.isArray(data)) {
          this.textBoxes = data;
          this.saveToHistory();
        } else {
          alert('Invalid file format');
        }
      } catch (error) {
        alert('Error loading file');
      }
    };
    reader.readAsText(file);
  }

  loadStamp(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.parseJson(file);
    }
  }

}
