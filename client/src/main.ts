import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './bootstrap/app/app.module';

console.log('@', AppModule);
platformBrowserDynamic().bootstrapModule(AppModule);
