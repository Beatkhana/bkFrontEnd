import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor(private toastr: ToastrService) { }

    config = {
        closeButton: true,
        timeOut: 3000,
        positionClass: 'toast-bottom-right',
        tapToDismiss: false
    }

    showSuccess(title, message) {
        this.toastr.success(message, title, this.config)
    }

    showError(title, message) {
        this.toastr.error(message, title, this.config)
    }

    showInfo(title, message) {
        this.toastr.info(message, title, this.config)
    }

    showWarning(title, message) {
        this.toastr.warning(message, title, this.config)
    }
}