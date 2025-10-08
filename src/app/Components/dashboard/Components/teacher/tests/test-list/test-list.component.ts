import { Component } from '@angular/core';
import { TestModel, TestService } from '../../../../../../Services/test.service';
import { Observable } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-test-list',
  imports: [TranslateModule, NgIf, CommonModule],
  templateUrl: './test-list.component.html',
  styleUrl: './test-list.component.css'
})
export class TestListComponent {
  tests$!: Observable<TestModel[]>;

  constructor(private ts: TestService) {
    this.tests$ = this.ts.tests$;
  }

  delete(id: string) {
    if (confirm('Are you sure you want to delete this test?')) {
      this.ts.delete(id);
    }
  }
}
