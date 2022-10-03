import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class PdfService {
    open(content: Uint8Array) {
        const file = new Blob([content], { type: 'application/pdf;base64' });
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL);
    }
}