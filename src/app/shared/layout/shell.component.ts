import {Component} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {FooterComponent} from "../components/footer/footer.component";
import {RouterOutlet} from "@angular/router";
import {HeaderComponent} from "../components/header/header.component";

@Component({
    selector: 'app-shell',
    standalone: true,
    imports: [TranslateModule, FooterComponent, RouterOutlet, HeaderComponent],
    templateUrl: './shell.component.html',
    styleUrls: ['./shell.component.scss']
})
export class ShellComponent {
}
