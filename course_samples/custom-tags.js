import http from 'k6/http';
import { Counter } from 'k6/metrics';
import { check, sleep } from 'k6';

export const options = {
    thresholds: {
        http_req_duration: ['p(95)<300'],
        'http_req_duration{page:order}': ['p(95)<250'],
        http_errors: ['count==0'],
        'http_errors{page:order}': ['count==0'],
        checks: ['rate>=0.99'],
        'checks{page:order}': ['rate>=0.99']
    }
}

let httpErrors = new Counter('http_errors');

export default function () {
    let res = http.get('https://b9cc0f4c24d44fc0bb3355b3c24c1af9.api.mockbin.io/');

    if (res.error) {
        httpErrors.add(1);
    }

    check(res, {
        'status is 200': (r) => r.status === 200
    });

    // Submit order
    res = http.get(
        'https://b2e18c3d6404450db94cc4ac448127f1.api.mockbin.io/?mockey-delay=2000ms',
        {
            tags: {
                page: 'order'
            }
        }
    );

    if (res.error) {
        httpErrors.add(1, { page: 'order' });
    }

    check(res, {'status is 201': (r) => r.status === 201 }, { page: 'order' });

    sleep(1);
}
