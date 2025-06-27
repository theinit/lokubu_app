import React, { useState, useMemo } from 'react';

interface CalendarProps {
  mode: 'availability' | 'booking';
  availableDates?: string[]; // YYYY-MM-DD format, for booking mode
  initialSelectedDates?: string[]; // for availability mode
  onSelectionChange: (selected: string[]) => void;
}

const Calendar: React.FC<CalendarProps> = ({ mode, availableDates = [], initialSelectedDates = [], onSelectionChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set(initialSelectedDates));
  const [selectedBookingDate, setSelectedBookingDate] = useState<string | null>(null);

  const availableDatesSet = useMemo(() => new Set(availableDates), [availableDates]);

  const changeMonth = (amount: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };

  const handleDateClick = (dateStr: string, isDisabled: boolean) => {
    if (isDisabled) return;

    if (mode === 'availability') {
      const newSelectedDates = new Set(selectedDates);
      if (newSelectedDates.has(dateStr)) {
        newSelectedDates.delete(dateStr);
      } else {
        newSelectedDates.add(dateStr);
      }
      setSelectedDates(newSelectedDates);
      onSelectionChange(Array.from(newSelectedDates));
    } else if (mode === 'booking') {
        if(availableDatesSet.has(dateStr)) {
            setSelectedBookingDate(dateStr);
            onSelectionChange([dateStr]);
        }
    }
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between pb-2">
      <button type="button" onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-600 transition-colors">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
      <div className="text-lg font-semibold">
        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </div>
      <button type="button" onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-600 transition-colors">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );

  const renderDays = () => {
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return (
      <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">
        {daysOfWeek.map((day, i) => <div key={i}>{day}</div>)}
      </div>
    );
  };

  const renderCells = () => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0,0,0,0);

    const cells = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="w-full h-10"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      const isPast = date < today;
      let isDisabled = isPast;
      if (mode === 'booking') {
        isDisabled = isPast || !availableDatesSet.has(dateStr);
      }

      let cellClasses = 'w-full h-10 flex items-center justify-center rounded-full text-sm transition-colors ';
      const isSelected = mode === 'availability' ? selectedDates.has(dateStr) : selectedBookingDate === dateStr;
      
      if (isDisabled) {
        cellClasses += 'text-gray-600 cursor-not-allowed';
      } else {
        cellClasses += 'cursor-pointer hover:bg-gray-600 ';
        if (isSelected) {
          cellClasses += 'bg-teal-500 text-white font-bold ';
        } else if (mode === 'booking' && availableDatesSet.has(dateStr)) {
            cellClasses += 'bg-teal-900/50 text-teal-300 font-semibold';
        }
        else {
          cellClasses += 'text-gray-200 ';
        }
      }

      cells.push(
        <div key={day} className="p-1">
            <button type="button" onClick={() => handleDateClick(dateStr, isDisabled)} className={cellClasses} disabled={isDisabled}>
                {day}
            </button>
        </div>
      );
    }
    return <div className="grid grid-cols-7">{cells}</div>;
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default Calendar;