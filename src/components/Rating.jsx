import React from 'react';
import { Star } from 'lucide-react';

const Rating = ({ value, max = 5, size = 16, className = "" }) => {
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {[...Array(max)].map((_, i) => (
                <Star
                    key={i}
                    size={size}
                    className={`${i < Math.floor(value)
                            ? 'fill-secondary text-secondary'
                            : i < value
                                ? 'fill-secondary/50 text-secondary'
                                : 'text-text-muted'
                        }`}
                />
            ))}
            {value && <span className="text-xs font-medium text-text-secondary ml-1">{value}</span>}
        </div>
    );
};

export default Rating;
