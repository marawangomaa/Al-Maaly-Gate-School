import { Component } from '@angular/core';
import { ClassModel, ClassService } from '../../../../../../Services/class.service';
import { Observable } from 'rxjs';
import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-class-list',
  imports: [DatePipe, NgIf, CommonModule, TranslateModule],
  templateUrl: './class-list.component.html',
  styleUrl: './class-list.component.css'
})
export class ClassListComponent {
  classes$!: Observable<ClassModel[]>;

  constructor(private classService: ClassService) {}

  ngOnInit() {
    this.classes$ = this.classService.classes$;
  }

  endClass(id: string) {
    this.classService.endClass(id);
  }
}
