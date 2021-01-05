import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/toast.service';
import { editUserDialog } from 'src/app/users/users.component';

@Component({
    selector: 'app-create-badge',
    templateUrl: './create-badge.component.html',
    styleUrls: ['./create-badge.component.scss']
})
export class CreateBadgeComponent implements OnInit {

    badgeForm: FormGroup;

    loading = false;

    badgeId;

    title = 'Create Badge';

    constructor(
        private fb: FormBuilder,
        public http: HttpClient,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<editUserDialog>,
        private notif: NotificationService
    ) { }

    ngOnInit(): void {
        if(this.data) {
            this.title = 'Update Badge';
            this.badgeId = this.data.id;
            this.badgeForm = this.fb.group({
                image: '',
                description: [this.data.description, [
                    Validators.required
                ]],
                imgName: [this.data.image, [
                    Validators.required
                ]]
            });
        } else {
            this.badgeForm = this.fb.group({
                image: ['', [
                    Validators.required
                ]],
                description: ['', [
                    Validators.required
                ]],
                imgName: ['', [
                    Validators.required
                ]]
            });
        }
    }

    async onSubmit() {
        this.loading = true;
        try {
            if(this.badgeId) {
                await this.http.put(`/api/badge/${this.badgeId}`, this.badgeForm.value).toPromise();
                this.notif.showSuccess('', 'Successfully created badge');
                this.dialogRef.close(false);
            } else {
                await this.http.post(`/api/badge`, this.badgeForm.value).toPromise();
                this.notif.showSuccess('', 'Successfully created badge');
                this.dialogRef.close(false);
            }
        } catch (error) {
            console.error("Error: ", error);
            this.notif.showError('', 'Error creating badge');
            this.dialogRef.close(false);
        }
    }

    onFileChanged(event) {
        let selectedFile = event.target.files[0];
        this.badgeForm.patchValue({ imgName: selectedFile.name });

        let reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = () => {
            this.badgeForm.patchValue({ image: reader.result });
        };
    }

}
