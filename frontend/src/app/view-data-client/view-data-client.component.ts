import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ApiService } from "app/service/api.service";

@Component({
  selector: "app-view-data-client",
  templateUrl: "./view-data-client.component.html",
  styleUrls: ["./view-data-client.component.scss"],
})
export class ViewDataClientComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private api: ApiService,) { }

  direccion: any = "";
  observaciones: any = "";
  ngOnInit(): void {
    this.getAdress();
    console.log(this.data);
  }

  getAdress() {
    this.api.post('direcciones/obtener-direcciones', {
      id_usuario: this.data.client.id_usuario_registro,
      id_cliente: this.data.client.id_cliente
    }).subscribe({
      next: (res: any) => {
        if (res.length > 0) {
          this.direccion = res.find((element) => element.activa === true).direccion;
          this.observaciones = res.find((element) => element.activa === true).observaciones;
        }
      },
      error: (error: any) => {

      },
    })
  }
}
