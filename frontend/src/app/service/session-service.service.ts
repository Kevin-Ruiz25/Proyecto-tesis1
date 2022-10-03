import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class SessionService {
  constructor() {}

  getSession(session: any) {
    if (!session) {
      return false;
    } else {
      return true;
    }
  }
}
