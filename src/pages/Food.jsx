import React, { useState } from 'react';
import '../styles/Food.css';
import '../styles/Dashboard.css';
import Sidebar from '../components/Sidebar';
import { useAuth } from "../context/AuthContext";
import Chatbot from '../components/Chatbot';
import { Link, useNavigate } from 'react-router-dom';
import useTheme from '../hooks/useTheme';

function CustomDropdown({ label, options, selected, setSelected }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="dropdown">
      <label>{label}</label>
      <div className="dropdown-header" onClick={() => setIsOpen(!isOpen)}>
        {selected || `Choose an option...`}
        <span className="arrow">{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <ul className="dropdown-list">
          {options.map((opt) => (
            <li key={opt} onClick={() => { setSelected(opt); setIsOpen(false); }}>
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CustomRadioGroup({ label, options, selected, setSelected }) {
  return (
    <div className="radio-group">
      <label>{label}</label>
      <div className="radio-options">
        {options.map((opt) => (
          <div
            key={opt}
            className={`radio-option ${selected === opt ? 'selected' : ''}`}
            onClick={() => setSelected(opt)}
          >
            <span className="radio-circle">{selected === opt && <span className="dot" />}</span>
            {opt}
          </div>
        ))}
      </div>
    </div>
  );
}

function Food() {
  const { user } = useAuth();  
  const navigate = useNavigate();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [prepType, setPrepType] = useState('');
  const [spiceLevel, setSpiceLevel] = useState('');

    const theme = useTheme();
  
    const isLightMode = ['light', 'pinkgummy', 'sunset'].includes(theme);

    const iconPath = isLightMode ? '/assets/icons/light/' : '/assets/icons/';

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/foodlist', {
      state: {
        selectedTime,
        selectedType,
        prepType,
        spiceLevel,
      },
    });
  };

  return (
    <div className='page'>
      <Sidebar />
      <div className="Food">
        <h1>What are you in the mood for?</h1>
        <Link to='/dashboard'>← Back</Link>

        <div className="Food-options">
          <h2>
            <img className='icon' src={`${iconPath}food2.svg`} alt="Food icon" />
            Snack/Meal
          </h2>

          <form onSubmit={handleSubmit}>
            <CustomRadioGroup
              label="Preparation Type"
              options={['Make it at home from scratch', 'Order out (Fast food)']}
              selected={prepType}
              setSelected={setPrepType}
            />

            <CustomDropdown
              label="Time of Day"
              options={['Breakfast', 'Lunch', 'Dinner', 'Snack']}
              selected={selectedTime}
              setSelected={setSelectedTime}
            />
            
            <CustomRadioGroup
              label="Spice Level"
              options={['Not spicy', 'Spicy']}
              selected={spiceLevel}
              setSelected={setSpiceLevel}
            />

            <CustomDropdown
              label="Food type"
              options={['Local', 'Fast Food', 'Healthy', 'Dessert']}
              selected={selectedType}
              setSelected={setSelectedType}
            />

            <input type="submit" className="primary-btn" value="Get Recommendation" />
          </form>
        </div>
      </div>

      {user && <Chatbot />}
    </div>
  );
}

export default Food;