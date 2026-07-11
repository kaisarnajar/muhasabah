import { getPersons, addPerson } from '@/actions/debts';
import Link from 'next/link';
import { UserPlus, ArrowRight, Wallet } from 'lucide-react';


export default async function DebtsPage() {
  const persons = await getPersons();

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

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 className="text-display-sm">Credit & Debit</h2>
          <p className="text-body-md text-on-surface-variant">Manage your contacts and financial relationships</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', backgroundColor: 'var(--c-primary-container)', color: 'var(--c-primary)', borderRadius: '16px' }}>
            <Wallet size={32} />
          </div>
          <div>
            <span className="text-label-md text-on-surface-variant">They Owe You</span>
            <h3 className="text-display-sm" style={{ color: 'var(--c-primary)', margin: 0 }}>${totalTheyOweMe.toFixed(2)}</h3>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', backgroundColor: 'var(--c-error-container)', color: 'var(--c-error)', borderRadius: '16px' }}>
            <Wallet size={32} />
          </div>
          <div>
            <span className="text-label-md text-on-surface-variant">You Owe Them</span>
            <h3 className="text-display-sm" style={{ color: 'var(--c-error)', margin: 0 }}>${totalIOweThem.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '32px' }}>
        <form action={addPerson} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <input 
            type="text" 
            name="name" 
            placeholder="Add new person..." 
            className="search-input" 
            style={{ flex: 1 }} 
            required 
          />
          <button type="submit" className="primary-btn">
            <UserPlus size={20} />
            Add Person
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {enrichedPersons.map(person => (
          <Link key={person.id} href={`/debts/${person.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="text-title-lg" style={{ fontWeight: 600 }}>{person.name}</h3>
              <ArrowRight size={20} className="text-on-surface-variant" />
            </div>
            
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--c-outline-variant)' }}>
              {person.netBalance > 0 ? (
                <div style={{ color: 'var(--c-primary)' }}>
                  <span className="text-label-sm">THEY OWE YOU</span>
                  <div className="text-headline-md">${person.netBalance.toFixed(2)}</div>
                </div>
              ) : person.netBalance < 0 ? (
                <div style={{ color: 'var(--c-error)' }}>
                  <span className="text-label-sm">YOU OWE THEM</span>
                  <div className="text-headline-md">${Math.abs(person.netBalance).toFixed(2)}</div>
                </div>
              ) : (
                <div className="text-on-surface-variant">
                  <span className="text-label-sm">SETTLED</span>
                  <div className="text-headline-md">$0.00</div>
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
      </div>
    </div>
  );
}
