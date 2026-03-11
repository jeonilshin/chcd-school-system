'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function ComingSoonPage({ title, description, icon }: ComingSoonPageProps) {
  const { buttonClasses } = useThemeColor();

  const getColorClasses = (type: 'bg' | 'text') => {
    // This will use the theme color from settings
    const colorMap: Record<string, Record<string, string>> = {
      '#3B82F6': { bg: 'bg-blue-600', text: 'text-blue-600' },
      '#10B981': { bg: 'bg-green-600', text: 'text-green-600' },
      '#F59E0B': { bg: 'bg-amber-600', text: 'text-amber-600' },
      '#EF4444': { bg: 'bg-red-600', text: 'text-red-600' },
    };
    // Default to blue if no match
    return colorMap['#3B82F6'][type];
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span>Home</span>
              <span>/</span>
              <span className="text-gray-900">{title}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8 bg-gray-50 flex items-center justify-center">
        <Card className="border-0 shadow-lg max-w-2xl w-full">
          <CardContent className="py-20 text-center">
            <div className="max-w-md mx-auto">
              <div className={`w-24 h-24 ${getColorClasses('bg')} rounded-full flex items-center justify-center mx-auto mb-6`}>
                {icon}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Coming Soon</h2>
              <p className="text-gray-600 text-lg mb-6">
                We're working hard to bring you this feature. It will be available soon!
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-blue-900 mb-2">What to expect:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Comprehensive {title.toLowerCase()} management</li>
                  <li>• Easy-to-use interface</li>
                  <li>• Real-time updates</li>
                  <li>• Detailed reports and analytics</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
