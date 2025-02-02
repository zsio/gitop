


export default function Colors() {
    return (
        <div>
            <ul className="flex gap-2 flex-wrap p-4">
                {[
                    'primary',
                    'foreground',
                    'background',
                    'card',
                    'card-foreground',
                    'popover',
                    'popover-foreground', 
                    'primary-foreground',
                    'secondary',
                    'secondary-foreground',
                    'muted',
                    'muted-foreground',
                    'accent',
                    'accent-foreground',
                    'destructive',
                    'destructive-foreground',
                    'border',
                    'input',
                    'ring'
                ].map(color => (
                    <li key={color} className="border p-2">
                        <div className={`w-10 h-10 bg-${color}`}></div>
                        <div className={`text-${color}`}>{color}</div>
                    </li>
                ))}
            </ul>
        </div>
    )
}