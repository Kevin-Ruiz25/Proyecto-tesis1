import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";

import * as Chartist from "chartist";
import { ApiService } from "../service/api.service";
import { HttpErrorResponse } from "@angular/common/http";
import { TableVirtualScrollDataSource } from "ng-table-virtual-scroll";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ViewDataClientComponent } from "app/view-data-client/view-data-client.component";
import Swal from "sweetalert2";

declare const google: any;
@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  dataSourceToVisit = new MatTableDataSource<any>();
  dataSourceVisited = new MatTableDataSource<any>();
  barFlag = true;
  locationService: any;
  long: any;
  lat: any;

  constructor(private api: ApiService, public dialog: MatDialog) {}

  ngOnInit() {
    // let coords = this.location;
    this.getClientsToVisit();
    this.getClientsVisited();
    // this.getPosition();
    // this.getLocation();
    this.maps("14.686448", "-90.529957");
  }
  getClientsToVisit() {
    // item.awbLoading = true;
    this.api
      .post("clientes/obtener-todos", {
        visitado: false,
      })
      .subscribe({
        next: (res: any) => {
          if (res.length > 0) {
            this.dataSourceToVisit.data = res;
            this.dataSourceToVisit.data = [...this.dataSourceToVisit.data];
            this.barFlag = false;
          } else {
            this.dataSourceToVisit.data = [...this.dataSourceToVisit.data];
            this.swalMixin("Clientes sin asignar", "info");
            this.barFlag = false;
          }
        },
        error: (error: any) => {
          this.barFlag = false;
          this.swalMixin("Error de conexion", "error");
         
        },
      });
  }

  getClientsVisited() {
    this.barFlag = true;
    this.api
      .post("clientes/obtener-todos", {
        visitado: true,
      })
      .subscribe({
        next: (res: any) => {
          if (res.length > 0) {
            this.dataSourceVisited.data = res;
            this.dataSourceVisited.data = [...this.dataSourceVisited.data];
            this.barFlag = false;
          } else {
            if (this.dataSourceVisited.data.length === 0) {
              this.swalMixin("Aun no visitas ningun cliente", "info");
              this.dataSourceVisited.data = [...this.dataSourceVisited.data];
            }
            this.barFlag = false;
          }
        },
        error: (error: any) => {
          this.barFlag = false;
          this.swalMixin("Error de conexion", "error");
          
        },
      });
  }

  displayedColumns: string[] = ["id", "name", "action", "delete"];
  displayedColumnsClientesVisitados: string[] = ["id", "name", "visitado","delete"];
  visitedClient(row: any) {
    this.getUbication();
    let idAdress = null;
    this.api
      .post("direcciones/obtener", {
        id_usuario: row.id_usuario_registro,
        id_cliente: row.id_cliente,
      })
      .subscribe({
        next: (res: any) => {
          let dataAdress = res;
          if (dataAdress.length !== 0) {
            idAdress = dataAdress.find(
              (element) => element.activa === true
            ).id_direccion;
            this.api
              .post("direcciones/registrar_visita", {
                latitud: this.lat,
                longitud: this.long,
                visitado: true,
                id_usuario: row.id_usuario_registro,
                id_cliente: row.id_cliente,
                id_direccion: idAdress,
              })
              .subscribe({
                next: (res: any) => {
                  if (res.exito) {
                    let index = this.dataSourceToVisit.data.indexOf(row);
                    this.dataSourceToVisit.data.splice(index,1);
                    this.dataSourceToVisit.data = [...this.dataSourceToVisit.data];
                    this.getClientsVisited();
                    this.swalMixin("Visita registrada con exito", "success");
                  } else {
                    this.swalMixin(res.msj, "error");
                  }
                },
                error: (error: any) => {
                  this.swalMixin("Error de conexion", "error");
                 ("error: " + error);
                },
              });
          } else {
            this.swalMixin("Ninguna direccion encontrada", "error");
          }
        },
        error: (error: any) => {
          this.swalMixin(error, "error");
         ("error: " + error);
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

  getUbication(): any {
    if (navigator.geolocation) {
      const timeoutVal = 10 * 1000 * 1000;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.lat = position?.coords?.latitude;
          this.long = position?.coords?.longitude;
          if (this.lat !== undefined && this.long !== undefined) {
            this.lat = this.lat - 0.0000961;
            this.long = this.long - 0.0000337;
            this.maps(this.lat, this.long);
            // return this.lat + "," + this.long;
          }
        },
        (error) => {
          console.log(error);
        },
        { enableHighAccuracy: true, timeout: timeoutVal, maximumAge: 0 }
      );
    } else {
      this.swalMixin("Geolocalizacion no es soportado", "info");
    }
  }

  clickRow(row: any) {
    const dialogRef = this.dialog.open(ViewDataClientComponent, {
      width: "600px",
      data: {
        client: row,
      },
    });
    dialogRef.afterClosed().subscribe((comment: string) => {
      if (comment === undefined) return; // exit if user cancels
    });
  }

  getUbicationClient(row: any){
    this.api.post('direcciones/obtener', {
      id_usuario: row.id_usuario_registro,
      id_cliente: row.id_cliente
    }).subscribe({
      next: (res: any) => {
        if (res.length > 0) {
          let direccion = res.find((element) => element.activa === true);
          this.maps(direccion.latitud, direccion.longitud);
          // this.observaciones = res.find((element) => element.activa === true).observaciones;
        }
      },
      error: (error: any) => {
        this.swalMixin("Error al obtener Ubicacion", "error");
      },
    })
  }

  maps(lat, long) {
    var myLatlng = new google.maps.LatLng(lat, long);

    // const searchBox = new google.maps.places.SearchBox("");
    var mapOptions = {
      zoom: 13,
      center: myLatlng,
      scrollwheel: false, //we disable de scroll over the map, it is a really annoing when you scroll through page
      styles: [
        {
          featureType: "water",
          stylers: [
            {
              saturation: 43,
            },
            {
              lightness: -11,
            },
            {
              hue: "#0088ff",
            },
          ],
        },
        {
          featureType: "road",
          elementType: "geometry.fill",
          stylers: [
            {
              hue: "#ff0000",
            },
            {
              saturation: -100,
            },
            {
              lightness: 99,
            },
          ],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [
            {
              color: "#808080",
            },
            {
              lightness: 54,
            },
          ],
        },
        {
          featureType: "landscape.man_made",
          elementType: "geometry.fill",
          stylers: [
            {
              color: "#ece2d9",
            },
          ],
        },
        {
          featureType: "poi.park",
          elementType: "geometry.fill",
          stylers: [
            {
              color: "#ccdca1",
            },
          ],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [
            {
              color: "#767676",
            },
          ],
        },
        {
          featureType: "road",
          elementType: "labels.text.stroke",
          stylers: [
            {
              color: "#ffffff",
            },
          ],
        },
        {
          featureType: "poi",
          stylers: [
            {
              visibility: "off",
            },
          ],
        },
        {
          featureType: "landscape.natural",
          elementType: "geometry.fill",
          stylers: [
            {
              visibility: "on",
            },
            {
              color: "#b8cb93",
            },
          ],
        },
        {
          featureType: "poi.park",
          stylers: [
            {
              visibility: "on",
            },
          ],
        },
        {
          featureType: "poi.sports_complex",
          stylers: [
            {
              visibility: "on",
            },
          ],
        },
        {
          featureType: "poi.medical",
          stylers: [
            {
              visibility: "on",
            },
          ],
        },
        {
          featureType: "poi.business",
          stylers: [
            {
              visibility: "simplified",
            },
          ],
        },
      ],
    };
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);

    var marker = new google.maps.Marker({
      position: myLatlng,
      title: "Position",
    });

    // To add the marker to the map, call setMap();
    marker.setMap(map);
  }

  deleteCliente(id: any){
    this.api.delete("clientes/eliminar/"+id).subscribe({
      next: (res: any) => {
        if (res.exito) {
          this.swalMixin("Cliete eliminido con exito", "success");
          this.ngOnInit();
          // this.observaciones = res.find((element) => element.activa === true).observaciones;
        }
      },
      error: (error: any) => {
        this.swalMixin("Error al eliminar cliente, intente de nuevo", "error");
      },
    })

  }
}
