import {
  FiHome,
  FiUser,
  FiSettings,
  FiLogOut,
  FiLayers,
  FiFileText,
  FiCheckSquare,
  FiClock,
  FiGrid,
  FiBarChart2,
} from "react-icons/fi"
import type { IconType } from "react-icons"
 
export type SidebarSubItem = {
  id: string
  label: string
  href: string
}
 
export type SidebarItem = {
  id: string
  label: string
  icon: IconType
  href?: string
  children?: SidebarSubItem[]
}
 
export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: FiHome,
    href: "/Dashboard",
  },
 
{
  
    id: "users",
    label: "Users",
    icon: FiUser,
    href: "/Users",
  },
{
    id: "employees",
    label: "Employees",
    icon: FiCheckSquare,
    href: "/Employees",
},
{
    id: "roles",
    label: "Roles",
    icon: FiLayers,   
    href: "/Roles",
},

 
  {
    id: "logout",
    label: "Logout",
    icon: FiLogOut,
  },
]
 
 