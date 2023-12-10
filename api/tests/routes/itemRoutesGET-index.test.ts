import request from 'supertest';
import makeApp from '../../src/app';
import * as database from '../../src/database';
import ExpressError from '../../src/utils/ExpressError';
import { UserInDB} from '../../src/typeDefinitions'; // Replace 'path/to/ItemInDBPopulated' with the actual path

const app = makeApp(database);

// routes
const loginRoute = '/auth/login';
const logoutRoute = '/auth/logout';
const itemRoute = '/item';

let globalUserBodo: UserInDB;

// mocks
jest.mock('../../src/utils/ExpressError');

// frequently used functions
const loginBodo4 = async () => {
  const loginBodo4Response = await request(app).post(loginRoute).send({
    email: 'bodo4@gmail.com',
    password: 'bodo4',
  });
  // Access the headers and get the 'set-cookie' header
  const setCookieHeader = loginBodo4Response.headers['set-cookie'];
  // Extract the connect.sid value from the 'set-cookie' header
  const connectSidValue = setCookieHeader[0].split(';')[0].split('=')[1];
  // console.log('connect.sid value:', connectSidValue);
  globalUserBodo = loginBodo4Response.body

  return connectSidValue;
};

const logout = async (connectSidValue: string) => {
  await request(app)
    .post(logoutRoute)
    .set('Cookie', [`connect.sid=${connectSidValue}`]);
};

// pass in the route which is protected by the isLoggedIn middleware
// test, that middleware is doing it's route protecting properly
const notPassedIsLoggedIn = (httpVerb: string, route: string) => {
  const invalidConnectSidValue =
    's%3AnFsjM4XUm0O8fA0JrqIKBQFDjTOp538v.uJgEmwcCkUfu1fIRpleL0DTM58naHwgEzD5gDw%2B82tY';

  describe('when isLoggedIn was not passed', () => {
    it('should respond error with a statusCode401 if req.user undefined', async () => {
      const response = await (request(app) as any)[httpVerb](route);

      expect(ExpressError).toHaveBeenCalledWith('Unauthorized', 401);
      expect(ExpressError).toHaveBeenCalledTimes(1);
    });
    it('should respond error with a statusCode401 if invalid session cookie is sent', async () => {
      const response = await (request(app) as any)
        [httpVerb](route)
        .set('Cookie', [`connect.sid=${invalidConnectSidValue}`]);

      expect(ExpressError).toHaveBeenCalledWith('Unauthorized', 401);
      expect(ExpressError).toHaveBeenCalledTimes(1);
    });
  });
};

// TODO: test is missing a user for whom no items are available
describe('item Routes', () => {
    // close DB after tests ran - to get rid of db related error
    afterAll(async () => {
      await database.closeDatabaseConnection();
    });
  
    describe(`GET ${itemRoute} (index)`, () => {
      notPassedIsLoggedIn('post', itemRoute);
      describe('when items are availabe for user', () => {
        it('should respond successful with a statusCode200 and return available items for user', async () => {
          const connectSidValue = await loginBodo4();
          const index_response = await request(app)
            .get('/item')
            .set('Cookie', [`connect.sid=${connectSidValue}`]);
      
          //expect success status code
          expect(index_response.status).toBe(200);
          //expect response body to be an array
          expect(index_response.body).toBeInstanceOf(Array);
    
          //expect response body to contain items
          const responseItems = index_response.body;
          expect(responseItems.length).toBeGreaterThan(0);
          for (const item of responseItems) {
            expect(item).toEqual({
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
            available: expect.any(Boolean),
            picture: expect.any(String),
            name: expect.any(String),
            description: expect.any(String),
            categories: expect.any(Object),
            dueDate: null,
            owner: false,
            interactions: item.interactions === null ?
            null :
            expect.any(Array),
            commonCommunity: expect.any(Object),
            ownerData: expect.any(Object),
            });
          }
          await logout(connectSidValue);
        }, 10000);
      });
    });
});