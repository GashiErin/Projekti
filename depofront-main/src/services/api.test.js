const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn(),
    },
  },
};

jest.mock('axios', () => ({
  create: jest.fn(() => mockApi),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test('auth API calls the expected endpoints', () => {
  const { authAPI } = require('./api');
  const payload = { username: 'employee1', email: 'employee1@example.com', password: 'secret1' };

  authAPI.register(payload);
  authAPI.getCurrentUser();

  expect(mockApi.post).toHaveBeenCalledWith('/auth/register', payload);
  expect(mockApi.get).toHaveBeenCalledWith('/auth/me');
});

test('product API maps product operations to backend routes', () => {
  const { productAPI } = require('./api');
  const product = { name: 'Laptop', price: 900 };

  productAPI.getAll();
  productAPI.create(product);
  productAPI.updatePrice(7, 950);

  expect(mockApi.get).toHaveBeenCalledWith('/products');
  expect(mockApi.post).toHaveBeenCalledWith('/products', product);
  expect(mockApi.put).toHaveBeenCalledWith('/products/7/price', { price: 950 });
});

test('user and transport APIs map role and transport operations to backend routes', () => {
  const { userAPI, transportAPI } = require('./api');
  const rolePayload = { userId: 3, roleName: 'TRANSPORT' };
  const transportPayload = { orderIds: [1, 2], driverName: 'Driver' };

  userAPI.assignRole(rolePayload);
  userAPI.removeRole(3, 'TRANSPORT');
  transportAPI.getOrdersNeedingTransport();
  transportAPI.create(transportPayload);

  expect(mockApi.post).toHaveBeenCalledWith('/users/assign-role', rolePayload);
  expect(mockApi.delete).toHaveBeenCalledWith('/users/3/roles/TRANSPORT');
  expect(mockApi.get).toHaveBeenCalledWith('/transport/orders-needing-transport');
  expect(mockApi.post).toHaveBeenCalledWith('/transport', transportPayload);
});
