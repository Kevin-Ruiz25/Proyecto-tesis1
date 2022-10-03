import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { ApiService } from "app/service/api.service";
import { apigateway } from "googleapis/build/src/apis/apigateway";
import Swal from "sweetalert2";

@Component({
  selector: "app-table-list",
  templateUrl: "./table-list.component.html",
  styleUrls: ["./table-list.component.css"],
})
export class TableListComponent implements OnInit {
  constructor(private api: ApiService, 
    public dialog: MatDialog
    ) {
      
    }
  user: any;
  flag: boolean = false;
  barFlagForm: boolean = false;
  barFlagTable: boolean = true;
  ngOnInit() {
    this.getMyClients();
    this.user = JSON.parse(localStorage.getItem("user"))
  }

  iNames: String = "";
  iLastNames: String = "";
  iDpi: String = "";
  iAdress: String = "";
  iCity: String = "Guatemala";
  iCountry: String = "Guatemala";
  iPhone: String = "";
  iComments: String = "";
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ["id", "name", "telefono", "visitado", "fecha" ];

  createClient() {
    this.barFlagForm = true;
    if (this.iNames == "") {
      this.barFlagForm = false;
      return Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ingresa nombre del cliente",
      });
    } else if (this.iNames.length < 2) {
      this.barFlagForm = false;
      return Swal.fire({
        icon: "error",
        title: "Error",
        text: "Nombre demasiado corto",
      });
    } else if (this.iLastNames === "") {
      this.barFlagForm = false;
      return Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ingresa apellido del cliente",
      });
    } else if (this.iLastNames.length < 2) {
      this.barFlagForm = false;
      return Swal.fire({
        icon: "error",
        title: "Error",
        text: "Apellido demasiado corto",
      });
    } else if (this.iDpi.toString() === "") {
      this.barFlagForm = false;
      return Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ingresa DPI del cliente",
      });
    } else if (this.iDpi.toString().length !== 13) {
      this.barFlagForm = false;
      return Swal.fire({
        icon: "error",
        title: "Error",
        text: "DPI invalido, verifica de nuevo",
      });
    } else if (this.iAdress === "") {
      this.barFlagForm = false;
      return Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ingresa direccion de cliente",
      });
    } else if (this.iAdress.length < 10) {
      this.barFlagForm = false;
      return Swal.fire({
        icon: "error",
        title: "Error",
        text: "Direccion demasiado corta",
      });
    } else if (this.iPhone.toString() === "") {
      this.barFlagForm = false;
      return Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ingresa numero de telefono",
      });
    } else if (this.iPhone.toString().length !== 8) {
      this.barFlagForm = false;
      return Swal.fire({
        icon: "error",
        title: "Error",
        text: "Telfono invalido, ingresa de nuevo",
      });
    } else {
      this.api
        .post("clientes/guardar", {
          nombres: this.iNames,
          apellidos: this.iLastNames,
          dpi: this.iDpi.toString(),
          telefono: this.iPhone.toString(),
          id_usuario: 5, //id de perfil
          direccion: this.iAdress, // direccion :v el backend dice que si se llama el campo xD
          fotografia: "ruta///",
          observaciones: this.iComments,
        })
        .subscribe({
          next: (res: any) => {
            if (res.exito) {
              this.getMyClients();
              this.iNames = "";
              this.iLastNames = "";
              this.iDpi = "";
              this.iAdress = "";
              this.iPhone = "";
              this.iComments = "";
              this.barFlagForm = false;

              this.swalMixin("Cliente ingresado con exito", "success");
            } else {
              this.barFlagForm = false;
              Swal.fire({
                icon: "error",
                title: "Intente de nuevo",
                text: res.msj,
              });
            }
          },
          error: (error: any) => {
            this.barFlagForm = false;
           ("Error" + error);
            return Swal.fire({
              icon: "error",
              title: "Intenta de nuevo",
              text: "Fallo de conexion con la base de datos",
            });
          },
        });
    }
  }

  // pushClients(){

  // }
  getMyClients() {
    this.api.get("clientes/obtener-por-vendedor/" + 5).subscribe({
      next: (res: any) => {
        if (res.lenght !==0) {
          this.dataSource.data = res;
          this.barFlagTable = false;
          this.dataSource.data = [...this.dataSource.data];
          this.swalMixin("Clientes actualizados", "success");
        } else {
          this.barFlagTable = false;
          this.swalMixin("Ningun cliente para mostrar", "info");
        }
        
      },
      error: (error: any) => {
        this.barFlagTable = false;
        if (this.dataSource.data.length === 0) {
          this.swalMixin("Ningun cliente para mostrar", "info");
        }
        this.dataSource.data = [...this.dataSource.data];
      },
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
  }
  showForm() {
    if (this.flag === false) {
      this.flag = true;
    } else if (this.flag === true) {
      this.flag = false;
    }
  }
}
