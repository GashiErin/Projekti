import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';

const mockRegister = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    register: mockRegister,
  }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderRegister = () =>
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

beforeEach(() => {
  mockRegister.mockReset();
  mockNavigate.mockReset();
});

test('shows an error when passwords do not match', async () => {
  renderRegister();

  await userEvent.type(screen.getByLabelText(/username/i), 'employee1');
  await userEvent.type(screen.getByLabelText(/email/i), 'employee1@example.com');
  await userEvent.type(screen.getByLabelText(/^password$/i), 'secret1');
  await userEvent.type(screen.getByLabelText(/confirm password/i), 'secret2');
  await userEvent.click(screen.getByRole('button', { name: /register/i }));

  expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  expect(mockRegister).not.toHaveBeenCalled();
});

test('submits valid registration data and redirects after success', async () => {
  mockRegister.mockResolvedValue({ success: true });
  renderRegister();

  await userEvent.type(screen.getByLabelText(/username/i), 'employee1');
  await userEvent.type(screen.getByLabelText(/email/i), 'employee1@example.com');
  await userEvent.type(screen.getByLabelText(/^password$/i), 'secret1');
  await userEvent.type(screen.getByLabelText(/confirm password/i), 'secret1');
  await userEvent.click(screen.getByRole('button', { name: /register/i }));

  await waitFor(() => {
    expect(mockRegister).toHaveBeenCalledWith({
      username: 'employee1',
      email: 'employee1@example.com',
      password: 'secret1',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
