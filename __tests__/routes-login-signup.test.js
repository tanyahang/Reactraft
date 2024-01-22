const request = require('supertest');
const server = 'http://localhost:3000';
const db = require('../server/models/dbModel');
const { encrypt } = require('../server/helpers/encryptDecrypt');

let testUserId;
let sessionId;
const testUser = {
  username: 'test_routes_auth',
  email: 'test@123.com',
  password: '1234',
};

beforeAll(async () => {
  const { username, email, password } = testUser;
  const testUserResponse = await db.query(
    'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *;',
    [username, email]
  );
  testUserId = testUserResponse.rows[0]._id;
  sessionId = encrypt(String(testUserId));

  await db.query(
    "INSERT INTO passwords (user_id, hashed_psw) VALUES ($1, crypt($2, gen_salt('md5')));",
    [testUserId, password]
  );
});

describe('/signup and /login route', () => {
  describe('/login', () => {
    describe('GET', () => {
      it('responds with 200 status and text/html content type', () => {
        return request(server)
          .get('/login')
          .expect('Content-Type', /text\/html/)
          .expect(200);
      });
    });

    describe('POST', () => {
      it('responds with 302 status and redirects to /home', async () => {
        const response = await request(server)
          .post('/login')
          .send({ username: 'test_routes_auth', password: '1234' })
          .redirects(0);

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/home');
      });
    });

    it("responds with 400 status and an error message of 'Username not found'", async () => {
      const response = await request(server)
        .post('/login')
        .send({
          username: 'test_routes_auth_1',
          password: '1234',
        })
        .redirects(0);

      expect(response.status).toBe(400);
      expect(response.text).toContain('Username not found');
    });

    it("responds with 400 status and an error message of 'Password incorrect'", async () => {
      const response = await request(server)
        .post('/login')
        .send({
          username: 'test_routes_auth',
          password: '12345',
        })
        .redirects(0);

      expect(response.status).toBe(400);
      expect(response.text).toContain('Password incorrect');
    });
  });

  describe('/signup', () => {
    describe('GET', () => {
      it('responds with 200 status and text/html content type', () => {
        return request(server)
          .get('/signup')
          .expect('Content-Type', /text\/html/)
          .expect(200);
      });
    });

    describe('POST', () => {
      it('responds with 302 status and redirects to /home', async () => {
        const response = await request(server)
          .post('/signup')
          .send({
            username: 'test_signup',
            email: 'test_signup@email.com',
            password: '1234',
          })
          .redirects(0);

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/home');
      });
    });

    it("responds with 400 status and an error message of ''Username in use''", async () => {
      const response = await request(server)
        .post('/signup')
        .send({
          username: 'test_routes_auth',
          email: 'test_signup1@email.com',
          password: '1234',
        })
        .redirects(0);

      expect(response.status).toBe(400);
      expect(response.text).toContain('Username in use');
    });

    it("responds with 400 status and an error message of ''Email in use''", async () => {
      const response = await request(server)
        .post('/signup')
        .send({
          username: 'test_signup1',
          email: 'test_signup@email.com',
          password: '1234',
        })
        .redirects(0);

      expect(response.status).toBe(400);
      expect(response.text).toContain('Email in use');
    });

    afterAll(async () => {
      const testUser2Response = await db.query(
        'SELECT * FROM users WHERE username = $1;',
        ['test_signup']
      );
      const testUserId2 = testUser2Response.rows[0]._id;
      await db.query('DELETE FROM passwords WHERE user_id = $1;', [
        testUserId2,
      ]);
      await db.query('DELETE FROM users WHERE _id = $1;', [testUserId2]);
    });
  });
});

describe('/home', () => {
  describe('GET', () => {
    it(
      'responds with 200 status and text/html content type ' +
        'and serves the landing page',
      () => {
        return request(server)
          .get('/home')
          .expect('Content-Type', /text\/html/)
          .expect(200)
          .expect((res) => {
            expect(res.text).toContain('<body id="landing-page">');
          });
      }
    );
    it(
      'responds with 200 status and text/html content type ' +
        'and serves the react app',
      () => {
        return request(server)
          .get('/home')
          .set('Cookie', `sessionID=${sessionId}`)
          .expect('Content-Type', /text\/html/)
          .expect(200)
          .expect((res) => {
            expect(res.text).toContain('<div id="root">');
          });
      }
    );
  });
});

afterAll(async () => {
  await db.query('DELETE FROM passwords WHERE user_id = $1;', [testUserId]);
  await db.query('DELETE FROM users WHERE _id = $1;', [testUserId]);
});
