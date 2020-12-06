import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import Dashboard from './components/screens/dashboard/Dashboard'
import MediaList from './components/common/MediaList'
test('renders learn react link', () => {
  const { getByText } = render(<Dashboard />);
  const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
