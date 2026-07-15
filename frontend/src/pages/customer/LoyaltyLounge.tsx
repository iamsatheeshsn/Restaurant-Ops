import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Sparkles, Calendar, Heart, Wallet, Gift, Tag, CheckCircle, Trophy, User } from 'lucide-react';

interface CustomerProfile {
  pointsBalance: number;
  membershipTier: string;
  walletBalance: string;
  birthday: string | null;
  favoriteFood: string | null;
}

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  value: string;
  minOrderAmount: string;
}

export const LoyaltyLounge: React.FC = () => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // CRM profile states
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [birthday, setBirthday] = useState('');
  const [favoriteFood, setFavoriteFood] = useState('');

  // Promos & Coupons lists
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [giftCardCode, setGiftCardCode] = useState('');
  const [applyingCard, setApplyingCard] = useState(false);

  const loadData = async () => {
    try {
      const prof = await api.crm.getProfile();
      if (prof) {
        setProfile(prof);
        setFavoriteFood(prof.favoriteFood || '');
        if (prof.birthday) {
          setBirthday(new Date(prof.birthday).toISOString().split('T')[0]);
        }
      }

      const activeCoupons = await api.crm.getCoupons({ limit: 100 });
      setCoupons(activeCoupons.data || []);
    } catch (error) {
      console.error('Failed to load loyalty details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updated = await api.crm.updateProfile({
        birthday: birthday || null,
        favoriteFood
      });
      setProfile(updated);
      showNotification({
        title: 'Profile Saved',
        message: 'Loyalty preferences and birthday offers registered successfully.',
        type: 'success'
      });
    } catch (error) {
      showNotification({
        title: 'Action Failed',
        message: 'Could not sync loyalty preferences.',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRedeemGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftCardCode) return;
    setApplyingCard(true);

    // Simulate gift card verification and increment wallet balance
    setTimeout(async () => {
      try {
        // Increment wallet by a default $25 bonus when they enter any valid mock code
        const currentWallet = parseFloat(profile?.walletBalance || '0.00');
        const updated = await api.crm.updateProfile({
          walletBalance: (currentWallet + 25.00).toFixed(2)
        });
        
        // Reload details
        loadData();
        setGiftCardCode('');
        showNotification({
          title: 'Balance Added',
          message: `$25.00 gift card credit applied directly to your wallet!`,
          type: 'success'
        });
      } catch (error) {
        showNotification({
          title: 'Redeem Failed',
          message: 'Invalid or expired gift card code.',
          type: 'error'
        });
      } finally {
        setApplyingCard(false);
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="text-center py-20 bg-[#0a1316] min-h-[90vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tastyc-copper mx-auto"></div>
        <p className="mt-4 text-[#a9b8c3] text-sm uppercase tracking-widest">Opening Loyalty Lounge...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a1316] min-h-[90vh] py-16 px-4 sm:px-6 lg:px-8 text-left selection:bg-tastyc-copper selection:text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Title */}
        <div className="border-b border-tastyc-copper/10 pb-6 flex justify-between items-center">
          <div>
            <p className="text-tastyc-copper text-xs uppercase tracking-widest font-semibold">Customer Club</p>
            <h3 className="font-title text-4xl uppercase tracking-wider text-white">Loyalty & Rewards Lounge</h3>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMN 1: LOYALTY CARD & WALLET */}
          <div className="space-y-6 lg:col-span-1">
            {/* Membership Card */}
            <div className="bg-gradient-to-br from-[#1b2b30] to-[#121e22] border border-tastyc-copper/30 p-6 relative rounded shadow-2xl overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Trophy className="h-28 w-28 text-white" />
              </div>
              <div className="space-y-6 z-10 relative">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-tastyc-copper tracking-wider">Membership Level</span>
                    <h4 className="font-title text-3xl uppercase tracking-widest text-white mt-1">
                      {profile?.membershipTier || 'Silver'}
                    </h4>
                  </div>
                  <span className="bg-white/10 px-2 py-0.5 text-[8px] rounded font-bold text-white uppercase tracking-widest">
                    Club Member
                  </span>
                </div>

                <div className="pt-4 border-t border-tastyc-copper/10 flex justify-between items-end">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#a9b8c3] tracking-widest">Accumulated Points</span>
                    <p className="font-title text-2xl text-white mt-0.5">
                      {profile?.pointsBalance || 0} <span className="text-xs font-body text-tastyc-copper">PTS</span>
                    </p>
                  </div>
                  <p className="text-[9px] text-[#a9b8c3]/60 italic font-semibold">10% points back on every order</p>
                </div>
              </div>
            </div>

            {/* Wallet credit block */}
            <div className="bg-[#121e22] border border-tastyc-copper/15 p-6 space-y-4">
              <div className="flex items-center space-x-3 text-tastyc-copper">
                <Wallet className="h-5 w-5" />
                <h4 className="font-title text-lg uppercase tracking-wider text-white">Digital Wallet</h4>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-[#a9b8c3] tracking-widest">Available Credit</span>
                <p className="font-title text-3xl text-white mt-1">
                  ${parseFloat(profile?.walletBalance || '0.00').toFixed(2)}
                </p>
              </div>
              <p className="text-[10px] text-[#a9b8c3] leading-relaxed">
                Apply wallet credit automatically during checkout to deduct order costs. Avoid fees completely.
              </p>
            </div>
          </div>

          {/* COLUMN 2: CRM DETAILS FORM & GIFT CARD REDEEM */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* Preferences Form */}
            <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-6">
              <h4 className="font-title text-xl uppercase tracking-wider text-white border-b border-tastyc-copper/10 pb-3 flex items-center space-x-2">
                <User className="h-5 w-5 text-tastyc-copper" />
                <span>Customer Profile Details</span>
              </h4>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase font-bold text-[#a9b8c3] tracking-widest flex items-center space-x-1">
                      <Calendar className="h-3.5 w-3.5 text-tastyc-copper" />
                      <span>Date of Birth</span>
                    </label>
                    <input
                      type="date"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none focus:border-tastyc-copper"
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase font-bold text-[#a9b8c3] tracking-widest flex items-center space-x-1">
                      <Heart className="h-3.5 w-3.5 text-tastyc-copper" />
                      <span>Favorite dish</span>
                    </label>
                    <input
                      type="text"
                      value={favoriteFood}
                      onChange={(e) => setFavoriteFood(e.target.value)}
                      className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none focus:border-tastyc-copper"
                      placeholder="e.g. Double Espresso, Butter Croissant"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold transition-all disabled:opacity-50"
                >
                  {saving ? 'Syncing Profile...' : 'Save Loyalty preferences'}
                </button>
              </form>
            </div>

            {/* Redeem Gift Card / Coupon */}
            <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-6">
              <h4 className="font-title text-xl uppercase tracking-wider text-white border-b border-tastyc-copper/10 pb-3 flex items-center space-x-2">
                <Gift className="h-5 w-5 text-tastyc-copper" />
                <span>Apply Gift Cards</span>
              </h4>
              <form onSubmit={handleRedeemGiftCard} className="flex items-center space-x-3">
                <input
                  type="text"
                  required
                  value={giftCardCode}
                  onChange={(e) => setGiftCardCode(e.target.value)}
                  className="flex-1 bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none placeholder:text-white/20 uppercase tracking-widest"
                  placeholder="ENTER GIFT CARD CODE (e.g. GIFT25)"
                />
                <button
                  type="submit"
                  disabled={applyingCard || !giftCardCode}
                  className="px-6 py-2.5 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold transition-all disabled:opacity-50 whitespace-nowrap"
                >
                  {applyingCard ? 'Verifying...' : 'Redeem Code'}
                </button>
              </form>
            </div>

            {/* Coupons / Active Promos list */}
            <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-4">
              <div className="flex items-center space-x-2 text-tastyc-copper border-b border-tastyc-copper/10 pb-3">
                <Tag className="h-5 w-5" />
                <h4 className="font-title text-xl uppercase tracking-wider text-white">Active Promo Coupons</h4>
              </div>
              {coupons.length === 0 ? (
                <p className="text-xs text-[#a9b8c3]/40 uppercase tracking-wider py-4">No active coupon campaigns currently running.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {coupons.map((c) => (
                    <div key={c.id} className="bg-tastyc-dark/20 p-4 border border-dashed border-tastyc-copper/30 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white text-xs tracking-widest uppercase">{c.code}</p>
                        <p className="text-[9px] text-[#a9b8c3] mt-1">
                          Min Order: ${parseFloat(c.minOrderAmount).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-tastyc-copper font-bold font-title text-lg">
                          {c.discountType === 'PERCENTAGE' ? `${parseFloat(c.value).toFixed(0)}%` : `$${parseFloat(c.value).toFixed(0)}`}
                        </span>
                        <p className="text-[8px] uppercase font-bold text-[#a9b8c3] tracking-wider mt-0.5">Discount</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
