import {} from 'jest';
import * as supertest from "supertest";
import { default as data }  from './data';

const request = supertest('http://localhost:4000');

describe('POST /route', () => {
  it('should return 200 OK', (done) => {
    return request
      .post('/route')
      .send({dropoffs: `${JSON.stringify(data[0].input)}`})
      .expect(200, done);
  });
});

describe('GET /route', () => {
    it('should return 200 OK', (done) => {
      return request
        .post('/route')
        .send({dropoffs: `${JSON.stringify(data[0].input)}`})
        .expect(200, done);
    });
  });
