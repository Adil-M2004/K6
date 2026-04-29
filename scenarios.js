import http from 'k6/http';
import { check } from 'k6';

export default function () {
    const res = http.get('https://quickpizza.grafana.com/test.k6.io');
    check(res, {
        'status is 200': (r) => r.status === 200
    });

    check(res, {
        'page is startpage': (r) => r.body === 'This is a replacement of the service previously found at https://test.k6.io. Click here to go back to the main QuickPizza page, which contains more functionality for writing HTTP tests.'
    });
}