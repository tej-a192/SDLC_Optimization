import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TaskContext } from '../src/context/TaskContext';
import TaskItem from '../src/components/TaskItem';
import AddTaskForm from '../src/components/AddTaskForm';
import Header from '../src/components/Header';
import HomePage from '../src/pages/HomePage';
import * as taskApi from '../src/services/taskApi.service';
import { formatDate } from '../src/utils/formatters';

// Mock the taskApi service
vi.mock('../src/services/taskApi.service');

describe('TaskItem Component', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    dueDate: '2023-12-31',
    completed: false,
    createdAt: '2023-01-01'
  };

  const mockToggleTask = vi.fn();
  const mockDeleteTask = vi.fn();

  beforeEach(() => {
    render(
      <TaskContext.Provider value={{ toggleTask: mockToggleTask, deleteTask: mockDeleteTask }}>
        <TaskItem task={mockTask} />
      </TaskContext.Provider>
    );
  });

  it('renders task details correctly', () => {
    expect(screen.getByText(mockTask.title)).toBeInTheDocument();
    expect(screen.getByText(mockTask.description)).toBeInTheDocument();
    expect(screen.getByText(formatDate(mockTask.dueDate))).toBeInTheDocument();
  });

  it('calls toggleTask when checkbox is clicked', () => {
    fireEvent.click(screen.getByRole('checkbox'));
    expect(mockToggleTask).toHaveBeenCalledWith(mockTask.id);
  });

  it('calls deleteTask when delete button is clicked', () => {
    fireEvent.click(screen.getByText(/delete/i));
    expect(mockDeleteTask).toHaveBeenCalledWith(mockTask.id);
  });
});

describe('AddTaskForm Component', () => {
  const mockAddTask = vi.fn();

  beforeEach(() => {
    render(
      <TaskContext.Provider value={{ addTask: mockAddTask }}>
        <AddTaskForm />
      </TaskContext.Provider>
    );
  });

  it('renders form fields', () => {
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const dueDateInput = screen.getByLabelText(/due date/i);

    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
    fireEvent.change(dueDateInput, { target: { value: '2023-12-31' } });

    fireEvent.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => {
      expect(mockAddTask).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'New Description',
        dueDate: '2023-12-31',
        completed: false
      });
    });
  });

  it('shows validation errors for empty fields', async () => {
    fireEvent.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
      expect(screen.getByText(/due date is required/i)).toBeInTheDocument();
    });
  });
});

describe('Header Component', () => {
  it('renders header with correct title', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText(/to-do application/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
  });
});

describe('HomePage Component', () => {
  const mockTasks = [
    { id: '1', title: 'Task 1', description: 'Description 1', dueDate: '2023-12-31', completed: false, createdAt: '2023-01-01' },
    { id: '2', title: 'Task 2', description: 'Description 2', dueDate: '2023-11-30', completed: true, createdAt: '2023-01-02' }
  ];

  beforeEach(() => {
    taskApi.getTasks.mockResolvedValue(mockTasks);
  });

  it('renders loading state initially', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it('renders tasks after loading', async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });

  it('handles API error', async () => {
    taskApi.getTasks.mockRejectedValue(new Error('Failed to fetch tasks'));

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/error loading tasks/i)).toBeInTheDocument();
    });
  });
});

describe('TaskContext', () => {
  it('provides context values to children', () => {
    const mockAddTask = vi.fn();
    const mockToggleTask = vi.fn();
    const mockDeleteTask = vi.fn();

    const { container } = render(
      <TaskContext.Provider value={{ addTask: mockAddTask, toggleTask: mockToggleTask, deleteTask: mockDeleteTask }}>
        <TaskContext.Consumer>
          {(value) => (
            <div>
              <button onClick={() => value.addTask({ title: 'Test', description: 'Test', dueDate: '2023-12-31', completed: false })}>Add</button>
              <button onClick={() => value.toggleTask('1')}>Toggle</button>
              <button onClick={() => value.deleteTask('1')}>Delete</button>
            </div>
          )}
        </TaskContext.Consumer>
      </TaskContext.Provider>
    );

    fireEvent.click(screen.getByText('Add'));
    expect(mockAddTask).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Toggle'));
    expect(mockToggleTask).toHaveBeenCalledWith('1');

    fireEvent.click(screen.getByText('Delete'));
    expect(mockDeleteTask).toHaveBeenCalledWith('1');
  });
});

describe('Routing', () => {
  it('navigates to home page', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/to-do application/i)).toBeInTheDocument();
  });
});