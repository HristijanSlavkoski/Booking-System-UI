// app/calendar-safe-url-serializer.ts
import {DefaultUrlSerializer, UrlSerializer, UrlTree} from '@angular/router';

export class CalendarSafeUrlSerializer implements UrlSerializer {
    private delegate = new DefaultUrlSerializer();

    parse(url: string): UrlTree {
        try {
            return this.delegate.parse(url);
        } catch {
            const raw = url || '';

            // Only special-case /calendar: drop bad query/hash and go to plain /calendar
            if (raw.startsWith('/calendar')) {
                return this.delegate.parse('/calendar');
            }

            // For other malformed URLs: keep just the path (/booking?foo=% -> /booking)
            const pathOnly = raw.split('?')[0].split('#')[0] || '/';
            return this.delegate.parse(pathOnly);
        }
    }

    serialize(tree: UrlTree): string {
        return this.delegate.serialize(tree);
    }
}
