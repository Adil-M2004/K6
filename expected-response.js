import http from 'k6/http';
import { sleep, group, check } from 'k6';

export const options = {
    thresholds: {
        http_req_duration: ['p(95)<1000'],
        'http_req_duration{expected_response:true}': ['p(95)<1000'],
        'group_duration{group:::Main page}': ['p(95)<3000'],
        'group_duration{group:::Main page::Assets}': ['p(95)<1000'],
        'group_duration{group:::News page}': ['p(95)<1000'],
    }
}

export default function () {

    group('Main page', function () {
        let res = http.get('https://b9cc0f4c24d44fc0bb3355b3c24c1af9.api.mockbin.io/?mocky-delay=900ms');
        check(res, { 'status is 200': (r) => r.status === 200 });
    
        group('Assets', function () {
            http.get('https://b9cc0f4c24d44fc0bb3355b3c24c1af9.api.mockbin.io/?mocky-delay=900ms');
            http.get('https://b9cc0f4c24d44fc0bb3355b3c24c1af9.api.mockbin.io/?mocky-delay=900ms');
        });
    });


    group('News page', function () {
        http.get('https://a00866165fa84bffba94fb4279ff8e4f.api.mockbin.io/');
    });

    sleep(1);
}
