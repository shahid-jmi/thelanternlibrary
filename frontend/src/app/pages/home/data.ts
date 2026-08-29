import {
  Armchair,
  BookOpen,
  Coffee,
  Feather,
  FileText,
  Flower2,
  Lamp,
  Library,
  Mail,
  Mountain,
  Scroll,
  ShoppingBag,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const OFFERINGS: { numeral: string; name: string; line: string; icon: LucideIcon; image: string }[] = [
  {
    numeral: 'i',
    name: 'Books',
    line: 'Stories chosen slowly, shelved with care.',
    icon: BookOpen,
    image:
      'https://images.pexels.com/photos/28649539/pexels-photo-28649539/free-photo-of-stack-of-vintage-books-in-cozy-library.jpeg?cs=tinysrgb&w=800',
  },
  {
    numeral: 'ii',
    name: 'Postcards',
    line: 'Small windows mailed from the valley.',
    icon: Mail,
    image:
      'https://images.pexels.com/photos/37947894/pexels-photo-37947894/free-photo-of-assortment-of-vintage-postcards-with-handwritten-notes.jpeg?cs=tinysrgb&w=800',
  },
  {
    numeral: 'iii',
    name: 'Handwritten Letters',
    line: 'Ink, paper, and a little time.',
    icon: Feather,
    image:
      'https://images.pexels.com/photos/37521299/pexels-photo-37521299/free-photo-of-elegant-fountain-pen-on-handwritten-letter.jpeg?cs=tinysrgb&w=800',
  },
  {
    numeral: 'iv',
    name: 'Typewritten Goods',
    line: 'Keys pressed, words kept.',
    icon: FileText,
    image:
      'https://images.pexels.com/photos/37703243/pexels-photo-37703243/free-photo-of-rustic-vintage-typewriter-on-wooden-desk.jpeg?cs=tinysrgb&w=800',
  },
  {
    numeral: 'v',
    name: 'Canvas Totes',
    line: 'For carrying stories home.',
    icon: ShoppingBag,
    image:
      'https://images.pexels.com/photos/34393372/pexels-photo-34393372/free-photo-of-stylish-tote-bags-in-a-book-store-display.jpeg?cs=tinysrgb&w=800',
  },
  {
    numeral: 'vi',
    name: 'Dried Flowers',
    line: "Kashmir's gardens, paused mid-bloom.",
    icon: Flower2,
    image:
      'https://images.pexels.com/photos/30685002/pexels-photo-30685002/free-photo-of-elegant-dried-floral-bouquet-with-red-accents.jpeg?cs=tinysrgb&w=800',
  },
  {
    numeral: 'vii',
    name: 'Kashmir Collectibles',
    line: 'Keepsakes of a storied valley.',
    icon: Mountain,
    image:
      'https://images.pexels.com/photos/28805621/pexels-photo-28805621/free-photo-of-scenic-himalayas-landscape-in-pahalgam-kashmir.jpeg?cs=tinysrgb&w=800',
  },
  {
    numeral: 'viii',
    name: 'Vintage Paper',
    line: 'Ephemera that survived its era.',
    icon: Scroll,
    image:
      'https://images.pexels.com/photos/17323760/pexels-photo-17323760/free-photo-of-paper-on-vintage-notes.png?cs=tinysrgb&w=800',
  },
];

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
