import { Component, HostListener, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../../service/api.service";
import { WINDOW } from "../../service/window.service";

declare const $: any;
declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
  rol: string;
}

export const ROUTES: RouteInfo[] = [
  { path: "user-profile", title: "Perfil", icon: "person", class: "" ,rol: "Administrador"},
  { path: "dashboard", title: "Cobrador", icon: "dashboard", class: "", rol: "Cobrador"},
  { path: "table-list", title: "Vendedor", icon: "content_paste", class: "", rol: "Vendedor"},

  // { path: '/typography', title: 'Typography',  icon:'library_books', class: '' },
  // { path: '/icons', title: 'Icons',  icon:'bubble_chart', class: '' },

  // { path: '/notifications', title: 'Notifications',  icon:'notifications', class: '' },
  // { path: '/upgrade', title: 'Upgrade to PRO',  icon:'unarchive', class: 'active-pro' },
  // {path: 'log-out', title: 'Log Out',  icon:'logout', class: '' }
];

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"],
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  user: any;
  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.menuItems = ROUTES.filter((menuItem) => menuItem);
  }
  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  }

  logOut(): void {
    this.api
      .post("auth/logout", {
        usuario: this.user?.usuario,
      })
      .subscribe({
        next: (res: any) => {
          localStorage.removeItem("user");
          this.router.navigate([""]);
        },
        error: (error: any) => {
          localStorage.removeItem("user");
          this.router.navigate([""]);
        },
      });
  }

  clickProfile(){
    
  }

  // @HostListener('window:beforeunload')
  ngOnDestroy() {
    // get user id
    this.logOut();
    this.router.navigate([""]);
    localStorage.removeItem("user");
     // sign out user
  }
}
