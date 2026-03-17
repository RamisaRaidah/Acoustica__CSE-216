import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '@/components/alert/TwoButtonAlert';
import {
    getMyFamily,
    searchUserByEmail,
    addFamilyMember,
    leaveFamily
} from '@/services/commerce_service/subscriptions';
import '@/pages/subscriptions/family/FamilyManagement.css';
import family_img from '@/assets/images/commerce/Family_Plan.png'

interface FamilyMember {
    member_id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture: string | null;
    is_owner: boolean;
}

interface FamilyData {
    family_id: number;
    owner_id: number;
    is_owner: boolean;
    max_members: number;
    members: FamilyMember[];
}

interface SearchResult {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
}

function FamilyManagement() {
    const navigate = useNavigate();

    const [family, setFamily] = useState<FamilyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchEmail, setSearchEmail] = useState('');
    const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
    const [searchError, setSearchError] = useState('');
    const [searching, setSearching] = useState(false);

    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState('');
    const [addSuccess, setAddSuccess] = useState('');

    const [leaving, setLeaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        loadFamily();
    }, []);

    const loadFamily = async () => {
        try {
            const data = await getMyFamily();
            setFamily(data);
            setLoading(false);
        } catch (err) {
            setError('No family plan found');
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchEmail.trim()) return;
        setSearching(true);
        setSearchError('');
        setSearchResult(null);
        setAddError('');
        setAddSuccess('');
        try {
            const result = await searchUserByEmail(searchEmail.trim());
            setSearchResult(result);
        } catch (err) {
            setSearchError('No user found with that email');
        }
        setSearching(false);
    };

    const handleAdd = async () => {
        if (!searchResult) return;
        setAdding(true);
        setAddError('');
        setAddSuccess('');
        try {
            await addFamilyMember(searchResult.user_id);
            setAddSuccess(`${searchResult.first_name} added successfully!`);
            setSearchResult(null);
            setSearchEmail('');
            await loadFamily();
        } catch (err) {
            if (err instanceof Error) {
                setAddError(err.message);
            } else {
                setAddError('Failed to add member');
            }
        }
        setAdding(false);
    };

    const handleLeave = async () => {
        setShowConfirm(true);
    };

    const confirmLeave = async () => {
        setLeaving(true);
        try {
            await leaveFamily();
            navigate('/dashboard');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
            setLeaving(false);
        }
    };

    if (loading) return <div className="family-loading">Loading family...</div>;

    if (error || !family) return (
        <div className="family-no-plan">
            <div className="family-no-plan-icon">
                <img
                    className="family_image"
                    src={family_img}
                    alt="👨‍👩‍👧‍👦"
                >
                </img>
            </div>
            <h2>No Family Plan</h2>
            <p>You don't have an active family plan subscription.</p>
            <button className="family-primary-btn" onClick={() => navigate('/plans')}>
                View Plans
            </button>
        </div>
    );

    return (
        <div className="family-container">
            {showConfirm && (
                <Alert
                    message="Are you sure you want to leave this family plan? You will lose premium access immediately."
                    type="confirm"
                    onConfirm={confirmLeave}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
            <div className="family-header">
                <h1>Family Plan</h1>
                <p>Manage your family members</p>
            </div>

            <div className="family-counter-card">
                <div className="family-counter">
                    <span className="family-counter-num">{family.members.length}</span>
                    <span className="family-counter-sep">/</span>
                    <span className="family-counter-max">{family.max_members}</span>
                </div>
                <div className="family-counter-label">members</div>
                <div className="family-counter-bar">
                    <div
                        className="family-counter-fill"
                        style={{ width: `${(family.members.length / family.max_members) * 100}%` }}
                    />
                </div>
            </div>

            <div className="family-section">
                <h2>Members</h2>
                <div className="family-members-list">
                    {family.members.map((member) => (
                        <div key={member.member_id} className="family-member-row">
                            <div className="family-member-avatar">
                                {member.first_name?.[0]}{member.last_name?.[0]}
                            </div>
                            <div className="family-member-info">
                                <span className="family-member-name">
                                    {member.first_name} {member.last_name}
                                    {member.is_owner && (
                                        <span className="family-owner-badge">Owner</span>
                                    )}
                                </span>
                                <span className="family-member-email">{member.email}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {family.is_owner && family.members.length < family.max_members && (
                <div className="family-section">
                    <h2>Add Member</h2>
                    <div className="family-search-row">
                        <input
                            type="email"
                            className="family-search-input"
                            placeholder="Enter email address"
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button
                            className="family-search-btn"
                            onClick={handleSearch}
                            disabled={searching || !searchEmail.trim()}
                        >
                            {searching ? '...' : 'Search'}
                        </button>
                    </div>

                    {searchError && <p className="family-error">{searchError}</p>}

                    {searchResult && (
                        <div className="family-search-result">
                            <div className="family-member-avatar">
                                {searchResult.first_name?.[0]}{searchResult.last_name?.[0]}
                            </div>
                            <div className="family-member-info">
                                <span className="family-member-name">
                                    {searchResult.first_name} {searchResult.last_name}
                                </span>
                                <span className="family-member-email">{searchResult.email}</span>
                            </div>
                            <button
                                className="family-add-btn"
                                onClick={handleAdd}
                                disabled={adding}
                            >
                                {adding ? '...' : 'Add'}
                            </button>
                        </div>
                    )}

                    {addError && <p className="family-error">{addError}</p>}
                    {addSuccess && <p className="family-success">{addSuccess}</p>}
                </div>
            )}

            {family.is_owner && family.members.length >= family.max_members && (
                <div className="family-full-notice">
                    Your family plan is full! ({family.max_members}/{family.max_members} members)
                </div>
            )}

            {!family.is_owner && (
                <div className="family-leave-section">
                    <button
                        className="family-leave-btn"
                        onClick={handleLeave}
                        disabled={leaving}
                    >
                        {leaving ? 'Leaving...' : 'Leave Family Plan'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default FamilyManagement;