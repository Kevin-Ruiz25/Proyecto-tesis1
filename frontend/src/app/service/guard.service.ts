
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
  })
  export class GuardService implements CanActivate {
      
    constructor(
        private authService: AuthService,
        private api : ApiService,
        private router : Router
    ) { }

    canActivate(route : ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        //1) VERIFICAR SI ESTA LOGUEADO
        /*let patethron = JSON.parse(localStorage.getItem('PATETHRON'))
        if(patethron!==undefined && patethron!==null) {
            //2) VERIFICAR SI TIENES EL ROL NECESARIO PARA ACCEDER A ESA PAGINA
            //url -> /consulta -- Obteniendo el url de la ventana actual
            let url = state.url
            let urlSubmenu = ''
            let urlModule = ''
            if(url.split('/').length>2) {
                urlModule = url.split('/')[1]
                urlSubmenu = url.split('/')[2]
            }

            //Obteniendo las ventanas a las que puede acceder el usuario
            this.api.get(`User/menu/${patethron.userId}`).subscribe((menu: any[]) => {
                const configuredMenu = menu.map(({title, icon, moduleName, subMenus}: {title: string, icon: string, moduleName: string, subMenus: any[]}) => {
                  const configuredSubMenu = [];
                  subMenus.forEach(({title, url, subMenu, positionNo}) => {
                    if (url === 'login.mxml') url = 'authentication/signin';
                    if (subMenu === '') configuredSubMenu.push({title, url, positionNo, subMenu: []});
                    else {
                      let index = configuredSubMenu.findIndex(s => s.title === subMenu);
                      if (index < 0) {
                        index = (configuredSubMenu.push({title: subMenu, subMenu: []})) - 1;
                      }
                      configuredSubMenu[index].subMenu.push({title, url, positionNo, subMenu: []})
                    }
                  })
        
                  return { title, icon, moduleName, subMenus: configuredSubMenu};
                })
                let sidebarItems = configuredMenu;
                let cont = 0
                for(let sidebarItem of sidebarItems) {
                    if(sidebarItem.moduleName===urlModule) {
                        for(let submenu of sidebarItem.subMenus) {
                            if(submenu.url===urlSubmenu) {
                                cont++
                            }
                        }
                    }
                }
    
                if(cont>0) {
                    return true
                } else {
                    this.router.navigate(['/authentication/page403'])
                    return false
                }
            })
        } else {
            this.authService.logout().subscribe((res) => {
                if (!res.success) {
                  this.router.navigate(['/authentication/signin']);
                }
              });
            return false
        }*/
        
        return true
    }

  }