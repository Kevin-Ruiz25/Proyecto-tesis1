import { Component, OnInit } from "@angular/core";
import { ApiService } from "app/service/api.service";
import Swal from "sweetalert2";
import { MatTableDataSource } from "@angular/material/table";
@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.css"],
})
export class UserProfileComponent implements OnInit {
  constructor(private api: ApiService) {}
  user: any;
  flag: boolean = false;
  barFlag: any;
  dataSourceUsers = new MatTableDataSource<any>();
  rols: any;
  barFlagForm: any;
  iLastNames: String = "";
  iNames: String = "";
  iNick: String = "";
  iPass: String = "";
  rol: String = "";

  displayedColumns: string[] = ["id", "nombre", "rol", "session"];
  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem("user"));
    if (this.user.rol === "Administrador") {
      this.getUsers();
      this.getRols();
    }
  }

  getUsers() {
    this.barFlag = true;
    this.api.get("usuarios/obtener-todos").subscribe({
      next: (res: any) => {
        if (res.length > 0) {
          this.dataSourceUsers.data = res;
          this.dataSourceUsers.data = [...this.dataSourceUsers.data];
        } else {
          if (this.dataSourceUsers.data.length === 0) {
            this.swalMixin("Aun no existen usuarios para mostrar", "info");
            this.dataSourceUsers.data = [...this.dataSourceUsers.data];
          }
        }
        this.barFlag = false;
      },
      error: (error: any) => {
        this.swalMixin("Error de conexion", "error");
      },
    });
  }

  createUser() {
    this.barFlag = true;
    if(this.iNames === ""){
      this.barFlag = false;
      return this.swalFire("error","Datos Invalidos", "Debe ingresar un nombre");
    }else if(this.iNames.length<2){
      this.barFlag = false;
      return this.swalFire("error","Datos Invalidos", "Nombre demasiado corto");
    }else if(this.iLastNames === ""){
      this.barFlag = false;
      return this.swalFire("error","Datos Invalidos", "Debe ingresar un apellido");
    }else if(this.iLastNames.length<2){
      this.barFlag = false;
      return this.swalFire("error","Datos Invalidos", "Apellido demasiado corto");
    }else if(this.iNick ===""){
      this.barFlag = false;
      return this.swalFire("error","Datos Invalidos", "Debe ingresar un nombre de usuario");
    }else if(this.iNick.length<8){
      this.barFlag = false;
      return this.swalFire("error","Datos Invalidos", "Usuario demasiado corto");
    }else if(this.iPass===""){
      this.barFlag = false;
      return this.swalFire("error","Datos Invalidos", "Debe ingresar una contraseña");
    }else if(this.iPass.length<8){
      this.barFlag = false;
      return this.swalFire("error","Datos Invalidos", "Contraseña demasiado corta");
    }else if(this.rol === ""){
      this.barFlag = false;
      return this.swalFire("error","Datos Invalidos", "Seleccione rol");
    }else{  
    this.api
      .post("usuarios/guardar", {
        id_rol: this.rol,
        nombre: this.iNames,
        apellido: this.iLastNames,
        usuario: this.iNick,
        pass: this.iPass,
        fotografia: "/root",
      })
      .subscribe({
        next: (res: any) => {
          if (res.exito) {
        
            this.iLastNames= "";
            this.iNames = "";
            this.iNick = "";
            this.iPass = "";
            this.rol = "";
            this.swalMixin("Usuario creado con exito", "success");
            this.getUsers();
          } else {
            
              this.swalMixin("No se creo el usuario", "error");
              
            
          }
          this.barFlag = false;
        },
        error: (error: any) => {
    
          this.swalMixin("Error de conexion", "error");
       
        },
      });
    }
  }

  getRols() {
    this.barFlag = true;
    this.api.get("roles/obtener-todos").subscribe({
      next: (res: any) => {
        if (res.length > 0) {
          this.rols = res;
          let adminRol = this.rols.find((element) => element.nombre === 'Administrador');
          let index = this.rols.indexOf(adminRol);
          this.rols.splice(index, 1);
          this.rols = [...this.rols];
          this.barFlag = false;
        } else {
          if (this.rols.length === 0) {
            this.swalMixin("Porfavor recarga la pagina", "info");
            this.rols = [...this.rols];
          }
          this.barFlag = false;
        }
      },
      error: (error: any) => {
       
        this.swalMixin("Error de conexion", "error");
  
      },
    });
  }

  swalFire(icon, title, text){
    Swal.fire({
      icon: icon,
      title: title,
      text: text,
    });
  }
  swalMixin(title, icon) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });
    Toast.fire({
      icon: icon,
      title: title,
    });
    this.barFlag = false;
  }
}
