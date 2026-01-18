import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SubjectViewDto } from '../../../../../Interfaces/isubject';
import { CreateDegreeComponentTypeDto, DegreeComponentTypeDto, UpdateDegreeComponentTypeDto } from '../../../../../Interfaces/icomponenttype';
import { forkJoin } from 'rxjs';
import { SubjectService } from '../../../../../Services/subject.service';
import { DegreeComponentTypeService } from '../../../../../Services/degrees-component-type.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from '../../../../../Services/UtilServices/toast.service';


@Component({
  selector: 'app-subject-component-types',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './subject-component-types.component.html',
  styleUrls: ['./subject-component-types.component.css']
})
export class SubjectComponentTypesComponent implements OnInit {
  // Data
  subjects: SubjectViewDto[] = [];
  componentTypes: Map<string, DegreeComponentTypeDto[]> = new Map(); // subjectId -> component types[]
  
  // UI State
  isLoading: boolean = true;
  expandedSubjectId: string | null = null;
  editingComponentTypeId: string | null = null;
  reorderingSubjectId: string | null = null;
  
  // Forms
  componentTypeForm: FormGroup;
  reorderForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private subjectService: SubjectService,
    private componentTypeService: DegreeComponentTypeService,
    private toastService: ToastService
  ) {
    this.componentTypeForm = this.fb.group({
      subjectId: ['', Validators.required],
      componentName: ['', [Validators.required, Validators.minLength(2)]],
      order: [1, [Validators.required, Validators.min(1)]],
      maxScore: [0, [Validators.required, Validators.min(0)]],
      isActive: [true]
    });

    this.reorderForm = this.fb.group({
      componentTypeIds: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.isLoading = true;
    this.subjectService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.subjects = response.data;
          this.loadComponentTypes();
        } else {
          this.toastService.error('Failed to load subjects');
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.toastService.error('Failed to load subjects');
        console.error('Error loading subjects:', error);
        this.isLoading = false;
      }
    });
  }

  loadComponentTypes(): void {
    if (this.subjects.length === 0) {
      this.isLoading = false;
      return;
    }

    const requests = this.subjects.map(subject =>
      this.componentTypeService.getComponentTypesBySubject(subject.id)
    );

    forkJoin(requests).subscribe({
      next: (responses) => {
        responses.forEach((response, index) => {
          if (response.success && response.data) {
            const subjectId = this.subjects[index].id;
            this.componentTypes.set(subjectId, response.data.sort((a, b) => a.order - b.order));
          }
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.toastService.error('Failed to load component types');
        console.error('Error loading component types:', error);
        this.isLoading = false;
      }
    });
  }

  toggleExpandSubject(subjectId: string): void {
    if (this.expandedSubjectId === subjectId) {
      this.expandedSubjectId = null;
      this.editingComponentTypeId = null;
    } else {
      this.expandedSubjectId = subjectId;
      this.editingComponentTypeId = null;
      // Reset form with subject ID
      this.componentTypeForm.reset({
        subjectId: subjectId,
        componentName: '',
        order: this.getNextOrderNumber(subjectId),
        maxScore: 0,
        isActive: true
      });
    }
  }

  getComponentTypes(subjectId: string): DegreeComponentTypeDto[] {
    return this.componentTypes.get(subjectId) || [];
  }

  getNextOrderNumber(subjectId: string): number {
    const types = this.getComponentTypes(subjectId);
    if (types.length === 0) return 1;
    return Math.max(...types.map(t => t.order)) + 1;
  }

  startAddComponentType(subjectId: string): void {
    this.expandedSubjectId = subjectId;
    this.editingComponentTypeId = null;
    this.componentTypeForm.reset({
      subjectId: subjectId,
      componentName: '',
      order: this.getNextOrderNumber(subjectId),
      maxScore: 0,
      isActive: true
    });
  }

  startEditComponentType(componentType: DegreeComponentTypeDto): void {
    this.editingComponentTypeId = componentType.id;
    this.componentTypeForm.patchValue({
      subjectId: componentType.subjectId,
      componentName: componentType.componentName,
      order: componentType.order,
      maxScore: componentType.maxScore,
      isActive: componentType.isActive
    });
  }

  cancelEdit(): void {
    this.editingComponentTypeId = null;
    this.componentTypeForm.reset();
  }

  onSubmitComponentType(): void {
    if (this.componentTypeForm.invalid) {
      this.markFormGroupTouched(this.componentTypeForm);
      return;
    }

    const formValue = this.componentTypeForm.value;
    
    if (this.editingComponentTypeId) {
      // Update existing component type
      const updateDto: UpdateDegreeComponentTypeDto = {
        componentName: formValue.componentName,
        order: formValue.order,
        maxScore: formValue.maxScore,
        isActive: formValue.isActive
      };

      this.componentTypeService.updateComponentType(this.editingComponentTypeId, updateDto).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.success('Component type updated successfully');
            this.loadComponentTypes();
            this.cancelEdit();
          } else {
            this.toastService.error(response.message || 'Failed to update component type');
          }
        },
        error: (error) => {
          this.toastService.error('Failed to update component type');
          console.error('Update error:', error);
        }
      });
    } else {
      // Create new component type
      const createDto: CreateDegreeComponentTypeDto = {
        subjectId: formValue.subjectId,
        componentName: formValue.componentName,
        order: formValue.order,
        maxScore: formValue.maxScore,
        isActive: formValue.isActive
      };

      this.componentTypeService.createComponentType(createDto).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.success('Component type created successfully');
            this.loadComponentTypes();
            this.cancelEdit();
          } else {
            this.toastService.error(response.message || 'Failed to create component type');
          }
        },
        error: (error) => {
          this.toastService.error('Failed to create component type');
          console.error('Create error:', error);
        }
      });
    }
  }

  deleteComponentType(id: string): void {
    if (confirm('Are you sure you want to delete this component type? This action cannot be undone.')) {
      this.componentTypeService.deleteComponentType(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.success(response.message || 'Component type deleted successfully');
            this.loadComponentTypes();
          } else {
            this.toastService.error(response.message || 'Failed to delete component type');
          }
        },
        error: (error) => {
          this.toastService.error('Failed to delete component type');
          console.error('Delete error:', error);
        }
      });
    }
  }

  startReorder(subjectId: string): void {
    this.reorderingSubjectId = subjectId;
    const componentTypes = this.getComponentTypes(subjectId);
    
    // Create form array for reordering
    const componentTypeIds = this.getReorderFormArray();
    componentTypeIds.clear();
    
    componentTypes.forEach(type => {
      componentTypeIds.push(this.fb.control(type.id));
    });
  }

  cancelReorder(): void {
    this.reorderingSubjectId = null;
    this.reorderForm.reset();
  }

  saveReorder(): void {
    if (!this.reorderingSubjectId) return;

    const componentTypeIds = this.reorderForm.value.componentTypeIds;
    
    this.componentTypeService.reorderComponentTypes(this.reorderingSubjectId, componentTypeIds).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Component types reordered successfully');
          this.loadComponentTypes();
          this.cancelReorder();
        } else {
          this.toastService.error(response.message || 'Failed to reorder component types');
        }
      },
      error: (error) => {
        this.toastService.error('Failed to reorder component types');
        console.error('Reorder error:', error);
      }
    });
  }

  moveUp(subjectId: string, index: number): void {
    const types = this.getComponentTypes(subjectId);
    if (index > 0) {
      const temp = types[index];
      types[index] = types[index - 1];
      types[index - 1] = temp;
      
      // Update order numbers
      types.forEach((type, i) => {
        type.order = i + 1;
      });
      
      // Save new order
      this.saveNewOrder(subjectId, types);
    }
  }

  moveDown(subjectId: string, index: number): void {
    const types = this.getComponentTypes(subjectId);
    if (index < types.length - 1) {
      const temp = types[index];
      types[index] = types[index + 1];
      types[index + 1] = temp;
      
      // Update order numbers
      types.forEach((type, i) => {
        type.order = i + 1;
      });
      
      // Save new order
      this.saveNewOrder(subjectId, types);
    }
  }

  private saveNewOrder(subjectId: string, types: DegreeComponentTypeDto[]): void {
    const componentTypeIds = types.map(t => t.id);
    this.componentTypeService.reorderComponentTypes(subjectId, componentTypeIds).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadComponentTypes(); // Reload to get updated order
        }
      },
      error: (error) => {
        this.toastService.error('Failed to save new order');
        console.error('Save order error:', error);
      }
    });
  }

  getTotalMaxScore(subjectId: string): number {
    const types = this.getComponentTypes(subjectId);
    return types.reduce((total, type) => total + type.maxScore, 0);
  }

  // Helper method to get form array with proper typing
  getReorderFormArray(): FormArray {
    return this.reorderForm.get('componentTypeIds') as FormArray;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Add this method to your component class
  getReorderControls(): any[] {
    const formArray = this.getReorderFormArray();
    return formArray.controls;
  }
}