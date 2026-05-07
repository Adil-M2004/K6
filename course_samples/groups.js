import http from 'k6/http';
import { sleep, group, check } from 'k6';

export const options = {
    thresholds: {
        http_req_duration: ['p(95)<250'],
        'group_duration{group:::Main page}': ['p(95)<8000'],
        'group_duration{group:::News page}': ['p(95)<6000'],
        'group_duration{group:::Main page::Assets}': ['p(95)<6000']
    }
}

export default function () {

    group('Main page', function () {

        let res = http.get('https://0d5772c1bef44d0a8d5ff80cbbdc1cf1.api.mockbin.io/?mocky-delay=5000ms');
        check(res, { 'status is 200': (r) => r.status === 200 });

        group('Assest', function () {
            http.get('https://0d5772c1bef44d0a8d5ff80cbbdc1cf1.api.mockbin.io/?mocky-delay=1000ms');
        });

    });


    group('News page', function () {
        http.get('https://0d5772c1bef44d0a8d5ff80cbbdc1cf1.api.mockbin.io/?mocky-delay=5000ms');
    });

    sleep(1);
}
