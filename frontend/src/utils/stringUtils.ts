export const getAvatarColor = (name?: string) => {
    if (!name) return 'bg-slate-500';
    const colors = [
        'bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500',
        'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-fuchsia-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

export const getInitials = (name: string) => {
    if (!name) return 'A';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};
