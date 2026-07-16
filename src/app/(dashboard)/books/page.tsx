import { getBooks, getBookFolders } from '@/actions/books';
import { BookOpen } from 'lucide-react';
import BooksDashboard from '@/components/books/BooksDashboard';

export default async function BooksPage() {
  const [books, folders] = await Promise.all([getBooks(), getBookFolders()]);

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <BookOpen color="var(--c-primary)" size={28} />
        <h2 className="text-headline-md" style={{ margin: 0 }}>Books</h2>
      </div>
      <BooksDashboard initialBooks={books} initialFolders={folders} />
    </div>
  );
}
