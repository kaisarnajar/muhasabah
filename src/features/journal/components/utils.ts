export function getSubjectColor(subject: string) {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' }, // Blue
    { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' }, // Green
    { bg: '#faf5ff', text: '#6b21a8', border: '#e9d5ff' }, // Purple
    { bg: '#fff7ed', text: '#9a3412', border: '#ffedd5' }, // Orange
    { bg: '#fdf2f8', text: '#9d174d', border: '#fbcfe8' }, // Pink
    { bg: '#ecfeff', text: '#155e75', border: '#c5f2f7' }, // Cyan
    { bg: '#f0fdfa', text: '#115e59', border: '#99f6e4' }  // Teal
  ];
  const idx = Math.abs(hash) % colors.length;
  return colors[idx];
}

export function getWorkTypeStyle(type: string) {
  switch (type) {
    case 'Feature':
      return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' }; // Sky
    case 'Bug Fix':
      return { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' }; // Red
    case 'Refactor':
      return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' }; // Amber
    case 'Meeting':
      return { bg: '#f3e8ff', text: '#6b21a8', border: '#e9d5ff' }; // Purple
    case 'Deployment':
      return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' }; // Green
    case 'Support':
      return { bg: '#ecfeff', text: '#0e7490', border: '#c5f2f7' }; // Cyan
    default:
      return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' }; // Gray
  }
}

export function getMiscActivityStyle(activity: string) {
  switch (activity) {
    case 'Projects':
      return { bg: '#e0f2fe', text: '#0284c7', border: '#bae6fd' }; // Sky / Blue
    case 'Movies & Shows':
      return { bg: '#f3e8ff', text: '#7e22ce', border: '#e9d5ff' }; // Purple
    case 'Courses & Education':
      return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' }; // Amber
    case 'Self Improvement':
      return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' }; // Green
    case 'Travel':
      return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' }; // Sky
    case 'Food':
      return { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' }; // Orange
    case 'Social':
      return { bg: '#fce7f3', text: '#be185d', border: '#fbcfe8' }; // Pink
    case 'Shopping':
      return { bg: '#f3e8ff', text: '#6b21a8', border: '#e9d5ff' }; // Purple
    case 'Health':
      return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' }; // Green
    case 'Thoughts':
      return { bg: '#e2fbf7', text: '#0f766e', border: '#99f6e4' }; // Teal
    case 'Entertainment':
      return { bg: '#e0e7ff', text: '#4338ca', border: '#c7d2fe' }; // Indigo
    case 'Family':
      return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' }; // Red
    case 'Spiritual':
      return { bg: '#e6fffa', text: '#0d9488', border: '#b2f5ea' }; // Emerald/Teal-ish
    case 'Finance':
      return { bg: '#ecfeff', text: '#0891b2', border: '#c5f2f7' }; // Cyan
    case 'Hobby':
      return { bg: '#fff7ed', text: '#ea580c', border: '#ffedd5' }; // Light Orange
    default:
      return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' }; // Gray
  }
}
