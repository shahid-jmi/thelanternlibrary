import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import BookCard from './BookCard';
import type { PublicBook } from '../api/types';

const book: PublicBook = {
  _id: 'abc123',
  title: 'The Alchemist',
  description: 'A story about a shepherd boy.',
  author: 'Paulo Coelho',
  price: 15.99,
  genre: 'fiction',
  language: 'english',
  coverImage: { url: 'https://covers.test.example.com/a.webp', key: null },
  isAvailable: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function renderCard(overrides: Partial<PublicBook> = {}) {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <BookCard book={{ ...book, ...overrides }} />
      </MemoryRouter>
    </I18nextProvider>
  );
}

describe('BookCard', () => {
  it('renders title, author, price, and a link to the book page', () => {
    renderCard();

    expect(screen.getByRole('heading', { name: 'The Alchemist' })).toBeInTheDocument();
    expect(screen.getByText('Paulo Coelho')).toBeInTheDocument();
    expect(screen.getByText(/15\.99/)).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/book/abc123');
  });

  it('shows the cover image when available', () => {
    renderCard();
    expect(screen.getByRole('img')).toHaveAttribute('src', book.coverImage.url);
  });

  it('shows an unavailable badge for unavailable books', () => {
    renderCard({ isAvailable: false });
    expect(screen.getByText(/unavailable/i)).toBeInTheDocument();
  });
});
