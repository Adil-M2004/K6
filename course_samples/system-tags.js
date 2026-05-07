import http from 'k6/http';

export const options = {
    thresholds: {
        http_req_duration: ['p(95)<1000'],
        'http_req_duration{status:200}': ['p(95)<1000'],
        'http_req_duration{status:201}': ['p(95)<1000']
    }
}

export default function () {
    http.get('https://b9cc0f4c24d44fc0bb3355b3c24c1af9.api.mockbin.io/');
    http.get('https://b2e18c3d6404450db94cc4ac448127f1.api.mockbin.io/?mockey-delay=2000ms');
}