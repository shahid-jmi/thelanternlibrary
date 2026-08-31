import { Armchair, Coffee, Lamp, Library } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// "What We Offer" used to be this static array — it's now driven by live
// admin-managed categories (see OfferSection.tsx / useCategories).

export const MOSAIC: { numeral: string; label: string; icon: LucideIcon; image: string }[] = [
  {
    numeral: 'i',
    label: 'Lamplight',
    icon: Lamp,
    image:
      'https://images.pexels.com/photos/32824756/pexels-photo-32824756/free-photo-of-elegant-ornate-lantern-with-warm-glow-indoors.jpeg?cs=tinysrgb&w=800',
  },
  {
    numeral: 'ii',
    label: 'Reading corners',
    icon: Armchair,
    image:
      'https://images.pexels.com/photos/30710413/pexels-photo-30710413/free-photo-of-cozy-reading-nook-with-armchair-and-bookshelf.jpeg?cs=tinysrgb&w=800',
  },
  {
    numeral: 'iii',
    label: 'The shelves',
    icon: Library,
    image:
      'https://images.pexels.com/photos/35615925/pexels-photo-35615925/free-photo-of-quiet-library-aisle-with-bookshelves.jpeg?cs=tinysrgb&w=800',
  },
  {
    numeral: 'iv',
    label: 'Kahwa & pages',
    icon: Coffee,
    image:
      'https://images.pexels.com/photos/34012546/pexels-photo-34012546/free-photo-of-cozy-still-life-with-tea-and-books.jpeg?cs=tinysrgb&w=800',
  },
];

export const AVATAR_COLORS: Record<string, string> = {
  blue: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  teal: 'bg-teal-500/15 text-teal-700 dark:text-teal-300',
};

export const TESTIMONIALS = [
  {
    numeral: 'i',
    quote:
      'I asked for something quiet, and a week later a book arrived that I still think about on evening walks.',
    name: 'Mehak',
    city: 'Srinagar',
    color: 'blue',
  },
  {
    numeral: 'ii',
    quote:
      'The parcel smelled of old paper. Reading it felt like borrowing from the shelf of a friend.',
    name: 'Arjun',
    city: 'Delhi',
    color: 'amber',
  },
  {
    numeral: 'iii',
    quote: 'It is less like buying a book and more like being handed a lantern.',
    name: 'Zoya',
    city: 'Baramulla',
    color: 'teal',
  },
];

// Placeholder posts for the Instagram preview section — swap for real posts
// once the Graph API integration is wired up.
export const INSTAGRAM_POSTS = [
  {
    id: 1,
    caption: 'Morning light on the reading room shelves.',
    likes: 128,
    image:
      'https://images.pexels.com/photos/16390238/pexels-photo-16390238/free-photo-of-a-book-store-with-books-and-lamps-on-the-shelves.jpeg?cs=tinysrgb&w=600',
  },
  {
    id: 2,
    caption: 'New arrivals, still smelling of the press.',
    likes: 94,
    image:
      'https://images.pexels.com/photos/35082910/pexels-photo-35082910/free-photo-of-browsing-books-at-a-cozy-bookstore.jpeg?cs=tinysrgb&w=600',
  },
  {
    id: 3,
    caption: 'A postcard from Dal Lake, ready to post.',
    likes: 156,
    image:
      'https://images.pexels.com/photos/37947892/pexels-photo-37947892/free-photo-of-vintage-postcards-tied-with-green-ribbon.jpeg?cs=tinysrgb&w=600',
  },
  {
    id: 4,
    caption: 'Kahwa and a chapter before closing.',
    likes: 87,
    image:
      'https://images.pexels.com/photos/20228246/pexels-photo-20228246/free-photo-of-cup-with-tea-next-to-a-stack-of-books.jpeg?cs=tinysrgb&w=600',
  },
];

export const STEP_COLORS: Record<string, string> = {
  blue: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  green: 'bg-green-500/15 text-green-600 dark:text-green-400',
  amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
};

export const CONTACT_ICON_COLORS = {
  green: 'bg-green-500/10 text-green-600 dark:text-green-400',
  pink: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
} as const;
