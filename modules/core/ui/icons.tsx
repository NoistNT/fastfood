// Centralized icon system for consistent usage across the application
// Using Lucide React for consistent iconography

import {
  // Navigation & UI
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Search,
  Plus,
  Minus,
  Settings,
  User,
  LogOut,
  Home,
  RefreshCw,

  // Status & Feedback
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Bell,
  BellOff,
  Wifi,
  WifiOff,
  Clock,

  // Business & Data
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  Download,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldX,
  RotateCcw,
  Calendar,

  // Actions
  Check,
  Circle,
} from 'lucide-react';

// Re-export with consistent naming
export const Icons = {
  // Navigation
  menu: Menu,
  close: X,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  more: MoreHorizontal,

  // Actions
  search: Search,
  add: Plus,
  remove: Minus,
  edit: Edit,
  delete: Trash2,
  download: Download,
  refresh: RefreshCw,
  undo: RotateCcw,

  // Status
  loading: Loader2,
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Bell,
  bellOff: BellOff,

  // Connectivity
  online: Wifi,
  offline: WifiOff,
  clock: Clock,

  // Business
  package: Package,
  cart: ShoppingCart,
  users: Users,
  dollar: DollarSign,
  trending: TrendingUp,
  file: FileText,
  calendar: Calendar,

  // User
  user: User,
  settings: Settings,
  logout: LogOut,
  home: Home,

  // Forms
  eye: Eye,
  eyeOff: EyeOff,
  lock: Lock,
  mail: Mail,
  forbidden: ShieldX,

  // UI Components
  check: Check,
  circle: Circle,
} as const;

// Type for icon names
export type IconName = keyof typeof Icons;

// Helper component for consistent icon usage
interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
}

export function Icon({ name, className, size = 16 }: IconProps) {
  const IconComponent = Icons[name];
  return (
    <IconComponent
      className={className}
      size={size}
    />
  );
}
