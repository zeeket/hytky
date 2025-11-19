/** @jest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react';

// Mock the API module - jest.mock is hoisted, so we create mocks inside the factory
jest.mock('~/utils/api', () => {
  const threadInvalidateMock = jest.fn();
  const useMutationMock = jest.fn();

  return {
    api: {
      useContext: jest.fn(() => ({
        thread: {
          invalidate: threadInvalidateMock,
        },
      })),
      thread: {
        createThread: {
          useMutation: useMutationMock,
        },
      },
    },
    // Export mocks so we can access them in tests
    __mocks: {
      threadInvalidate: threadInvalidateMock,
      useMutation: useMutationMock,
    },
  };
});

import CreateThreadModal from '~/components/CreateThreadModal';

// Get the mocked module to access the mocks
const apiModule = jest.requireMock('~/utils/api') as {
  __mocks: {
    threadInvalidate: jest.Mock;
    useMutation: jest.Mock;
  };
};

describe('CreateThreadModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apiModule.__mocks.threadInvalidate.mockResolvedValue(undefined);
  });

  it('shows an error message when thread creation fails', async () => {
    const setShowCreateThreadModal = jest.fn();

    // Set up the mock to call onError when mutate is called
    apiModule.__mocks.useMutation.mockImplementation((options?: { onError?: (error: { message?: string }) => void }) => {
      return {
        mutate: jest.fn(() => {
          // Call onError with an error that has no message to test the fallback
          // This simulates the mutation failing without a specific error message
          options?.onError?.({ message: undefined });
        }),
        isLoading: false,
      };
    });

    render(
      <CreateThreadModal
        showCreateThreadModal={true}
        setShowCreateThreadModal={setShowCreateThreadModal}
        parentCategory={1}
      />
    );

    fireEvent.change(screen.getByLabelText('Nimi'), {
      target: { value: 'Test thread' },
    });
    fireEvent.change(screen.getByLabelText('Sisältö'), {
      target: { value: 'First post content' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Luo' }));

    // Wait for the error message to appear (React state update)
    const errorAlert = await screen.findByRole('alert');
    expect(errorAlert).toHaveTextContent(
      'Thread creation failed. Please try again.'
    );
    expect(setShowCreateThreadModal).not.toHaveBeenCalled();
  });
});

