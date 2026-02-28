import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const ReportCard = ({
  title,
  value,
  change = null,
  icon: Icon = null,
  color = 'blue',
  trend = 'up'
}) => {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200',
    green: 'from-green-50 to-green-100 border-green-200',
    orange: 'from-orange-50 to-orange-100 border-orange-200',
    purple: 'from-purple-50 to-purple-100 border-purple-200',
    red: 'from-red-50 to-red-100 border-red-200',
    yellow: 'from-yellow-50 to-yellow-100 border-yellow-200',
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
  };

  const changeColorClass = trend === 'up' ? 'text-green-600' : 'text-red-600';

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color] || colorClasses.blue} border rounded-lg p-4 md:p-6`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{value}</p>
          
          {change !== null && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? (
                <FaArrowUp className={`text-xs ${changeColorClass}`} />
              ) : (
                <FaArrowDown className={`text-xs ${changeColorClass}`} />
              )}
              <span className={`text-xs font-semibold ${changeColorClass}`}>
                {typeof change === 'number' ? `${Math.abs(change)}%` : change}
              </span>
              <span className="text-xs text-gray-600">vs last period</span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className="flex-shrink-0">
            <Icon className={`${iconColorClasses[color] || iconColorClasses.blue} text-3xl opacity-80`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportCard;
