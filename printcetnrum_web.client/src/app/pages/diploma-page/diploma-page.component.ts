import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SnackBarUtil } from '../../shared/snackbar-util';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DiplomaTextBox } from '../../models/diploma-container.model';
import {DesignFilesHandlerService} from "../../services/design-files-handler.service";

@Component({
  selector: 'app-diploma-page',
  templateUrl: './diploma-page.component.html',
  styleUrl: './diploma-page.component.css'
})
export class DiplomaPageComponent {
  private readonly designFileService = inject(DesignFilesHandlerService);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  textBoxes: DiplomaTextBox[] = [];
  isDragging = false;
  innerBorderMargin = 20;
  isResizing = false;
  activeIndex: number | null = null;
  selectedIndex: number | null = null;
  history: DiplomaTextBox[][] = [];
  startX = 0;
  startY = 0;
  containerPosition = { left: 0, top: 0, right: 0, bottom: 0 };
  isMoved = false;
  containerWidth = 900;
  containerHeight = 1200;
  diplomaId = 0;
  diplomaName = 'New Diploma';
  boardColor = 'default';
  textColor = 'black';

  @ViewChild('stampContainer', { static: false }) stampContainer!: ElementRef;
  @ViewChild('innerBoarder', { static: false }) innerBoarder!: ElementRef;

  ngOnInit() {
    this.diplomaId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.diplomaId !== -1) {
      this.designFileService.getDesignFileById(this.diplomaId).subscribe(data => {
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
      const innerRect = this.innerBoarder.nativeElement.getBoundingClientRect();
      this.containerPosition = {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom
      };
      this.innerBorderMargin = innerRect.left - rect.left;
      console.log('Container Position:', this.containerPosition, ' this is inner margin ', this.innerBorderMargin);
    }
  }

  addTextBox() {
    this.saveToHistory();
    const centerX = 150;
    const centerY = 100;

    this.textBoxes.push({
      text: 'New Text',
      x: centerX,
      y: centerY,
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

    newX = Math.max(
      this.innerBorderMargin,
      Math.min(this.containerWidth - this.innerBorderMargin - textBox.width, newX)
    );

    newY = Math.max(
      this.innerBorderMargin,
      Math.min(this.containerHeight - this.innerBorderMargin - textBox.height, newY)
    );

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

    newWidth = Math.max(
      50,
      Math.min(this.containerWidth - this.innerBorderMargin - textBox.x, newWidth)
    );

    newHeight = Math.max(
      30,
      Math.min(this.containerHeight - this.innerBorderMargin - textBox.y, newHeight)
    );

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

  updateCursor(event: MouseEvent) {
    const element = event.target as HTMLElement;
    element.style.cursor = this.isNearEdge(event) ? 'move' : 'default';
  }

  undo() {
    let state = this.history.pop();
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

  downloadDiploma() {
    this.saveText();
    const data = { diplomaName: this.diplomaName, textColor: this.textColor, boardColor: this.boardColor, textBoxes: this.textBoxes };
    const stampData = JSON.stringify(data);
    const blob = new Blob([stampData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = this.diplomaName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  saveDiploma() {
    this.saveText();
    const data = { diplomaName: this.diplomaName, textColor: this.textColor, boardColor: this.boardColor, textBoxes: this.textBoxes };
    console.log(data);
    const stampData = JSON.stringify(data);
    const blob = new Blob([stampData], { type: 'application/json' });
    const file = new File([blob], 'diploma.json', { type: 'application/json' });
    this.designFileService.uploadDesignFile(file, this.diplomaName, this.diplomaId, 'Diploma').subscribe(
      data => {
        this.diplomaId = data.id ?? -1;
        SnackBarUtil.showSnackBar(this.snackBar, 'Diploma saved successfully!', 'success');
      },
      error => {
        SnackBarUtil.showSnackBar(this.snackBar, error, 'error');
      }
    );
  }

  parseJson(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (data && data.textBoxes && Array.isArray(data.textBoxes)) {
          this.diplomaName = data.diplomaName || 'Unknown Name';
          this.textColor = data.textColor || 'black';
          this.boardColor = data.boardColor || 'default';
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

  loadDiploma(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.parseJson(file);
    }
  }
}
