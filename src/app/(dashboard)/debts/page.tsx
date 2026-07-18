import { getPersons } from '@/features/debts/actions';
import Link from 'next/link';
import { UserPlus, ArrowRight, Wallet } from 'lucide-react';
import AddPersonDialog from "@/features/debts/components/AddPersonDialog";
import SearchInput from "@/components/ui/SearchInput";


export default async function DebtsPage(props: { searchParams?: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const persons = await getPersons();
  const search = searchParams?.search || '';

  // Calculate Net Balances
  // If type === 'CREDIT' (I lend to others), the balance goes UP (They owe me).
  // If type === 'DEBIT' (I borrow from others), the balance goes DOWN (I owe them).
  // Net Balance > 0 means They Owe Me.
  // Net Balance < 0 means I Owe Them.
  let totalTheyOweMe = 0;
  let totalIOweThem = 0;

  const enrichedPersons = persons.map(person => {
    let netBalance = 0;
    person.debts.forEach(debt => {
      if (debt.status === 'PENDING') {
        const amt = Number(debt.amount);
        if (debt.type === 'CREDIT') {
          netBalance += amt;
          totalTheyOweMe += amt;
        } else {
          netBalance -= amt;
          totalIOweThem += amt;
        }
      }
    });
    return { ...person, netBalance };
  });

  const filteredPersons = enrichedPersons.filter(person => 
    person.name.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination Logic
  const currentPageStr = searchParams?.page || '1';
  let currentPage = parseInt(currentPageStr, 10);
  if (isNaN(currentPage) || currentPage < 1) currentPage = 1;
  const PAGE_SIZE = 24;
  const totalPages = Math.ceil(filteredPersons.length / PAGE_SIZE) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const paginatedPersons = filteredPersons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="text-headline-md">Ledger</h2>
          <p className="text-body-md text-on-surface-variant">Manage your contacts and financial relationships</p>
        </div>
        <AddPersonDialog />
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchInput placeholder="Search contacts by name..." />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', backgroundColor: 'var(--c-primary-container)', color: 'var(--c-primary)', borderRadius: '16px' }}>
            <Wallet size={32} />
          </div>
          <div>
            <span className="text-label-md text-on-surface-variant">They Owe You</span>
            <h3 className="text-title-md" style={{ color: 'var(--c-primary)', margin: 0 }}>${totalTheyOweMe.toFixed(2)}</h3>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', backgroundColor: 'var(--c-error-container)', color: 'var(--c-error)', borderRadius: '16px' }}>
            <Wallet size={32} />
          </div>
          <div>
            <span className="text-label-md text-on-surface-variant">You Owe Them</span>
            <h3 className="text-title-md" style={{ color: 'var(--c-error)', margin: 0 }}>${totalIOweThem.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {paginatedPersons.map(person => (
          <Link key={person.id} href={`/debts/${person.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="text-title-md" style={{ fontWeight: 600 }}>{person.name}</h3>
              <ArrowRight size={20} className="text-on-surface-variant" />
            </div>
            
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--c-outline-variant)' }}>
              {person.netBalance > 0 ? (
                <div style={{ color: 'var(--c-primary)' }}>
                  <span className="text-label-sm">THEY OWE YOU</span>
                  <div className="text-title-md">${person.netBalance.toFixed(2)}</div>
                </div>
              ) : person.netBalance < 0 ? (
                <div style={{ color: 'var(--c-error)' }}>
                  <span className="text-label-sm">YOU OWE THEM</span>
                  <div className="text-title-md">${Math.abs(person.netBalance).toFixed(2)}</div>
                </div>
              ) : (
                <div className="text-on-surface-variant">
                  <span className="text-label-sm">SETTLED</span>
                  <div className="text-title-md">$0.00</div>
                </div>
              )}
            </div>
          </Link>
        ))}
        {enrichedPersons.length === 0 && (
          <div className="col-span-12" style={{ textAlign: 'center', padding: '40px', color: 'var(--c-on-surface-variant)' }}>
            <UserPlus size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>No people in your list yet. Add someone to start tracking credits and debits.</p>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px', gridColumn: '1 / -1' }}>
            {currentPage > 1 ? (
              <Link href={`?page=${currentPage - 1}`} className="primary-btn" style={{ padding: '8px 16px', backgroundColor: 'var(--c-surface-container-high)', color: 'var(--c-on-surface)', boxShadow: 'none' }}>
                Previous
              </Link>
            ) : (
              <button disabled className="primary-btn" style={{ padding: '8px 16px', backgroundColor: 'var(--c-surface-container-lowest)', color: 'var(--c-on-surface-variant)', opacity: 0.5, cursor: 'not-allowed', boxShadow: 'none' }}>
                Previous
              </button>
            )}
            
            <span className="text-body-md text-on-surface-variant" style={{ fontWeight: 600 }}>
              Page {currentPage} of {totalPages}
            </span>

            {currentPage < totalPages ? (
              <Link href={`?page=${currentPage + 1}`} className="primary-btn" style={{ padding: '8px 16px', backgroundColor: 'var(--c-surface-container-high)', color: 'var(--c-on-surface)', boxShadow: 'none' }}>
                Next
              </Link>
            ) : (
              <button disabled className="primary-btn" style={{ padding: '8px 16px', backgroundColor: 'var(--c-surface-container-lowest)', color: 'var(--c-on-surface-variant)', opacity: 0.5, cursor: 'not-allowed', boxShadow: 'none' }}>
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
