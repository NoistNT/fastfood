import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/modules/core/ui/card';

describe('Card', () => {
  it('renders basic card structure', () => {
    render(<Card>Card content</Card>);
    const card = screen.getByText('Card content');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'shadow-sm');
  });

  it('renders card with custom className', () => {
    render(<Card className="custom-card">Content</Card>);
    expect(screen.getByText('Content')).toHaveClass('custom-card');
  });

  it('renders card header', () => {
    render(
      <Card>
        <CardHeader>Header content</CardHeader>
      </Card>
    );
    const header = screen.getByText('Header content');
    expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
  });

  it('renders card title', () => {
    render(
      <Card>
        <CardTitle>Card Title</CardTitle>
      </Card>
    );
    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toHaveTextContent('Card Title');
    expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight');
  });

  it('renders card description', () => {
    render(
      <Card>
        <CardDescription>Description text</CardDescription>
      </Card>
    );
    const description = screen.getByText('Description text');
    expect(description).toHaveClass('text-sm', 'text-muted-foreground');
  });

  it('renders card content', () => {
    render(
      <Card>
        <CardContent>Main content</CardContent>
      </Card>
    );
    const content = screen.getByText('Main content');
    expect(content).toHaveClass('p-6', 'pt-0');
  });

  it('renders card footer', () => {
    render(
      <Card>
        <CardFooter>Footer content</CardFooter>
      </Card>
    );
    const footer = screen.getByText('Footer content');
    expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
  });

  it('renders complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Complete Card</CardTitle>
          <CardDescription>A full card example</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the main content area</p>
        </CardContent>
        <CardFooter>
          <button>Action Button</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Complete Card');
    expect(screen.getByText('A full card example')).toBeInTheDocument();
    expect(screen.getByText('This is the main content area')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Action Button');
  });

  it('passes through additional props', () => {
    render(<Card data-testid="custom-card">Content</Card>);
    expect(screen.getByTestId('custom-card')).toBeInTheDocument();
  });

  it('renders with ref', () => {
    const ref = { current: null };
    render(<Card ref={ref}>Content</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
