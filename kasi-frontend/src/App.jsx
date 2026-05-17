import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001';

// Styles
const styles = {
  container: {
    maxWidth: '420px',
    margin: '0 auto',
    minHeight: '100vh',
    background: '#fff',
    position: 'relative'
  },
  header: {
    background: '#6366f1',
    color: '#fff',
    padding: '20px',
    textAlign: 'center'
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold'
  },
  // Login
  loginContainer: {
    padding: '40px 20px',
    textAlign: 'center'
  },
  loginTitle: {
    fontSize: '20px',
    marginBottom: '30px',
    color: '#333'
  },
  userButton: {
    display: 'block',
    width: '100%',
    padding: '15px',
    marginBottom: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    background: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
    textAlign: 'left'
  },
  // Dashboard
  safeToSpend: {
    background: '#f0fdf4',
    padding: '30px 20px',
    textAlign: 'center'
  },
  safeLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px'
  },
  safeAmount: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#16a34a'
  },
  section: {
    padding: '20px'
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
    marginBottom: '12px',
    textTransform: 'uppercase'
  },
  budgetBar: {
    marginBottom: '12px'
  },
  budgetLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    marginBottom: '4px'
  },
  budgetTrack: {
    height: '8px',
    background: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  budgetFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s'
  },
  billItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6'
  },
  nudgeBanner: {
    background: '#fef3c7',
    padding: '12px 20px',
    fontSize: '14px',
    color: '#92400e'
  },
  // Tabs
  tabBar: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    background: '#fff',
    borderTop: '1px solid #e5e7eb'
  },
  tab: {
    flex: 1,
    padding: '12px',
    textAlign: 'center',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#666'
  },
  tabActive: {
    color: '#6366f1',
    fontWeight: '600'
  },
  // Chat
  chatContainer: {
    padding: '20px',
    paddingBottom: '140px'
  },
  chatMessages: {
    marginBottom: '20px'
  },
  chatBubble: {
    padding: '12px 16px',
    borderRadius: '16px',
    marginBottom: '8px',
    maxWidth: '85%'
  },
  chatUser: {
    background: '#6366f1',
    color: '#fff',
    marginLeft: 'auto'
  },
  chatBot: {
    background: '#f3f4f6',
    color: '#333'
  },
  chatInputContainer: {
    position: 'fixed',
    bottom: '60px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '420px',
    padding: '12px 20px',
    background: '#fff',
    borderTop: '1px solid #e5e7eb'
  },
  chatInput: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '24px',
    fontSize: '14px',
    outline: 'none'
  },
  starterQuestions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '16px'
  },
  starterBtn: {
    padding: '8px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    background: '#fff',
    fontSize: '12px',
    cursor: 'pointer'
  },
  logoutBtn: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px'
  }
};

