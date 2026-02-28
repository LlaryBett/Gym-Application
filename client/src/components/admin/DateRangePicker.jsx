import React, { useState } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';

const DateRangePicker = ({ startDate, endDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleStartDateChange = (e) => {
    onChange({
      startDate: new Date(e.target.value),
      endDate
    });
  };

  const handleEndDateChange = (e) => {
    onChange({
      startDate,
      endDate: new Date(e.target.value)
    });
  };

  const presetRanges = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'This year', days: 365 }
  ];

  const handlePreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    onChange({ startDate: start, endDate: end });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
      >
        <FaCalendarAlt className="text-gray-400" />
        <span className="text-sm">
          {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate.toISOString().split('T')[0]}
                  onChange={handleStartDateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate.toISOString().split('T')[0]}
                  onChange={handleEndDateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500 mb-2">Quick Select</p>
              <div className="flex flex-wrap gap-2">
                {presetRanges.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePreset(preset.days)}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;