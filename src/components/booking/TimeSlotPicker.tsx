import { useState } from 'react';
import { format, addHours, setHours, setMinutes, startOfDay, addDays } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface TimeSlotPickerProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  startTime: string;
  onStartTimeChange: (time: string) => void;
  duration: number;
  onDurationChange: (hours: number) => void;
}

const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
];

const durations = [1, 2, 3, 4, 6, 8, 12, 24];

export function TimeSlotPicker({
  selectedDate,
  onDateChange,
  startTime,
  onStartTimeChange,
  duration,
  onDurationChange,
}: TimeSlotPickerProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg font-semibold mb-4">Select Date</h3>
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateChange}
            disabled={(date) => date < startOfDay(new Date())}
            className="rounded-xl border border-border bg-card p-3"
          />
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold mb-4">Start Time</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {timeSlots.map((time) => (
            <button
              key={time}
              onClick={() => onStartTimeChange(time)}
              className={cn(
                "py-2 px-3 rounded-lg text-sm font-medium transition-all",
                startTime === time
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              )}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold mb-4">Duration</h3>
        <div className="grid grid-cols-4 gap-2">
          {durations.map((hours) => (
            <button
              key={hours}
              onClick={() => onDurationChange(hours)}
              className={cn(
                "py-3 px-4 rounded-xl text-sm font-medium transition-all",
                duration === hours
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              )}
            >
              {hours < 24 ? `${hours}h` : '1 day'}
            </button>
          ))}
        </div>
        
        {selectedDate && startTime && (
          <div className="mt-4 p-4 rounded-xl bg-success/10 text-success">
            <p className="font-medium">Your Parking Window:</p>
            <p className="text-sm mt-1">
              {format(selectedDate, 'EEEE, MMMM d')} from {startTime} to{' '}
              {format(
                addHours(
                  setMinutes(setHours(selectedDate, parseInt(startTime.split(':')[0])), parseInt(startTime.split(':')[1])),
                  duration
                ),
                'HH:mm'
              )}
              {duration >= 24 && ` (next day)`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
