import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { CheckCircle, Heart, IndianRupee } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PaymentModal from '../components/ui/PaymentModal';
import './DonateMonthly.css';

const DEFAULT_PLANS = [
  { id: 'supporter', name: 'Supporter', amount: 200, perks: ['Feed 1 family', 'Digital thank-you card', 'Monthly impact report'], featured: false },
  { id: 'champion', name: 'Champion', amount: 500, perks: ['Feed 3 families', 'Featured donor badge', 'Monthly impact report', 'Impact certificate'], featured: true },
  { id: 'guardian', name: 'Guardian', amount: 1000, perks: ['Full education kit for 3 children', 'Priority event invites', 'Quarterly impact video', 'Guardian certificate'], featured: false },
  { id: 'patron', name: 'Patron', amount: 2500, perks: ['Sponsor an orphanage child', 'Annual impact report', 'Patron recognition on website', 'Personal thank-you call'], featured: false },
];

export default function DonationPage() {
  const { currentUser, loginWithGoogle } = useAuth();
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [selectedCause, setSelectedCause] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [customError, setCustomError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'donationPlans'), orderBy('order', 'asc')));
        if (!snap.empty) {
          setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch {
        // Falls back to DEFAULT_PLANS silently
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handlePlanDonate = async (plan) => {
    if (!currentUser) { await loginWithGoogle(); return; }
    setSelectedCause({
      id: plan.id,
      title: plan.name + ' Donation',
      amount: plan.amount,
      unit: 'donation',
      category: 'Donation',
      imageUrl: null,
    });
  };

  const handleCustomDonate = async () => {
    const amt = parseInt(customAmount, 10);
    if (!customAmount || isNaN(amt) || amt < 1) {
      setCustomError('Please enter a valid amount.');
      return;
    }
    if (amt < 10) {
      setCustomError('Minimum donation is ₹10.');
      return;
    }
    setCustomError('');
    if (!currentUser) { await loginWithGoogle(); return; }
    setSelectedCause({
      id: 'custom',
      title: 'Custom Donation',
      amount: amt,
      unit: 'donation',
      category: 'Donation',
      imageUrl: null,
    });
  };

  return (
    <main className="donate-monthly-page">
      <div className="dm-hero">
        <div className="container">
          <p className="section-label" style={{ color: 'var(--accent-light)' }}>Make a Difference</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3.2rem)', color: 'white', marginBottom: 12 }}>
            Donate
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 520 }}>
            Every contribution, big or small, creates a lasting impact in the lives of those who need it most.
          </p>
        </div>
      </div>

      <section className="dm-content">
        <div className="container">
          <div className="section-head center">
            <p className="section-label">Choose a Plan</p>
            <h2 className="section-title">Donation Plans</h2>
            <p className="section-subtitle">100% of your contribution goes directly to the cause.</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-mid)' }}>Loading plans...</div>
          ) : (
            <div className="plans-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {plans.map(plan => (
                <div key={plan.id} className={`plan-card ${plan.featured ? 'featured' : ''}`}>
                  {plan.featured && <div className="plan-badge">Most Popular</div>}
                  <div className="plan-icon"><Heart size={24} /></div>
                  <h3>{plan.name}</h3>
                  <div className="plan-price">
                    <span className="price">₹{plan.amount}</span>
                  </div>
                  <ul className="plan-perks">
                    {(plan.perks || []).map((perk, i) => (
                      <li key={i}><CheckCircle size={14} /> {perk}</li>
                    ))}
                  </ul>
                  <button
                    className={plan.featured ? 'btn-primary plan-btn' : 'btn-outline plan-btn'}
                    onClick={() => handlePlanDonate(plan)}
                  >
                    {currentUser ? 'Donate Now' : 'Sign In & Donate'}
                  </button>
                </div>
              ))}

              {/* Custom Amount Card */}
              <div className="plan-card custom-amount-card">
                <div className="plan-icon"><IndianRupee size={24} /></div>
                <h3>Custom Amount</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-mid)', marginBottom: 16 }}>
                  Donate any amount you choose
                </p>
                <div className="custom-amount-input-wrap">
                  <span className="rupee-prefix">₹</span>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    min={10}
                    onChange={e => { setCustomAmount(e.target.value); setCustomError(''); }}
                    className="custom-amount-input"
                  />
                </div>
                {customError && <p style={{ color: 'var(--error, #e53e3e)', fontSize: '0.8rem', marginTop: 6 }}>{customError}</p>}
                <button
                  className="btn-primary plan-btn"
                  style={{ marginTop: 16 }}
                  onClick={handleCustomDonate}
                >
                  {currentUser ? 'Donate Now' : 'Sign In & Donate'}
                </button>
              </div>
            </div>
          )}

          <div className="dm-faq">
            <div className="section-head center" style={{ marginTop: 64 }}>
              <p className="section-label">Common Questions</p>
              <h2 className="section-title">FAQs</h2>
            </div>
            <div className="faq-grid">
              {[
                { q: 'Is my donation tax-deductible?', a: 'Yes. We provide an 80G certificate for donations. Contact us after donating to get yours.' },
                { q: 'How is my money used?', a: '100% of your contribution goes directly to the cause. We maintain full transparency with photo and video documentation.' },
                { q: 'Is my payment secure?', a: 'Yes. All payments are processed securely through Razorpay, one of India\'s most trusted payment gateways.' },
                { q: 'How do I get a receipt?', a: 'A donation receipt will be sent to your registered email after a successful payment.' },
              ].map((faq, i) => (
                <div key={i} className="faq-item">
                  <h4>{faq.q}</h4>
                  <p>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {selectedCause && (
        <PaymentModal cause={selectedCause} onClose={() => setSelectedCause(null)} />
      )}
    </main>
  );
}
