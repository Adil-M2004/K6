import http from 'k6/http';
import { sleep } from 'k6';

export const options = {

    stages: [
        { duration: '5m', target: 1000 },
        { duration: '8h', target: 1000 },
        { duration: '5m', target: 0 },
    ]
}
export default function () {
    http.get('https://quickpizza.grafana.com/test.k6.io/');
    sleep(1);
    http.get('https://quickpizza.grafana.com/contacts.php');
    sleep(2);
    http.get('https://quickpizza.grafana.com/news.php');
    sleep(2);
}