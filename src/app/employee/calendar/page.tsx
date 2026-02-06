'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'work' | 'weekend' | 'meeting' | 'holiday' | 'personal';
  date: Date;
}

const EVENT_COLORS = {
  work: 'bg-blue-100 text-blue-800 border-blue-300',
  weekend: 'bg-purple-100 text-purple-800 border-purple-300',
  meeting: 'bg-green-100 text-green-800 border-green-300',
  holiday: 'bg-red-100 text-red-800 border-red-300',
  personal: 'bg-yellow-100 text-yellow-800 border-yellow-300',
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: '1', title: 'Work', type: 'work', date: new Date(2026, 0, 1) },
    { id: '2', title: 'Work', type: 'work', date: new Date(2026, 0, 2) },
    { id: '3', title: 'Weekend', type: 'weekend', date: new Date(2026, 0, 3) },
    { id: '4', title: 'Weekend', type: 'weekend', date: new Date(2026, 0, 4) },
  ]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    const firstDayOfWeek = firstDay.getDay();
    const lastDateOfMonth = lastDay.getDate();
    const prevLastDate = prevLastDay.getDate();
    
    const days: Array<{
      date: number;
      month: 'prev' | 'current' | 'next';
      fullDate: Date;
    }> = [];
    
    // Previous month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevLastDate - i,
        month: 'prev',
        fullDate: new Date(year, month - 1, prevLastDate - i),
      });
    }
    
    // Current month days
    for (let i = 1; i <= lastDateOfMonth; i++) {
      days.push({
        date: i,
        month: 'current',
        fullDate: new Date(year, month, i),
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        month: 'next',
        fullDate: new Date(year, month + 1, i),
      });
    }
    
    return days;
  }, [currentDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    );
  };

  const handleDateClick = (date: Date, month: 'prev' | 'current' | 'next') => {
    if (month !== 'current') {
      // Navigate to the clicked month
      if (month === 'prev') {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
      } else {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
      }
    }
    setSelectedDate(date);
    setShowEventModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-1">
                Employee Calendar
              </h1>
              <p className="text-slate-500">Manage your schedule and events</p>
            </div>
            
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold text-slate-700">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              
              <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-white rounded-md transition-all duration-200 hover:shadow-sm"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={20} className="text-slate-700" />
                </button>
                
                <button
                  onClick={goToToday}
                  className="px-4 py-2 hover:bg-white rounded-md transition-all duration-200 font-medium text-sm text-slate-700 hover:shadow-sm"
                >
                  Today
                </button>
                
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-white rounded-md transition-all duration-200 hover:shadow-sm"
                  aria-label="Next month"
                >
                  <ChevronRight size={20} className="text-slate-700" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 bg-gradient-to-r from-slate-700 to-slate-800">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="py-4 text-center text-sm font-bold text-white uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDate(day.fullDate);
              const isTodayDate = isToday(day.fullDate);
              const isCurrentMonth = day.month === 'current';

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(day.fullDate, day.month)}
                  className={`
                    min-h-[120px] p-3 border border-slate-200 
                    transition-all duration-200 hover:bg-slate-50 hover:shadow-inner
                    text-left relative group
                    ${!isCurrentMonth ? 'bg-slate-50/50' : 'bg-white'}
                    ${isTodayDate ? 'ring-2 ring-blue-500 ring-inset' : ''}
                  `}
                >
                  <div className="flex flex-col h-full">
                    <span
                      className={`
                        text-sm font-semibold mb-2 inline-block
                        ${!isCurrentMonth ? 'text-slate-400' : 'text-slate-700'}
                        ${isTodayDate ? 'bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center' : ''}
                      `}
                    >
                      {day.date}
                    </span>

                    <div className="flex-1 space-y-1 overflow-y-auto max-h-20">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={`
                            text-xs px-2 py-1 rounded border
                            ${EVENT_COLORS[event.type]}
                            truncate
                          `}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-slate-500 font-medium px-2">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>

                    {/* Hover effect - Add event button */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-blue-500 text-white rounded-full p-1 shadow-lg">
                        <Plus size={14} />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Event Modal */}
        {showEventModal && selectedDate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">
                    {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {selectedDate.getFullYear()}
                  </p>
                </div>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-slate-600" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                    <Plus size={20} />
                    Add New Event
                  </button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-700 mb-3">
                    Events on this day
                  </h4>
                  {getEventsForDate(selectedDate).length > 0 ? (
                    getEventsForDate(selectedDate).map((event) => (
                      <div
                        key={event.id}
                        className={`
                          p-4 rounded-lg border-l-4
                          ${EVENT_COLORS[event.type]}
                          hover:shadow-md transition-shadow
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-semibold">{event.title}</h5>
                            <p className="text-xs mt-1 capitalize">{event.type}</p>
                          </div>
                          <button className="text-slate-400 hover:text-red-500 transition-colors">
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <p>No events scheduled</p>
                      <p className="text-sm mt-1">Click "Add New Event" to create one</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-semibold text-slate-700 mb-4">Event Types</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(EVENT_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border ${color}`}></div>
                <span className="text-sm text-slate-600 capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
