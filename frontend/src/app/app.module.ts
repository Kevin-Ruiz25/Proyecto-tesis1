import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component'; 
import { MaterialModule } from './material-module';
import { ViewDataClientComponent } from './view-data-client/view-data-client.component';
import { LoginComponent } from './login/login.component';




@NgModule({
  imports: [
  
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ComponentsModule,
    RouterModule,
    AppRoutingModule,
    MaterialModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ,
    NO_ERRORS_SCHEMA],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    ViewDataClientComponent,
    LoginComponent,
   

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
