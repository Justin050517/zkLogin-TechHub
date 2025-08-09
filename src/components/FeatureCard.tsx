import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  highlight?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  highlight = false 
}) => {
  return (
    <div className={`
      p-6 rounded-xl border transition-all duration-300 hover:shadow-lg
      ${highlight 
        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200' 
        : 'bg-white border-gray-200 hover:border-gray-300'
      }
    `}>
      <div className={`
        w-12 h-12 rounded-lg flex items-center justify-center mb-4
        ${highlight ? 'bg-blue-600' : 'bg-gray-100'}
      `}>
        <Icon className={`w-6 h-6 ${highlight ? 'text-white' : 'text-gray-600'}`} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
