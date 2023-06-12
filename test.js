import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 8,
  duration: '180s',
};

export default function () {
  http.get('http://14.225.238.137:3000/convert?url=https://apis.ezpics.vn/createImageFromTemplate/?id=1202&width=1754&height=1754');
  sleep(1);
}