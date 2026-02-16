import { useSchoolSettings } from '@/contexts/school-settings-context';

/**
 * Hook to get theme-aware CSS classes based on school settings
 */
export function useThemeColor() {
  const { settings } = useSchoolSettings();

  const getButtonClasses = () => {
    const colorMap: Record<string, string> = {
      '#3B82F6': 'bg-blue-600 hover:bg-blue-700',
      '#10B981': 'bg-green-600 hover:bg-green-700',
      '#F59E0B': 'bg-amber-600 hover:bg-amber-700',
      '#EF4444': 'bg-red-600 hover:bg-red-700',
    };
    return colorMap[settings?.primaryColor || '#3B82F6'] || 'bg-blue-600 hover:bg-blue-700';
  };

  const getBadgeClasses = () => {
    const colorMap: Record<string, string> = {
      '#3B82F6': 'bg-blue-100 text-blue-800',
      '#10B981': 'bg-green-100 text-green-800',
      '#F59E0B': 'bg-amber-100 text-amber-800',
      '#EF4444': 'bg-red-100 text-red-800',
    };
    return colorMap[settings?.primaryColor || '#3B82F6'] || 'bg-blue-100 text-blue-800';
  };

  const getTextClasses = () => {
    const colorMap: Record<string, string> = {
      '#3B82F6': 'text-blue-600',
      '#10B981': 'text-green-600',
      '#F59E0B': 'text-amber-600',
      '#EF4444': 'text-red-600',
    };
    return colorMap[settings?.primaryColor || '#3B82F6'] || 'text-blue-600';
  };

  const getBorderClasses = () => {
    const colorMap: Record<string, string> = {
      '#3B82F6': 'border-blue-600',
      '#10B981': 'border-green-600',
      '#F59E0B': 'border-amber-600',
      '#EF4444': 'border-red-600',
    };
    return colorMap[settings?.primaryColor || '#3B82F6'] || 'border-blue-600';
  };

  const getBackgroundClasses = () => {
    const colorMap: Record<string, string> = {
      '#3B82F6': 'bg-blue-50',
      '#10B981': 'bg-green-50',
      '#F59E0B': 'bg-amber-50',
      '#EF4444': 'bg-red-50',
    };
    return colorMap[settings?.primaryColor || '#3B82F6'] || 'bg-blue-50';
  };

  return {
    primaryColor: settings?.primaryColor || '#3B82F6',
    buttonClasses: getButtonClasses(),
    badgeClasses: getBadgeClasses(),
    textClasses: getTextClasses(),
    borderClasses: getBorderClasses(),
    backgroundClasses: getBackgroundClasses(),
  };
}
