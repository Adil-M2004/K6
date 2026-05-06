import http from 'k6/http';
import { sleep } from 'k6';
import exec from 'k6/execution';

export const options = {
    vus: 10,
    duration: '60s'
}

export function setup() {
    let res = http.get('https://quickpizza.grafana.com/test.k6.io/');
    if (res.error) {
        exec.test.abort('Aboarting test. Application is DOWN');
    }
}

export default function () {
    http.get('https://quickpizza.grafana.com/test.k6.io/');

    sleep(1);
}