import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { CreateBadgeComponent } from '../_modals/create-badge/create-badge.component';

@Component({
    selector: 'app-badges',
    templateUrl: './badges.component.html',
    styleUrls: ['./badges.component.scss']
})
export class BadgesComponent extends AppComponent implements OnInit {

    loading = true;

    badges: any = [];

    displayedColumns: string[] = ['image', 'description', 'edit', 'delete'];

    async ngOnInit(): Promise<void> {
        this.badges = await this.http.get(`/api/badges`).toPromise();
        this.loading = false;
    }

    createBadge() {
        const dialog = this.dialog.open(CreateBadgeComponent, {
            minWidth: '50vw',
            // width: '50vw',
            maxHeight: '90vh',
            maxWidth: '95vw'
        });

        dialog.afterClosed()
            .subscribe(async data => {
                this.badges = await this.http.get(`/api/badges`).toPromise();
            });
    }

    editBadge(badge) {
        const dialog = this.dialog.open(CreateBadgeComponent, {
            minWidth: '50vw',
            // width: '50vw',
            maxHeight: '90vh',
            maxWidth: '95vw',
            data: badge
        });

        dialog.afterClosed()
            .subscribe(async data => {
                this.badges = await this.http.get(`/api/badges`).toPromise();
            });
    }

    delteBadge(badge) {
        const dialog = this.dialog.open(ConfirmDialogComponent, {
            // height: '400px',
            width: '400px',
            data: {
                cancelText: 'Cancel',
                confirmText: 'Delete',
                message: 'Are you sure you want to delete, this cannot be undone',
                title: 'Delete Badge?'
            }
        });

        dialog.afterClosed()
            .subscribe(async data => {
                if (data) {
                    try {
                        await this.http.delete(`/api/badge/${badge.id}`).toPromise();
                        this.notif.showSuccess('', 'Successfully deleted badge');
                        this.badges = await this.http.get(`/api/badges`).toPromise();
                    } catch (error) {
                        console.error("Error: ", error);
                        this.notif.showError('', 'Error deleting badge');
                    }
                }
            });
    }

}
