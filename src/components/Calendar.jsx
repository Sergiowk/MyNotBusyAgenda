export default function Calendar() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();

    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    // Adjust so Monday = 0, Sunday = 6
    const firstDayAdjusted = firstDay === 0 ? 6 : firstDay - 1;

    // Get number of days in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Get month name
    const monthName = today.toLocaleString('default', { month: 'long' });

    // Generate calendar days
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayAdjusted; i++) {
        days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
    }

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <div className="mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {monthName} {currentYear}
                </h3>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {/* Week day headers */}
                {weekDays.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs font-medium py-2"
                        style={{ color: 'var(--color-text-tertiary)' }}
                    >
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {days.map((day, index) => (
                    <div
                        key={index}
                        className="aspect-square flex items-center justify-center text-sm rounded-lg transition-colors"
                        style={{
                            backgroundColor: day === currentDay ? 'var(--color-accent)' : 'transparent',
                            color: day === currentDay ? '#ffffff' : day ? 'var(--color-text-primary)' : 'transparent',
                            fontWeight: day === currentDay ? '600' : '400'
                        }}
                    >
                        {day || ''}
                    </div>
                ))}
            </div>
        </div>
    );
}
