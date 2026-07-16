import { getDocuments, getDocumentFolders } from '@/actions/documents';
import { FileText } from 'lucide-react';
import DocumentsDashboard from '@/components/documents/DocumentsDashboard';

export default async function DocumentsPage() {
  const [documents, folders] = await Promise.all([getDocuments(), getDocumentFolders()]);

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <FileText color="var(--c-primary)" size={28} />
        <h2 className="text-headline-md" style={{ margin: 0 }}>Documents</h2>
      </div>
      <DocumentsDashboard initialDocuments={documents} initialFolders={folders} />
    </div>
  );
}
