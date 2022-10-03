import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    getUser(): User {
        const user: User = JSON.parse(localStorage.getItem('PATETHRON'));
        return user;
    }

    getInitDate() {
        const date = JSON.parse(localStorage.getItem('fromDate'));
        return date?.initDate;
    }

}

interface User {
    consignee?: string;
    customerAgentId?: number;
    customerCode?: string;
    customerId?: number;
    lastname: string;
    locationId: number;
    name: string;
    retained?: boolean;
    token: string;
    type: string;
    user: number;
    userId: number;
}