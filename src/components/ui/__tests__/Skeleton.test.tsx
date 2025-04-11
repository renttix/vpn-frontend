import React from 'react';
import { render, screen } from '@testing-library/react';
import Skeleton, { ArticleSkeleton, CardSkeleton } from '../Skeleton';

describe('Skeleton Component', () => {
  it('renders with default props', () => {
    render(<Skeleton />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('bg-gray-200');
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('applies custom className', () => {
    render(<Skeleton className="custom-class" />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('applies height and width styles', () => {
    render(<Skeleton height={100} width={200} />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toHaveStyle('height: 100px');
    expect(skeleton).toHaveStyle('width: 200px');
  });

  it('applies string height and width styles', () => {
    render(<Skeleton height="10rem" width="50%" />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toHaveStyle('height: 10rem');
    expect(skeleton).toHaveStyle('width: 50%');
  });

  it('applies rounded class when rounded prop is true', () => {
    render(<Skeleton rounded />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toHaveClass('rounded-md');
  });

  it('applies rounded-full class when circle prop is true', () => {
    render(<Skeleton circle />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('does not apply animate-pulse class when animate prop is false', () => {
    render(<Skeleton animate={false} />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).not.toHaveClass('animate-pulse');
  });
});

describe('ArticleSkeleton Component', () => {
  it('renders article skeleton with expected elements', () => {
    render(<ArticleSkeleton />);
    
    // Check for title skeleton
    const skeletons = screen.getAllByRole('generic');
    expect(skeletons.length).toBeGreaterThan(5); // Should have multiple skeleton elements
    
    // Check for the container
    const container = screen.getByText('').parentElement;
    expect(container).toHaveClass('space-y-4');
  });
});

describe('CardSkeleton Component', () => {
  it('renders card skeleton with expected elements', () => {
    render(<CardSkeleton />);
    
    // Check for image and content skeletons
    const skeletons = screen.getAllByRole('generic');
    expect(skeletons.length).toBeGreaterThan(3); // Should have multiple skeleton elements
    
    // Check for the container
    const container = screen.getByText('').parentElement;
    expect(container).toHaveClass('border');
    expect(container).toHaveClass('rounded-lg');
  });
});
