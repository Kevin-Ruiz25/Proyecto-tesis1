import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ApiService } from "app/service/api.service";
import { AuthService } from "app/service/auth.service";
import { SessionService } from "app/service/session-service.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  user: string = "";
  pass = "";
  error = "";
  flagRegisterForm: boolean = false;
  nameRegister: string = "";
  nickNameRegister: string = "";
  emailRegister: string = "";
  passwordRegister: string = "";
  constructor(
    private router: Router,
    private authService: AuthService,
    private _cdr: ChangeDetectorRef,
    private api: ApiService,
    private status: SessionService
  ) {}

  ngOnInit(): void {
    this.router.navigate([""]);
  }

  iniciarSesion() {
    this.api
      .post("auth/login", {
        usuario: this.user,
        password: this.pass,
      })
      .subscribe(
        (res: any) => {
          if (res.exito === true) {
            if(this.status.getSession(res.sesion)){
            // if (res.session === true) {
              this.iniciarSesion
              localStorage.setItem("user",JSON.stringify(res));
              // console.log(JSON.stringify(res));
              // localStorage.setItem("session", response);

              this.router.navigate(["/layout/user-profile"]);
            } else {
              this.swalFire(
                "error",
                "Oops...",
                "Ya existe otra session abierta"
              );
              this._cdr.detectChanges();
            }
            // const token = this.authService.currentUserValue.token;
            //if (token) {
          } else {
            this.swalFire("error", "Oops...", "Usuario no registrado");
          }
        },
        (error) => {
          this.swalFire("error", "Oops...", "Intente de nuevo");
          this._cdr.detectChanges();
        }
      );
  }

  showRegisterForm() {
    if (this.flagRegisterForm === false) {
      this.flagRegisterForm = true;
    } else if (this.flagRegisterForm === true) {
      this.flagRegisterForm = false;
    }
  }

  registroUsuario() {
    let registerUser = {
      nombreUser: this.nameRegister,
      nickNameUser: this.nickNameRegister,
      emailUser: this.emailRegister,
      passwordUser: this.passwordRegister,
    };
    this.api.post("user/register", registerUser).subscribe(
      (res) => {
        if (res === 0) {
          Swal.fire({
            icon: "success",
            title: "Exito",
            text: "Usuario registrado con exito, inicie sesion",
          });
          this.flagRegisterForm = false;
          let respones = res;
        } else {
          Swal.fire({
            icon: "error",
            title: "Opps...",
            text: "Parece que el usuario ya existe",
          });
          this.flagRegisterForm = false;
        }
      },
      (error: any) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Problemas con el servidor, intente de nuevo",
        });
        this._cdr.detectChanges();
        this.flagRegisterForm = false;
      }
    );
  }
  swalFire(icon, title, text) {
    Swal.fire({
      icon: icon,
      title: title,
      text: text,
    });
    this._cdr.detectChanges();
  }
}

// }
