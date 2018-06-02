import {} from 'jest';
import * as supertest from "supertest";
import { default as data }  from './data';

const request = supertest('http://localhost:4000');

describe('POST /route', () => {
    it('should return a result without error', (done) => {
      return request
        .post('/route')
        .send({dropoffs: `${JSON.stringify(data[0].input)}`})
        .set('Accept', 'application/json')
        .expect(200)
        .then((res) => {
            expect(res.body).toHaveProperty('token');
            return res;
        })
        .then((res) => {
            request.get(`/route/${res.body.token}`)
            .expect(200, (err, res) => {
                expect(res.body).not.toHaveProperty('error');
                done();  
            });
        });
    });
  });

  describe('POST /route', () => {
    it('should failed with wrong token', (done) => {
      return request
        .post('/route')
        .send({dropoffs: `${JSON.stringify(data[0].input)}`})
        .set('Accept', 'application/json')
        .expect(200)
        .then((res) => {
            expect(res.body).toHaveProperty('token');
            return res;
        })
        .then((res) => {
            request.get(`/route/wrong-token`)
            .expect(200, (err, res) => {
                expect(res.body).toHaveProperty('error');
                done();  
            });
        });
    });
  });


  describe('POST empty array /route', () => {
    it('should return status ERROR', (done) => {
      return request
        .post('/route')
        .send({dropoffs: `[]`})
        .set('Accept', 'application/json')
        .expect(500)
        .end((err, res) => {
            expect(res.body).toHaveProperty("error");
            done();
        });
    });
  });
