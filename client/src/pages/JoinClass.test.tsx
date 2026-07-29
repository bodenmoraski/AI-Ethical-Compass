/**
 * @jest-environment jsdom
 *
 * JoinClass Component Tests
 * 
 * Tests the join class UI with real interactions
 */

import React from 'react';
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import * as auth from '../lib/auth';

// Mock Vite supabase client (import.meta.env is not available under Jest)
jest.mock('../../../lib/supabase-client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { access_token: 'test-token', user: { id: '123', email: 'test@example.com' } } },
        error: null,
      }),
    },
  },
}));

import JoinClass from './JoinClass';

// Mock auth
const mockUser = {
  id: '123',
  email: 'test@example.com'
};

jest.mock('../lib/auth', () => ({
  useAuth: jest.fn()
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock toast
jest.mock('../hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

describe('JoinClass Component', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    (auth.useAuth as any).mockReturnValue({
      user: mockUser,
      loading: false
    });
  });
  
  test('should render join class form', () => {
    render(
      <BrowserRouter>
        <JoinClass />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Join a Class/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Class Code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Join Class/i })).toBeInTheDocument();
  });
  
  test('should display login required when not authenticated', () => {
    (auth.useAuth as any).mockReturnValue({
      user: null,
      loading: false
    });
    
    render(
      <BrowserRouter>
        <JoinClass />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Login Required/i)).toBeInTheDocument();
  });
  
  test('should convert input to uppercase', () => {
    render(
      <BrowserRouter>
        <JoinClass />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/ABC123/i) as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: 'abc123' } });
    
    expect(input.value).toBe('ABC123');
  });
  
  test('should limit input to 6 characters', () => {
    render(
      <BrowserRouter>
        <JoinClass />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/ABC123/i) as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: 'ABCDEFGH' } });
    
    expect(input.value).toBe('ABCDEF');
    expect(input.value.length).toBe(6);
  });
  
  test('should only allow alphanumeric characters', () => {
    render(
      <BrowserRouter>
        <JoinClass />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/ABC123/i) as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: 'AB@#12' } });
    
    expect(input.value).toBe('AB12');
  });
  
  test('should show character counter', () => {
    render(
      <BrowserRouter>
        <JoinClass />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/ABC123/i);
    
    fireEvent.change(input, { target: { value: 'ABC' } });
    
    expect(screen.getByText(/3\/6/i)).toBeInTheDocument();
  });
  
  test('should show checkmark when code is complete', () => {
    render(
      <BrowserRouter>
        <JoinClass />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/ABC123/i);
    
    fireEvent.change(input, { target: { value: 'ABC123' } });
    
    // Ready indicator / complete state should be visible
    expect(screen.getByText(/Ready!/i)).toBeInTheDocument();
    expect(document.querySelector('svg.text-green-500')).toBeTruthy();
  });
  
  test('should disable submit button when code incomplete', () => {
    render(
      <BrowserRouter>
        <JoinClass />
      </BrowserRouter>
    );
    
    const button = screen.getByRole('button', { name: /Join Class/i });
    
    expect(button).toBeDisabled();
    
    const input = screen.getByPlaceholderText(/ABC123/i);
    fireEvent.change(input, { target: { value: 'ABC' } });
    
    expect(button).toBeDisabled();
  });
  
  test('should enable submit button when code complete', () => {
    render(
      <BrowserRouter>
        <JoinClass />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/ABC123/i);
    fireEvent.change(input, { target: { value: 'ABC123' } });
    
    const button = screen.getByRole('button', { name: /Join Class/i });
    expect(button).not.toBeDisabled();
  });
  
  test('should display error message on validation failure', () => {
    render(
      <BrowserRouter>
        <JoinClass />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/ABC123/i);
    fireEvent.change(input, { target: { value: 'AB' } });
    
    const form = input.closest('form');
    fireEvent.submit(form!);
    
    expect(screen.getByText(/must be exactly 6 characters/i)).toBeInTheDocument();
  });
  
  test('should clear error when user types', async () => {
    render(
      <BrowserRouter>
        <JoinClass />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/ABC123/i);
    
    // Trigger error
    fireEvent.change(input, { target: { value: 'AB' } });
    const form = input.closest('form');
    fireEvent.submit(form!);
    
    expect(screen.getByText(/must be exactly 6 characters/i)).toBeInTheDocument();
    
    // Start typing again
    fireEvent.change(input, { target: { value: 'ABC' } });
    
    await waitFor(() => {
      expect(screen.queryByText(/must be exactly 6 characters/i)).not.toBeInTheDocument();
    });
  });
  
  test('should show loading state during submission', async () => {
    // Mock successful API call
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Successfully joined class',
          class: { name: 'Test Class' }
        })
      })
    ) as any;
    
    render(
      <BrowserRouter>
        <JoinClass />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/ABC123/i);
    fireEvent.change(input, { target: { value: 'ABC123' } });
    
    const button = screen.getByRole('button', { name: /Join Class/i });
    fireEvent.click(button);
    
    // Should show loading text
    await waitFor(() => {
      expect(screen.getByText(/Joining.../i)).toBeInTheDocument();
    });
  });
  
  test('should show help section', () => {
    render(
      <BrowserRouter>
        <JoinClass />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Need help\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Ask your teacher for the class code/i)).toBeInTheDocument();
  });
  
  test('should have link to view classes', () => {
    render(
      <BrowserRouter>
        <JoinClass />
      </BrowserRouter>
    );
    
    const link = screen.getByRole('button', { name: /View My Classes/i });
    expect(link).toBeInTheDocument();
    
    fireEvent.click(link);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
  
  test('should have back button', () => {
    render(
      <BrowserRouter>
        <JoinClass />
      </BrowserRouter>
    );
    
    const backButton = screen.getByRole('button', { name: /Back/i });
    expect(backButton).toBeInTheDocument();
  });
  
  test('should be keyboard accessible', () => {
    render(
      <BrowserRouter>
        <JoinClass />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/ABC123/i);
    
    // Input should accept focus and typing
    input.focus();
    expect(document.activeElement).toBe(input);
    fireEvent.change(input, { target: { value: 'ABC123' } });
    expect((input as HTMLInputElement).value).toBe('ABC123');
    expect(screen.getByRole('button', { name: /Join Class/i })).toBeEnabled();
  });
});

