import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardCheck,
  Calendar,
  PhoneCall,
  Send,
  StickyNote,
  LogOut,
} from "lucide-react"

export const SIDEBAR_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },

  {
    id: "customers",
    label: "Customers",
    icon: Users,
    href: "/dashboard/customers",
  },

  {
    id: "services",
    label: "Services",
    icon: FileText,
    children: [
      {
        id: "planning",
        label: "Planning",
        href: "/dashboard/services/planning",
      },
      {
        id: "drawing",
        label: "Drawing",
        href: "/dashboard/services/drawing",
      },
    ],
  },

  {
    id: "eligibility",
    label: "Eligibility Check",
    icon: ClipboardCheck,
    href: "/dashboard/eligibility",
  },

  {
    id: "appointments",
    label: "Appointments",
    icon: Calendar,
    href: "/dashboard/appointments",
  },

  {
    id: "coordination",
    label: "Customer Coordination",
    icon: PhoneCall,
    href: "/dashboard/coordination",
  },

  {
    id: "reports", // divider trigger
  },

  {
    id: "submit",
    label: "Submit to Agent Y",
    icon: Send,
    href: "/dashboard/submit",
  },

  {
    id: "crm",
    label: "CRM & Notes",
    icon: StickyNote,
    href: "/dashboard/crm",
  },

  {
    id: "logout",
    label: "Logout",
    icon: LogOut,
  },
]
