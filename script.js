import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    vus: 60000,
    duration: '1m',
    iterations: 900000
}
export default function () {
    http.get('https://www.jdsports.ie/');
    sleep(1);
}