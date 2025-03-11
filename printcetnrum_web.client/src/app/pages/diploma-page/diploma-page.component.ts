import { Component, ElementRef, HostListener, ViewChild, AfterViewInit, signal, inject } from '@angular/core';
import { Stamp } from '../../models/stamp';
import { StampService } from '../../services/stamp.service';
import { ActivatedRoute } from '@angular/router';
import { SnackBarUtil } from '../../shared/snackbar-util';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DiplomaTextBox } from '../../models/diploma';

@Component({
  selector: 'app-diploma-page',
  templateUrl: './diploma-page.component.html',
  styleUrl: './diploma-page.component.css'
})
export class DiplomaPageComponent {
  private stampService = inject(StampService);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  textBoxes: DiplomaTextBox[] = [];
  isDragging = false;
  isResizing = false;
  activeIndex: number | null = null;
  selectedIndex: number | null = null;
  history: DiplomaTextBox[][] = [];
  startX = 0;
  startY = 0;
  isMoved = false;
  containerWidth = 900;
  containerHeight = 1200;
  stampId = 0;
  diplomaName = 'New Diploma';
  boardColor = 'default';
  textColor = 'black';

  @ViewChild('stampContainer', { static: false }) stampContainer!: ElementRef;

  ngOnInit() {
    this.stampId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.stampId !== -1) {
      this.stampService.getStampsById(this.stampId).subscribe(data => {
        this.parseJson(data);
      }
      );
    }
    this.history.push([...this.textBoxes]);
  }

  ngAfterViewInit() {
    this.containerWidth = this.stampContainer.nativeElement.clientWidth;
    this.containerHeight = this.stampContainer.nativeElement.clientHeight;
    this.updateContainerBounds();
  }

  updateContainerBounds() {
    if (this.stampContainer) {
      const rect = this.stampContainer.nativeElement.getBoundingClientRect();

      const position = {
        left: rect.left + window.scrollX, // X position relative to document
        top: rect.top + window.scrollY,  // Y position relative to document
        right: rect.right + window.scrollX,
        bottom: rect.bottom + window.scrollY
      };

      console.log('Container Position:', position);
    }
  }

  addTextBox() {
    this.saveToHistory();
    this.textBoxes.push({
      text: 'New Text',
      x: 50,
      y: 50,
      width: 150,
      height: 40,
      color: 'black'
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
      this.textBoxes[index].height = rect.height + 10;
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
    console.log('x: ' + newX + '; y: ' + newY);
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

  undo() {
    var state = this.history.pop();
    if (state) {
      this.textBoxes = state;
    }
    console.log(this.textBoxes);
  }

  saveText() {
    Array.from(document.querySelectorAll('.text-box')).forEach((box, index) => {
      this.textBoxes[index].text = box.textContent as string
    });
  }

  downloadStamp() {
    //this.saveText();
    //const finalType = this.stampType === 'other' ? this.stampDescription : this.stampType;
    //const data = { stampName: this.stampName, stampType: finalType, textBoxes: this.textBoxes };
    //const stampData = JSON.stringify(data);
    //const blob = new Blob([stampData], { type: 'application/json' });
    //const url = URL.createObjectURL(blob);

    //const a = document.createElement('a');
    //a.href = url;
    //a.download = this.stampName;
    //document.body.appendChild(a);
    //a.click();
    //document.body.removeChild(a);
    //URL.revokeObjectURL(url);
  }

  saveStamp() {
    this.saveText();
    //const finalType = this.stampType === 'other' ? this.stampDescription : this.stampType;
    //const data = { stampName: this.stampName, stampType: finalType, textBoxes: this.textBoxes };
    //const stampData = JSON.stringify(data);
    //const blob = new Blob([stampData], { type: 'application/json' });
    //const file = new File([blob], 'stamp.json', { type: 'application/json' });
    //this.stampService.uploadStamp(file, this.stampName, finalType, this.stampId).subscribe(
    //  response => {
    //    SnackBarUtil.showSnackBar(this.snackBar, 'Stamp saved successfully!', 'success');
    //  },
    //  error => {
    //    SnackBarUtil.showSnackBar(this.snackBar, error, 'error');
    //  }
    //);
  }

  parseJson(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (data && data.textBoxes && Array.isArray(data.textBoxes)) {
          //this.stampName = data.stampName || 'Unknown Name';
          //this.stampDescription = data.stampType.toLowerCase().startsWith('modico') ? '' : data.stampType;
          //this.stampType = this.stampDescription === '' ? data.stampType : 'other';
          this.textBoxes = data.textBoxes;
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