// Login Screen
function LoginScreen({ onLogin }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/users`)
      .then(res => res.json())
      .then(setUsers)
      .catch(() => {
        // Fallback if backend not running
        setUsers([
          { id: 'user_001', name: 'Mei Ling' },
          { id: 'user_002', name: 'Jason' },
          { id: 'user_003', name: 'Hakim' },
          { id: 'user_004', name: 'Shoko' }
        ]);
      });
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>Kasi</div>
        <div style={{ fontSize: '14px', opacity: 0.8 }}>Your Finance Companion</div>
      </div>
      <div style={styles.loginContainer}>
        <div style={styles.loginTitle}>Select a user to continue:</div>
        {users.map(user => (
          <button
            key={user.id}
            style={styles.userButton}
            onClick={() => onLogin(user.id)}
          >
            {user.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// Dashboard Screen
function Dashboard({ data, nudge }) {
  const getBudgetColor = (percentage) => {
    if (percentage >= 100) return '#ef4444';
    if (percentage >= 80) return '#f59e0b';
    return '#22c55e';
  };

  return (
    <div style={{ paddingBottom: '70px' }}>
      {nudge && <div style={styles.nudgeBanner}>⚠️ {nudge}</div>}
      
      <div style={styles.safeToSpend}>
        <div style={styles.safeLabel}>Safe to spend today</div>
        <div style={styles.safeAmount}>RM {data.account.safe_to_spend}</div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          Total balance: RM {data.account.balance}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Budget Status</div>
        {data.budgetStatus.map(b => (
          <div key={b.category} style={styles.budgetBar}>
            <div style={styles.budgetLabel}>
              <span>{b.category}</span>
              <span style={{ color: b.over ? '#ef4444' : '#666' }}>
                RM {b.spent} / RM {b.limit}
              </span>
            </div>
            <div style={styles.budgetTrack}>
              <div style={{
                ...styles.budgetFill,
                width: `${Math.min(b.percentage, 100)}%`,
                background: getBudgetColor(b.percentage)
              }} />
            </div>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Saving Goal: {data.user.saving_goal}</div>
        <div style={styles.budgetBar}>
          <div style={styles.budgetLabel}>
            <span>RM {data.user.saving_goal_saved} saved</span>
            <span>RM {data.user.saving_goal_amount} target</span>
          </div>
          <div style={styles.budgetTrack}>
            <div style={{
              ...styles.budgetFill,
              width: `${data.savingProgress}%`,
              background: '#6366f1'
            }} />
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Upcoming Bills</div>
        {data.upcomingBills.length === 0 ? (
          <div style={{ color: '#666', fontSize: '14px' }}>No bills due soon</div>
        ) : (
          data.upcomingBills.map(bill => (
            <div key={bill.id} style={styles.billItem}>
              <span>{bill.name}</span>
              <span>RM {bill.amount} • {bill.due_date}</span>
            </div>
          ))
        )}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Recent Transactions</div>
        {data.recentTransactions.map(txn => (
          <div key={txn.id} style={styles.billItem}>
            <div>
              <div>{txn.merchant}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{txn.category}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div>RM {txn.amount}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{txn.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Chat Screen
function ChatScreen({ userId, userName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const starterQuestions = [
    "Can I afford lunch today?",
    "How am I doing this month?",
    "Should I buy this?",
    "When's my next bill due?"
  ];

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: text, history })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      setHistory(data.updatedHistory);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I couldn\'t connect to the server. Make sure the backend is running!' 
      }]);
    }
    
    setLoading(false);
  };

  return (
    <div style={styles.chatContainer}>
      {messages.length === 0 && (
        <>
          <div style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
            Hi {userName}! Ask me anything about your finances.
          </div>
          <div style={styles.starterQuestions}>
            {starterQuestions.map(q => (
              <button
                key={q}
                style={styles.starterBtn}
                onClick={() => sendMessage(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </>
      )}
      
      <div style={styles.chatMessages}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.chatBubble,
              ...(msg.role === 'user' ? styles.chatUser : styles.chatBot)
            }}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div style={{ ...styles.chatBubble, ...styles.chatBot }}>
            Thinking...
          </div>
        )}
      </div>

      <div style={styles.chatInputContainer}>
        <input
          style={styles.chatInput}
          placeholder="Ask Kasi..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage(input)}
        />
      </div>
    </div>
  );
}

// Main App
export default function App() {
  const [userId, setUserId] = useState(null);
  const [tab, setTab] = useState('home');
  const [dashboardData, setDashboardData] = useState(null);
  const [nudge, setNudge] = useState(null);

  useEffect(() => {
    if (userId) {
      // Fetch dashboard data
      fetch(`${API_URL}/dashboard/${userId}`)
        .then(res => res.json())
        .then(setDashboardData)
        .catch(console.error);

      // Fetch nudge
      fetch(`${API_URL}/nudge/${userId}`)
        .then(res => res.json())
        .then(data => setNudge(data.nudge))
        .catch(console.error);
    }
  }, [userId]);

  const handleLogout = () => {
    setUserId(null);
    setDashboardData(null);
    setNudge(null);
    setTab('home');
  };

  if (!userId) {
    return <LoginScreen onLogin={setUserId} />;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>Kasi</div>
        {dashboardData && (
          <div style={{ fontSize: '14px', opacity: 0.8 }}>
            Hi, {dashboardData.user.name}
          </div>
        )}
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {tab === 'home' && dashboardData && (
        <Dashboard data={dashboardData} nudge={nudge} />
      )}
      
      {tab === 'chat' && dashboardData && (
        <ChatScreen userId={userId} userName={dashboardData.user.name} />
      )}

      <div style={styles.tabBar}>
        <button
          style={{ ...styles.tab, ...(tab === 'home' ? styles.tabActive : {}) }}
          onClick={() => setTab('home')}
        >
          🏠 Home
        </button>
        <button
          style={{ ...styles.tab, ...(tab === 'chat' ? styles.tabActive : {}) }}
          onClick={() => setTab('chat')}
        >
          💬 Ask Kasi
        </button>
      </div>
    </div>
  );
}
